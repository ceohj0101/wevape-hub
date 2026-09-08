#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
허브 새업무 검토 자동 처리 — GitHub Action 전용 (대표 컴퓨터/브라우저 없이 깃허브 서버에서 실행)

하는 일:
  · data.json 을 읽어 (A)새 검토 / (B)담당자 완료보고 확인 대기 를 찾는다
  · 각 건의 제출 본문·지시·담당자 메모·첨부 사진을 Claude API(비전)에게 보내 판정을 받는다
  · 판정을 data.json 에 직접 반영한다(감독관 의견, 보완지시, todo 확인, 단계)
  · 워크플로가 이어서 커밋·푸시한다

안전장치(하드룰):
  · 최종승인은 절대 하지 않는다(대표 전용). 전 항목 통과 시에도 '승인대기'까지만.
  · 규제성 키워드(담배사업법·통신비밀보호법·개인정보·광고·녹음 등)가 걸린 항목은
    자동 통과 금지 — 사람이 확인하도록 'hold'로만 둔다.
  · checks[].fb(직원 피드백)는 절대 건드리지 않는다.
  · 확신이 없으면 통과시키지 않고 무엇을 더 가져와야 하는지 감독관 메모로 남긴다.
  · 같은 상태를 두 번 처리하지 않는다(서명 비교 idempotent).
  · 모든 변경은 '감독관(자동)' 명의로 진행 이력에 남겨 사람이 감사·되돌리기 가능하게 한다.
"""
import os, sys, json, base64, re, hashlib, datetime

DATA = "data.json"
PHOTOS = "photos.json"
MODEL = os.environ.get("HUB_MODEL", "claude-3-5-sonnet-latest")
MAX_PHOTOS_PER_REVIEW = 5

# 자동 통과를 막을 규제·민감 키워드 — 걸리면 사람 확인용 'hold'로만 둔다
RISK_TERMS = ["담배사업법", "통신비밀보호법", "개인정보", "광고", "판촉", "녹음",
              "청소년", "면세", "니코틴", "감청", "동의서", "고지"]

def now_kr():
    # 로그 표기용 (KST) — 페이지의 dkNow 형식과 비슷하게 "MM. DD. 오전/오후 hh:mm"
    kst = datetime.timezone(datetime.timedelta(hours=9))
    d = datetime.datetime.now(kst)
    ap = "오전" if d.hour < 12 else "오후"
    h12 = d.hour % 12 or 12
    return f"{d.month:02d}. {d.day:02d}. {ap} {h12:02d}:{d.minute:02d}"

def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def photo_blocks(pics, keys):
    """photos.json 의 data URL 을 Claude 비전 입력 블록으로."""
    blocks = []
    for k in keys[:MAX_PHOTOS_PER_REVIEW]:
        u = pics.get(k)
        if not u or not isinstance(u, str) or not u.startswith("data:"):
            continue
        m = re.match(r"data:(image/\w+);base64,(.*)", u, re.S)
        if not m:
            continue
        blocks.append({"type": "image", "source": {
            "type": "base64", "media_type": m.group(1), "data": m.group(2)}})
    return blocks

def risk_hit(*texts):
    blob = " ".join(t or "" for t in texts)
    return any(term in blob for term in RISK_TERMS)

def sig(obj):
    return hashlib.sha1(json.dumps(obj, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()[:16]

def ask(client, system, content_blocks, max_tokens=1500):
    msg = client.messages.create(
        model=MODEL, max_tokens=max_tokens, system=system,
        messages=[{"role": "user", "content": content_blocks}])
    text = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        raise ValueError("모델이 JSON을 안 줌: " + text[:200])
    return json.loads(m.group(0))

SYS_B = """너는 위베이프(전자담배 유통) 시스템 허브의 관리감독관이다. 담당자가 보완지시를 완료했다고 보고했다.
첨부 증빙(사진·메모)을 실제로 보고, 각 지시가 충족됐는지 판정하라. 추측으로 통과시키지 마라.
전자담배는 규제 업종이다. 녹음·개인정보·광고·담배사업법·통신비밀보호법이 걸린 항목은 종이(공식 문서/변호사 회신)로 확정되기 전엔 절대 통과시키지 말고 'hold'로 두라.
최종승인은 네 권한이 아니다.
반드시 아래 JSON만 출력하라:
{"reply_append":"감독관 코멘트(한국어, 담당자 인정할 점 먼저, 그다음 남은 것)","decisions":[{"index":<지시번호>,"decision":"pass|reject|hold","c":"근거(무엇을 보고 그렇게 판단했는지)"}]}"""

SYS_A = """너는 위베이프(전자담배 유통) 시스템 허브의 관리감독관이다. 새로 제출된 프로그램 검토 요청을 본다.
제출 본문을 근거로 검토 의견과 보완지시를 작성하라. 전자담배 규제(담배사업법·국민건강증진법·통신비밀보호법·개인정보)를 반드시 짚어라.
보완지시는 각각 「무엇을·언제까지·완료 증빙은 무엇으로」를 포함하고, 지시문 안에 슬래시(/)를 쓰지 마라.
최종승인은 네 권한이 아니다.
반드시 아래 JSON만 출력하라:
{"reply":"감독관 검토 의견(한국어)","todos":[{"t":"지시문(무엇을·언제까지·증빙)"}],"jd":{"v":"go|hold|stop","w":"가치판정 근거"}}"""

def process_B(client, r, pics, log):
    pend = [(i, t) for i, t in enumerate(r.get("todos") or [])
            if isinstance(t, dict) and t.get("d") and not t.get("v")]
    if not pend:
        return False
    state_sig = sig([(i, t.get("n", ""), [p.get("k") for p in (t.get("p") or [])]) for i, t in pend])
    if (r.get("_auto") or {}).get("bsig") == state_sig:
        return False  # 이미 이 상태를 처리함

    blocks = [{"type": "text", "text":
               f"프로그램: {r.get('title','')}\n제출자: {r.get('author','')}\n\n확인 대기 지시:"}]
    keys = []
    for n, (i, t) in enumerate(pend):
        blocks.append({"type": "text", "text":
            f"\n[{n}] 지시: {t.get('t','')}\n    담당자 메모: {t.get('n','') or '(없음)'}"})
        pk = [p.get("k") for p in (t.get("p") or []) if isinstance(p, dict) and p.get("k")]
        keys += pk
    blocks += photo_blocks(pics, keys)

    try:
        out = ask(client, SYS_B, blocks)
    except Exception as e:
        print("  (B) 모델 호출 실패:", e); return False

    dec = {d.get("index"): d for d in out.get("decisions", []) if isinstance(d, dict)}
    changed = False
    for n, (i, t) in enumerate(pend):
        d = dec.get(n) or {}
        decision = d.get("decision", "hold")
        c = (d.get("c") or "").strip()
        # 규제 항목은 자동 통과 금지
        if decision == "pass" and risk_hit(t.get("t"), r.get("title"), t.get("n")):
            decision = "hold"
            c = "[자동 안전장치] 규제·민감 항목이라 자동 통과 보류. 사람이 공식 증빙으로 확인 필요. " + c
        if decision == "pass":
            t["v"] = "ok"; t["d"] = True; t["c"] = "[자동] " + c; changed = True
        elif decision == "reject":
            t["v"] = "no"; t["d"] = False; t["c"] = "[자동] " + c; changed = True
        else:  # hold — 통과도 반려도 아님, 근거만 남기고 사람 확인 대기
            t["c"] = "[자동·보류] " + c if c else t.get("c", ""); changed = True

    ra = (out.get("reply_append") or "").strip()
    if ra:
        r["reply"] = (r.get("reply") or "") + "\n\n───────────────\n[" + now_kr() + " 자동 재검토]\n" + ra
    # 단계 재계산 — 최종승인 절대 금지
    todos = r.get("todos") or []
    if todos and all(x.get("v") == "ok" for x in todos):
        r["stage"] = r["status"] = "승인대기"
        log(r, "전 항목 확인 완료(자동) → 대표 최종 승인 요청")
    elif any(x.get("v") == "no" for x in todos):
        r["stage"] = r["status"] = "보완필요"
        log(r, "완료 보고 확인(자동) — 일부 미흡, 재작업 요청")
    else:
        log(r, "완료 보고 확인(자동) — 규제·판단 항목은 사람 확인 대기로 보류")
    r.setdefault("_auto", {})["bsig"] = state_sig
    return True

def process_A(client, r, log):
    if (r.get("reply") or "").strip():
        return False
    if (r.get("_auto") or {}).get("adone"):
        return False
    blocks = [{"type": "text", "text":
        f"프로그램: {r.get('title','')}\n제출자: {r.get('author','')}\nURL: {r.get('url','')}\n\n제출 본문:\n{r.get('text','') or '(본문 없음)'}"}]
    try:
        out = ask(client, SYS_A, blocks, max_tokens=2000)
    except Exception as e:
        print("  (A) 모델 호출 실패:", e); return False
    r["reply"] = (out.get("reply") or "").strip()
    new_todos = []
    for td in out.get("todos", []):
        if isinstance(td, dict) and td.get("t"):
            new_todos.append({"t": str(td["t"]).replace("/", "·"), "d": False, "v": "", "n": "", "c": "", "p": []})
    if new_todos:
        r["todos"] = new_todos
    jd = out.get("jd") or {}
    v = jd.get("v") if jd.get("v") in ("go", "hold", "stop") else "hold"
    if risk_hit(r.get("title"), r.get("text")) and v == "go":
        v = "hold"  # 규제 걸린 건 자동으로 '유지'까지 단정하지 않음
    r["jd"] = {"v": v, "c": [], "w": "[자동] " + (jd.get("w") or ""), "by": "감독관(자동)",
               "t": now_kr(), "ok": False, "okT": ""}
    r["stage"] = r["status"] = "보완필요"
    log(r, f"검토 의견 작성(자동) · 보완 지시 {len(new_todos)}건 등록")
    r.setdefault("_auto", {})["adone"] = True
    return True

def main():
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY 없음 — 중단"); sys.exit(0)
    import anthropic
    client = anthropic.Anthropic()

    data = load(DATA)
    pics = (load(PHOTOS).get("pics") if os.path.exists(PHOTOS) else {}) or {}
    reviews = data.get("reviews") or []

    def make_log(r):
        def log(rr, act):
            rr.setdefault("log", []).append({"w": "감독관(자동)", "a": act, "t": now_kr()})
        return log
    changed_any = False
    for r in reviews:
        if r.get("del"):
            continue
        log = make_log(r)
        try:
            b = process_B(client, r, pics, log)
            a = process_A(client, r, log) if not b else False
            if b or a:
                changed_any = True
                print(f"처리: {r.get('id')} {r.get('title','')[:30]} ({'B' if b else 'A'})")
        except Exception as e:
            print(f"  {r.get('id')} 처리 중 예외: {e}")

    if changed_any:
        data["savedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
        data["savedBy"] = "auto-review-bot"
        with open(DATA, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("data.json 갱신 완료")
    else:
        print("처리할 새 항목 없음 — 변경 없음")

if __name__ == "__main__":
    main()
