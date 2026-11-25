/* Q-POS 업무 위젯 (qwork) — 2026-11-24
   · 그림자 뿌리(Shadow DOM) 안에 그려서 포스 화면 꾸밈과 서로 섞이지 않는다
   · 자료는 «어댑터»가 준다 — 본포스(기존 할 일 기록 그대로) / 가상포스(체험 자료)
   · 서버는 팀 현황 · 기록을 열 때 한 번만 읽는다(10분 보관). 주기적으로 부르지 않는다 */
(function(){
'use strict';
var CSS="\n:host{all:initial}\n.qroot{--bg0:#e3e3e8;--bg1:#f2f2f7;--card:#fff;--fill:#e5e5ea;--inv:#1d1d1f;--ink:#1d1d1f;--ink2:#48484a;--ink3:#6e6e73;--line:#e5e5ea;--line2:#c7c7cc;--acc:#ffd400;--blue:#1550b0;--blue-s:#eef4ff;--org:#7a2e00;--org-s:#fff1e0;--grn:#217d37;--grn-s:#e3f3e7;--sh:0 8px 30px rgba(0,0,0,.12),0 0 0 1px rgba(0,0,0,.05);--ui:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif}\n*{box-sizing:border-box}\nbutton,input,select{font-family:inherit;font-size:14px;color:var(--ink)}\nbutton{cursor:pointer}\n.pill{height:58px;padding:0 18px;border:0;border-radius:20px;background:var(--card);box-shadow:var(--sh);display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;max-width:300px}\n.pill span{min-width:26px;height:26px;border-radius:13px;background:var(--acc);font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 7px}\n.pill em{font-style:normal;max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.pill.new{box-shadow:0 0 0 2px var(--blue),0 8px 30px rgba(0,0,0,.12)}\n.b1{height:44px;padding:0 18px;border:0;border-radius:13px;background:var(--acc);font-size:15px;font-weight:700}\n.b2{height:44px;padding:0 14px;border:0;border-radius:13px;background:var(--bg1);font-size:14px;font-weight:600}\n.b2.s,.b1.s{height:34px;padding:0 11px;font-size:13px;border-radius:10px}\n.b2.wh2{background:var(--card);box-shadow:inset 0 0 0 1px var(--line2)}\n.chip{height:34px;padding:0 14px;border:0;border-radius:17px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);font-size:14px;font-weight:500}\n.chip.on{background:var(--inv);color:#fff;box-shadow:none;font-weight:600}\n.tag{flex:none;font-size:11.5px;font-weight:700;padding:1px 7px;border-radius:6px;background:var(--bg1);color:var(--ink3)}\n.tag.req{background:var(--blue-s);color:var(--blue)}\n.tag.auto{background:var(--grn-s);color:var(--grn)}\n.meta{display:block;font-size:12px;color:var(--ink3);margin-top:2px;font-weight:400}\n.add{display:flex;gap:6px}\n.add input{flex:1;min-width:0;height:44px;border:0;border-radius:13px;padding:0 14px;background:var(--bg1);font-size:15px}\n.add input:focus{outline:2px solid var(--inv)}\n.zone{border-radius:16px;background:var(--bg1);padding:4px}\n.zh{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:7px 10px 5px;font-size:13px;font-weight:700}\n.zh span{font-weight:400;font-size:12px;color:var(--ink3)}\n.zone.in .zh{color:var(--blue)}\n.zone.hold{background:var(--org-s)}.zone.hold .zh{color:var(--org)}\n.zl{background:var(--card);border-radius:12px;padding:0 8px;min-height:42px}\n.empty{padding:12px 0;font-size:12px;color:var(--ink3);text-align:center}\n.it{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:8px 0;border-top:1px solid var(--line)}\n.it:first-child{border-top:0}\n.it .t{flex:1 1 140px;min-width:0;font-weight:500}\n.it.drag{opacity:.3}\n.grip{flex:0 0 26px;height:34px;border:0;background:transparent;border-radius:8px;padding:0;cursor:grab;touch-action:none;display:flex;align-items:center;justify-content:center}\n.grip:hover{background:var(--bg1)}\n.grip svg{width:12px;height:18px;fill:var(--ink3);pointer-events:none}\n.nog{flex:0 0 26px}\n.line{height:4px;background:var(--inv);border-radius:2px}\n.zone.over{outline:2px solid var(--inv)}\n.pct{display:flex;gap:3px}\n.pct button{width:36px;height:34px;border:0;background:var(--bg1);border-radius:9px;font-size:12px;padding:0;font-weight:600}\n.pct button.on{background:var(--inv);color:#fff}\n#ghost{position:fixed;z-index:40;pointer-events:none;background:var(--inv);color:#fff;border-radius:10px;padding:6px 10px;font-size:13px;max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:var(--sh)}\n#mini{position:fixed;z-index:6;width:420px;max-width:calc(100vw - 24px);max-height:calc(100vh - 110px);background:var(--card);border-radius:22px;box-shadow:0 18px 50px rgba(20,20,30,.22),0 0 0 1px rgba(0,0,0,.05);display:flex;flex-direction:column}\n.wh{display:flex;align-items:center;gap:6px;padding:12px 14px 8px;cursor:grab;touch-action:none}\n.wh b{flex:1;font-size:16px}\n.wh small{font-weight:400;font-size:11.5px;color:var(--ink3);display:block}\n.wb{padding:4px 14px 10px;overflow:auto;display:flex;flex-direction:column;gap:8px}\n.wf{display:flex;gap:6px;padding:10px 14px 14px}\n.wf button{flex:1}\n#ov{position:fixed;inset:0;background:rgba(20,20,30,.28);z-index:7}\n#sheet{position:fixed;z-index:8;left:50%;bottom:0;transform:translateX(-50%);width:min(1180px,calc(100vw - 32px));height:calc(100vh - 44px);background:var(--card);border-radius:26px 26px 0 0;box-shadow:0 -10px 50px rgba(20,20,30,.25);display:flex;flex-direction:column;animation:up .26s cubic-bezier(.2,.8,.2,1)}\n@keyframes up{from{transform:translate(-50%,40px);opacity:.4}to{transform:translate(-50%,0);opacity:1}}\n.grab{width:42px;height:5px;border-radius:3px;background:var(--line2);margin:8px auto 0;flex:none}\n.sh{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:8px 22px 10px}\n.sh .ttl{flex:1 1 180px}\n.sh .ttl span{display:block;font-size:12px;color:var(--ink3);font-weight:600}\n.sh .ttl b{font-size:20px}\n.tabs{display:flex;gap:6px}\n.sb{flex:1;overflow:auto;padding:4px 22px 22px;display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start;align-content:flex-start}\n.col{flex:1 1 420px;min-width:0;display:flex;flex-direction:column;gap:10px}\n.box{background:var(--bg1);border-radius:16px;padding:14px}\n.box h2{margin:0 0 4px;font-size:15px}\n.box p{margin:0 0 8px;font-size:12.5px;color:var(--ink3)}\n.pp{background:var(--bg1);border-radius:16px;padding:12px 14px;display:flex;flex-direction:column;gap:6px}\n.pp.me{box-shadow:inset 0 0 0 2px var(--inv)}\n.pp.hot{background:var(--org-s)}\n.ph{display:flex;gap:8px;align-items:center}\n.ph b{font-size:15px}.ph span{font-size:12.5px;color:var(--ink3)}\n.ph .sp{flex:1}\n.ln{display:flex;gap:8px;font-size:13.5px;line-height:1.45}\n.ln i{flex:0 0 66px;font-style:normal;font-weight:700;font-size:12.5px;color:var(--ink3);padding-top:1px}\n.ln div{flex:1;min-width:0}\n.no{color:var(--ink3)}\n.dn{color:var(--ink3);text-decoration:line-through}\n.pk{display:inline-block;font-size:12px;font-weight:700;border-radius:6px;padding:1px 7px;background:var(--card);margin-left:4px}\n.pk.big{background:var(--org);color:#fff}\n.team{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:10px;flex:1 1 100%}\n.sum{display:flex;flex-wrap:wrap;gap:10px}\n.sum div{flex:1 1 120px;background:var(--bg1);border-radius:16px;padding:12px 14px;font-size:12.5px;color:var(--ink3)}\n.sum b{display:block;font-size:24px;color:var(--ink)}\n.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}\n.cal .hd{font-size:12px;color:var(--ink3);text-align:center;padding:2px 0;font-weight:600}\n.day{min-height:68px;border:0;border-radius:12px;background:var(--bg1);padding:7px 8px;text-align:left;display:flex;flex-direction:column;gap:3px;font-size:12px}\n.day b{font-size:13px}\n.day.off{background:transparent;color:var(--ink3)}\n.day.sel{background:var(--inv);color:#fff}\n.day .k{display:inline-block;border-radius:5px;padding:0 5px;font-weight:700;background:var(--card);color:var(--ink)}\n.day .k.p{background:var(--org);color:#fff}\n.day.today{box-shadow:inset 0 0 0 2px var(--acc)}\nselect.sel{height:40px;border:0;border-radius:12px;background:var(--bg1);padding:0 12px;font-weight:600}\n.zone{border:1.5px solid var(--line2);padding:0;overflow:hidden;background:var(--card)}\n.zh{padding:10px 12px;background:var(--bg1);border-bottom:1.5px solid var(--line2);font-size:14.5px;justify-content:flex-start}\n.zh span{margin-left:auto}\n.zn{width:22px;height:22px;border-radius:11px;background:var(--inv);color:#fff;font-size:12.5px;display:inline-flex;align-items:center;justify-content:center;flex:none}\n.zone.in{border-color:var(--blue)}.zone.in .zh{background:var(--blue-s);border-bottom-color:var(--blue)}.zone.in .zn{background:var(--blue)}\n.zone.hold{border-color:var(--org);background:var(--card)}.zone.hold .zh{background:var(--org-s);border-bottom-color:var(--org)}.zone.hold .zn{background:var(--org)}\n.zone.dz{border-color:var(--grn)}.zone.dz .zh{background:var(--grn-s);border-bottom-color:var(--grn);color:var(--grn)}.zone.dz .zn{background:var(--grn)}\n.zl{border-radius:0;padding:0 10px}\n.zs{padding:8px 12px 4px;font-size:12.5px;font-weight:700;color:var(--ink2);border-top:1px solid var(--line)}\n.zs:first-of-type{border-top:0}\n.zs.au{color:var(--grn);border-top:1.5px dashed var(--grn)}\n.zs span{font-weight:400;color:var(--ink3)}\n.team{display:flex;flex-direction:column;gap:8px;flex:1 1 100%}\n.tnote{font-size:12.5px;color:var(--ink3)}\n.pr{display:grid;grid-template-columns:230px 1fr 1.3fr 1.3fr auto;gap:14px;align-items:start;background:var(--bg1);border-radius:16px;padding:12px 14px}\n.pr.me{box-shadow:inset 0 0 0 2px var(--inv)}\n.pr.hot{background:var(--org-s)}\n.pc0{display:flex;gap:10px;align-items:center}\n.pc0 b{font-size:15px;display:block}.pc0 span{font-size:12.5px;color:var(--ink3)}\n.rk{width:26px;height:26px;border-radius:13px;background:var(--inv);color:#fff!important;font-weight:800;font-size:13px!important;display:flex;align-items:center;justify-content:center;flex:none}\n.tt{margin-left:auto;text-align:right;font-size:11.5px;color:var(--ink3)}.tt b{font-size:20px;color:var(--ink)}\n.pc{font-size:13.5px;line-height:1.5;min-width:0}\n.pc i{display:block;font-style:normal;font-size:12px;font-weight:700;color:var(--ink3);margin-bottom:2px}\n.pc .pk{margin:0 4px 4px 0}\n.pb{display:flex;gap:6px}\nh3.sec{margin:10px 0 4px;font-size:13px;color:var(--ink2)}\nh3.sec.au{color:var(--grn)}\n@media (max-width:980px){.pr{grid-template-columns:1fr}}\n.wb>*{flex:none}\n.nl{margin:0;padding:0;list-style:none;counter-reset:n;display:flex;flex-direction:column;gap:4px}\n.nl li{counter-increment:n;display:flex;gap:7px;align-items:flex-start}\n.nl li::before{content:counter(n);flex:none;width:20px;height:20px;border-radius:10px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line2);font-size:11.5px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px}\n.nl li>div{flex:1;min-width:0}\n.lb{display:inline-block;min-width:44px;font-size:11.5px;font-weight:700;color:var(--ink3)}\n.ok{flex:none;font-size:11.5px;font-weight:700;color:var(--grn);background:var(--grn-s);border-radius:6px;padding:1px 6px}\n.ct{flex:none;font-size:13px;background:var(--card);border-radius:6px;padding:0 7px}\n.ct.big{background:var(--org);color:#fff}\n#dlg{position:fixed;inset:0;z-index:20;background:rgba(20,20,30,.4);display:flex;align-items:flex-end;justify-content:center}\n.dbox{background:var(--card);border-radius:26px 26px 0 0;padding:4px 22px 22px;width:480px;max-width:100%;display:flex;flex-direction:column;gap:10px;animation:up2 .22s ease}\n@keyframes up2{from{transform:translateY(30px);opacity:.4}to{transform:none;opacity:1}}\n.dbox h2{margin:4px 0 0;font-size:19px}\n.dbox label{font-size:12.5px;color:var(--ink3);display:flex;flex-direction:column;gap:4px;font-weight:600}\n.dbox input,.dbox select{height:44px;border:0;border-radius:13px;padding:0 12px;background:var(--bg1);font-size:15px}\n.load{background:var(--bg1);border-radius:13px;padding:11px 13px;font-size:13px;line-height:1.5}\n.load.w{background:var(--org-s);color:var(--org);font-weight:700}\n.dact{display:flex;gap:8px;justify-content:flex-end}\n#toast{position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:50;background:var(--inv);color:#fff;border-radius:14px;padding:10px 16px;font-size:13.5px;max-width:90vw}\n[hidden]{display:none!important}\n.qroot.dragging,.qroot.dragging *{cursor:grabbing!important;user-select:none}\n.pn{margin:0 0 4px;padding:10px 12px;border:1.5px solid var(--blue);background:var(--blue-s);border-radius:12px}\n.pn label{display:block;font-size:13px;font-weight:700;color:var(--blue);margin-bottom:6px}\n.pnr{display:flex;gap:6px;align-items:center}\n.pnr input{flex:1;min-width:0;height:38px;border:1px solid var(--line2);border-radius:10px;padding:0 10px;font:inherit;font-size:14px;background:#fff}\n.pnr input:focus{outline:2px solid var(--blue);outline-offset:1px}\n.pnr button{flex:none}\n.pnote{display:block;font-size:12px;color:var(--blue);margin-top:2px}\n.pnote i{font-style:normal;color:var(--ink3)}\n.dbox.cardbox{width:860px;max-height:96vh;overflow:auto;border-radius:22px;margin:auto;padding:16px 18px}\n.cardhd{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.cardhd h2{margin:0;flex:1;font-size:18px}\n.cardhd a{text-decoration:none;display:inline-flex;align-items:center}\n.cardimg{width:100%;height:auto;border-radius:14px;border:1px solid var(--line);display:block}\n\n.sline{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:1.5px solid var(--line2);border-radius:14px;background:var(--card);padding:10px 12px;flex:none}.sline.w{border-color:#b4530a;background:var(--org-s)}.sline b{font-size:14px;white-space:nowrap}.sline span{flex:1;font-size:12.5px;color:var(--ink3)}.sline i{font-style:normal;font-weight:800;font-size:13px;background:var(--fill);border-radius:9px;padding:5px 10px}\n.sum .w{background:var(--org-s)}.sum .w b{color:#b4530a}\n.sl{list-style:none;margin:0;padding:0;counter-reset:s;display:flex;flex-direction:column;gap:10px}.sl li{counter-increment:s;position:relative;background:var(--card);border:1.5px solid var(--line2);border-radius:16px;padding:12px 14px 12px 52px}.sl li::before{content:counter(s);position:absolute;left:14px;top:12px;width:26px;height:26px;border-radius:8px;background:var(--inv);color:#fff;font-weight:800;font-size:13px;display:grid;place-items:center}.sl li.late,.sl li.nego,.sl li.cant{border-color:#b4530a;background:var(--org-s)}.sl li.new{border-color:var(--blue);background:var(--blue-s)}.sl li.done{opacity:.75}\n.sl .s1{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.sl .s1 b{font-size:16px}.sb2{font-size:12px;font-weight:800;border-radius:8px;padding:2px 8px;background:var(--fill)}.sb2.new{background:var(--blue);color:#fff}.sb2.late,.sb2.nego,.sb2.cant{background:#b4530a;color:#fff}.sb2.doing,.sb2.done{background:var(--grn-s);color:var(--grn)}\n.sl .s2{display:flex;flex-wrap:wrap;gap:4px 22px;margin:6px 0 8px;font-size:13.5px}.sl .lb{min-width:0;margin-right:8px}\n.sl .s3{display:flex;align-items:center;gap:10px}.sl .s3 b{font-size:14px;min-width:96px;text-align:right}.sl .bar{flex:1;height:10px;border-radius:5px;background:var(--fill);overflow:hidden}.sl .bar i{display:block;height:100%;background:var(--grn);border-radius:5px}.sl li.late .bar i{background:#b4530a}\n.sl .s4{margin-top:8px;font-size:13.5px;border-top:1px dashed var(--line2);padding-top:8px}.sl .s4 i{font-style:normal;color:var(--ink3);font-size:12px}\n\n.qroot{font-family:var(--ui);color:var(--ink);font-size:14px;line-height:1.35;text-align:left}\n.qroot [hidden]{display:none!important}\n.qpill{position:fixed;right:18px;bottom:18px;z-index:5}\n";
var AK=[['g','따이공 택배'],['t','매장 지원 택배'],['i','입고 확인'],['c','청소'],['m','마감 보고'],['p','플레이스 작업']];
var ZN={incoming:'도착한 요청',tasks:'오늘 업무',hold:'보류',done:'오늘 한 일'}, ZI={incoming:1,tasks:2,hold:3,done:4};
var GRIP='<svg viewBox="0 0 12 18" aria-hidden="true"><circle cx="3" cy="3" r="1.6"/><circle cx="9" cy="3" r="1.6"/><circle cx="3" cy="9" r="1.6"/><circle cx="9" cy="9" r="1.6"/><circle cx="3" cy="15" r="1.6"/><circle cx="9" cy="15" r="1.6"/></svg>';
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function md(v){var a=String(v||'').split('-'); return a.length===3?(+a[1])+'월 '+(+a[2])+'일':String(v||'');}
function autoOf(x){return x.g+x.t+x.c+x.i+x.m+x.p;}

function mount(A,opt){
 opt=opt||{};
 var host=document.createElement('div'); host.id='qworkHost'; document.body.appendChild(host);
 var R=host.attachShadow({mode:'open'});
 R.innerHTML='<style>'+CSS+(opt.css||'')+'</style><div class="qroot" id="qroot">'+(opt.pill?'<button class="pill qpill" id="pill" data-act="pill" title="오늘 할 일"></button>':'')
  +'<section id="mini" hidden></section><div id="ov" hidden data-act="closeSheet"></div><section id="sheet" hidden role="dialog" aria-label="업무"></section><div id="dlg" hidden></div><div id="toast" hidden></div><div id="ghost" hidden></div></div>';
 function $(i){return R.getElementById(i);}
 var S={view:'pill',admin:false,pos:null,tab:'my',rp:'',rmode:'month',rday:0,noteFor:null};
 try{var sp=JSON.parse(localStorage.getItem('qw_pos')||'null'); if(sp&&isFinite(sp.x)) S.pos=sp;}catch(e){}
 var Z={incoming:[],tasks:[],hold:[],done:[]}, M=null, Merr='', Mbusy=false;
 function ME(){return A.me().name;}
 function YMD(){return A.today();}
 function TODAY(){return +YMD().slice(8,10);}
 function MON(){return +YMD().slice(5,7);}
 function YEAR(){return +YMD().slice(0,4);}
 function mdl(d){return MON()+'/'+d;}
 function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.k);toast.k=setTimeout(function(){t.hidden=true;},2600);}
 function find(a,id){for(var i=0;i<a.length;i++) if(String(a[i].id)===String(id)) return i; return -1;}
 function NAMES(){return M?M.NAMES:[];}
 function Dn(n){return (M&&M.D[n])||{};}
 function mon(n){var o={g:0,t:0,c:0,i:0,m:0,p:0,dn:0,dd:0,pk:0,pkd:0}, d=Dn(n); Object.keys(d).forEach(function(k){var x=d[k]; ['g','t','c','i','m','p','dn'].forEach(function(f){o[f]+=x[f]||0;}); o.dd++; if(x.g+x.t>o.pk){o.pk=x.g+x.t;o.pkd=+k;}}); o.auto=o.g+o.t+o.c+o.i+o.m+o.p; return o;}
 function rqOf(n){return (M&&M.REQS[n])||[];}
 function total(n){var m=mon(n);return m.auto+m.dn+rqOf(n).length;}
 function lastDay(n){var k=Object.keys(Dn(n)).map(Number); return k.length?Math.max.apply(null,k):TODAY();}
 function lastTxt(n){var t=(M&&M.TXT[n])||{}, ks=Object.keys(t).map(Number).sort(function(a,b){return b-a;}); return ks.length?{d:ks[0],a:t[ks[0]]}:null;}
 function storeOf(n){return (M&&M.STORE[n])||'';}

 /* ── 내 업무 ── */
 function row(k,z){
  var m='',act='';
  if(z==='incoming'){m='요청 '+(k.from||'미상')+(k.due?' · 기한 '+k.due:''); act='<button class="b1 s" data-act="accept" data-id="'+esc(k.id)+'">받기</button><button class="b2 s" data-act="nego" data-id="'+esc(k.id)+'">기한 조율</button>';}
  else if(z==='tasks'){m=k.meta||''; act='<div class="pct">'+[0,25,50,75,100].map(function(v){return '<button class="'+((k.pct||0)===v?'on':'')+'" data-act="pct" data-id="'+esc(k.id)+'" data-v="'+v+'" aria-label="진척 '+v+'">'+(v===100?'완료':v)+'</button>';}).join('')+'</div>';}
  else if(z==='hold'){m=(k.days?k.days+'일째':'오늘 보류로 옮김'); act='<button class="b2 s" data-act="mv" data-id="'+esc(k.id)+'" data-from="hold" data-to="tasks">오늘로</button><button class="b2 s" data-act="send" data-pref="'+esc(k.t)+'">넘기기</button><button class="b2 s" data-act="del" data-id="'+esc(k.id)+'">지우기</button>';}
  else {m=k.auto?'':'완료'; act=k.auto?'':'<button class="b2 s" data-act="mv" data-id="'+esc(k.id)+'" data-from="done" data-to="tasks">되돌리기</button>';}
  return '<div class="it" data-id="'+esc(k.id)+'" data-zone="'+z+'">'+(k.auto?'<span class="nog"></span>':'<button class="grip" data-grip="1" aria-label="끌어서 옮기기">'+GRIP+'</button>')+'<span class="tag'+(k.tag==='요청'?' req':k.tag==='자동'?' auto':'')+'">'+(k.tag==='자동'?'자동 기록':esc(k.tag))+'</span><span class="t">'+esc(k.t)+(m?'<span class="meta">'+esc(m)+'</span>':'')+(z==='tasks'&&k.note?'<span class="pnote"><b>'+(k.pct||0)+'%</b> '+esc(k.note)+' <i>'+esc(k.noteAt||'')+'</i></span>':'')+'</span>'+act+'</div>'
  +(z==='tasks'&&String(S.noteFor)===String(k.id)?'<div class="pn"><label>어디까지 진행되셨나요? <b>'+(k.pct||0)+'%</b></label><div class="pnr"><input data-note="'+esc(k.id)+'" maxlength="60" autocomplete="off" placeholder="예: 사진 2장 찍음, 1장 남음" value="'+esc(k.note||'')+'"><button class="b1 s" data-act="noteok" data-id="'+esc(k.id)+'">적기</button><button class="b2 s" data-act="noteno">건너뛰기</button></div></div>':'');}
 function zone(z,note){
  if(z==='incoming'&&!Z.incoming.length) return '';
  var a=Z[z], cls=z==='incoming'?'in':z==='hold'?'hold':z==='done'?'dz':'';
  var extra=z==='hold'&&a.length?' · 가장 오래된 것 '+a.reduce(function(m,k){return Math.max(m,k.days||0);},0)+'일째':'';
  var body;
  if(z==='done'){ var mine=a.filter(function(k){return !k.auto;}), au=a.filter(function(k){return k.auto;});
   body='<div class="zs">내가 완료한 업무 '+mine.length+'건</div><div class="zl">'+(mine.map(function(k){return row(k,z);}).join('')||'<div class="empty">여기로 끌어 놓으면 완료됩니다</div>')+'</div><div class="zs au">자동으로 기록된 업무 '+au.length+'건 <span>적지 않아도 들어옵니다 · 함께 근무한 사람 모두에게 기록</span></div><div class="zl nodrop">'+(au.map(function(k){return row(k,z);}).join('')||'<div class="empty">아직 없습니다</div>')+'</div>'; }
  else body='<div class="zl">'+(a.map(function(k){return row(k,z);}).join('')||'<div class="empty">'+(z==='hold'?'3일 넘게 넘어온 일이 여기로 모입니다':'여기로 끌어 놓을 수 있습니다')+'</div>')+'</div>';
  return '<section class="zone '+cls+'"'+(z==='incoming'?'':' data-drop="'+z+'"')+'><div class="zh"><b class="zn">'+(ZI[z]-(Z.incoming.length?0:1))+'</b>'+ZN[z]+' '+a.length+'건'+extra+'<span>'+note+'</span></div>'+body+'</section>';}
 function inputRow(id){return '<div class="add"><input id="'+id+'" data-new="1" maxlength="60" autocomplete="off" aria-label="내 일 한 줄 적기" placeholder="내 일 한 줄 적기 · 엔터를 치면 바로 다음 줄"><button class="b2" data-act="add" data-src="'+id+'">추가</button></div>';}
 function legacyBtn(){return A.legacy?'<button class="b2 s" data-act="legacy" title="매장 루틴 · 예전 할 일 창">루틴 · 예전 창'+(A.legacyCount&&A.legacyCount()?' '+A.legacyCount():'')+'</button>':'';}
 function renderPill(){var p=$('pill'); if(!p) return; var n=Z.tasks.length+Z.incoming.length; p.className='pill qpill'+(Z.incoming.length?' new':''); p.innerHTML='<span>'+n+'</span><em>'+esc(Z.incoming.length?'새 요청 '+Z.incoming.length+'건':(Z.tasks[0]?Z.tasks[0].t:'오늘 할 일'))+'</em>';}
 function renderMini(){
  $('mini').innerHTML='<div class="wh" data-move="1"><b>오늘 할 일<small>'+esc(ME())+' · 이 머리 부분을 끌면 창이 옮겨집니다</small></b><button class="b2 s" data-act="view" data-v="full">크게 보기</button><button class="b2 s" data-act="view" data-v="pill">접기</button></div>'
  +'<div class="wb">'+inputRow('newMini')+zone('incoming','끌어 내리면 받기')+zone('tasks','위에서부터 순서')+zone('hold','3일 넘게 넘어온 일')+zone('done','초록 딱지 = 자동으로 기록된 업무')+sentLine(A.sent?A.sent():[])+'</div>'
  +'<div class="wf"><button class="b1" data-act="send">요청 보내기</button><button class="b2" data-act="proxy">대신 등록</button>'+legacyBtn()+'</div>';}

 /* ── 팀 현황 ── */
 function person(n,rank){
  var m=mon(n), rq=rqOf(n), me=n===ME();
  var l1=rq.length?'<ol class="nl">'+rq.map(function(k){return '<li><div><span class="lb">지시자</span>'+esc(k.from||'미상')+'<br><span class="lb">업무</span>'+esc(k.t)+'<br><span class="lb">기한</span>'+esc(k.due||'없음')+(k.pct!=null?' · 진척 '+k.pct+'%':' · 아직 받지 않음')+(k.note?'<br><span class="lb">진행</span>'+esc(k.note):'')+'</div></li>';}).join('')+'</ol>':'<span class="no">없음</span>';
  var items, lt=lastTxt(n);
  if(me){ items=Z.tasks.filter(function(k){return k.tag!=='요청';}).map(function(k){return [k.t,0];}).concat(Z.done.filter(function(k){return !k.auto&&k.tag!=='요청';}).map(function(k){return [k.t,1];})); }
  else items=lt?lt.a:[];
  var day=(!me&&lt&&lt.d!==TODAY())?'<span class="no">'+mdl(lt.d)+' 기록</span>':'';
  var l2=items.length?day+'<ol class="nl">'+items.map(function(x){return '<li><div'+(x[1]?' class="dn"':'')+'>'+esc(x[0])+'</div>'+(x[1]?'<span class="ok">완료</span>':'')+'</li>';}).join('')+'</ol>':'<span class="no">적은 줄이 없습니다</span>';
  var au=AK.filter(function(k){return m[k[0]];});
  var l3=au.length?'<ol class="nl">'+au.map(function(k){var big=(k[0]==='g'||k[0]==='t')&&m[k[0]]>=20; return '<li><div>'+k[1]+'</div><b class="ct'+(big?' big':'')+'">'+m[k[0]]+'건</b></li>';}).join('')+'</ol>'+(m.pk>=6?'<span class="pk big" style="margin:4px 0 0">'+mdl(m.pkd)+' 하루 택배 '+m.pk+'건</span>':''):'<span class="no">없음</span>';
  return '<div class="pr'+(me?' me':'')+(rank<=2?' hot':'')+'"><div class="pc0"><span class="rk">'+rank+'</span><div><b>'+esc(n)+(me?' (나)':'')+'</b><span>'+esc(storeOf(n))+'</span></div><div class="tt"><b>'+total(n)+'</b>이달 합계</div></div>'
  +'<div class="pc"><i>받은 요청 '+rq.length+'건</i>'+l1+'</div><div class="pc"><i>본인이 적은 업무 '+items.length+'건 · 이달 완료 '+m.dn+'줄</i>'+l2+'</div><div class="pc"><i>자동으로 기록된 업무 · 이달 '+m.auto+'건</i>'+l3+'</div>'
  +'<div class="pb"><button class="b2 s wh2" data-act="rec" data-n="'+esc(n)+'">기록</button><button class="b2 s wh2" data-act="card" data-n="'+esc(n)+'">이달 그림</button>'+(me?'':'<button class="b2 s wh2" data-act="send" data-to="'+esc(n)+'">요청</button>')+'</div></div>';}
 function waitBox(){return '<div class="col" style="flex:1 1 100%"><div class="box"><h2>'+(Merr?'기록을 불러오지 못했습니다':'이달 기록을 불러오는 중입니다')+'</h2><p>'+(Merr?esc(Merr)+' <button class="b2 s" data-act="reload">다시 불러오기</button>':'잠시만 기다려 주세요.')+'</p></div></div>';}
 function tabTeam(){
  if(!M) return waitBox();
  var L=NAMES().slice().sort(function(a,b){return total(b)-total(a);});
  var adm=S.admin?'<div class="col" style="flex:1 1 100%"><div class="box"><h2>살펴볼 사람</h2><p>관리에서만 보입니다. 이달 업무 합계가 가장 많은 두 사람입니다.</p>'+L.slice(0,2).map(function(n){var m=mon(n);return '<div class="ln"><i>'+esc(n)+'</i><div>'+esc(storeOf(n))+' · 합계 '+total(n)+' · 택배 '+(m.g+m.t)+'건'+(m.pk>=6?' · 가장 몰린 날 '+mdl(m.pkd)+' 하루 '+m.pk+'건':'')+'</div></div>';}).join('')+'</div></div>':'';
  return adm+'<div class="team"><div class="tnote">업무가 많은 순서입니다. 합계 = 받은 요청 + 본인이 적어 완료한 업무 + 자동으로 기록된 업무('+YEAR()+'년 '+MON()+'월). <button class="b2 s" data-act="reload">새로 불러오기</button></div>'+L.map(function(n,i){return person(n,i+1);}).join('')+'</div>';}
 function tabMy(){var sent=A.sent?A.sent():[]; return '<div class="col" style="flex:1 1 100%">'+inputRow('newFull')+'</div><div class="col">'+zone('incoming','오늘 업무로 끌어 내리면 받기')+zone('tasks','위에서부터 순서 · 끌어서 바꾸기')+'</div><div class="col">'+zone('hold','3일 넘게 넘어온 일 · 접히지 않습니다')+zone('done','끌어 놓으면 완료')
  +sentLine(sent)+'</div>';}
 /* ── 보낸 요청: 내가 요청한 것만 모아 진행 상황을 본다 ── */
 var SO={late:0,nego:1,cant:2,new:3,doing:4,done:5}, SL={new:'확인 전',doing:'진행 중',done:'완료',nego:'기한 조율 요청',cant:'수행 불가'};
 function sentKind(k){ return (k.late&&k.st!=='done')?'late':(k.st||'new'); }
 function sentCount(a){ var c={new:0,doing:0,late:0,done:0,nego:0,cant:0}; a.forEach(function(k){ c[sentKind(k)]++; }); return c; }
 function sentLine(sent){ if(!sent.length) return ''; var c=sentCount(sent); return '<button class="sline'+(c.late||c.nego||c.cant?' w':'')+'" data-act="tab" data-v="sent"><b>내가 보낸 요청 '+sent.length+'건</b><span>확인 전 '+c.new+' · 진행 중 '+c.doing+(c.late?' · 기한 지남 '+c.late:'')+(c.nego?' · 조율 요청 '+c.nego:'')+(c.cant?' · 수행 불가 '+c.cant:'')+' · 완료 '+c.done+'</span><i>보기</i></button>'; }
 function tabSent(){
  var a=(A.sent?A.sent():[]).slice().sort(function(x,y){return SO[sentKind(x)]-SO[sentKind(y)];}), c=sentCount(a);
  var top='<div class="col" style="flex:1 1 100%"><div class="sum"><div><b>'+a.length+'건</b>내가 보낸 요청</div><div><b>'+c.new+'건</b>확인 전</div><div><b>'+c.doing+'건</b>진행 중</div><div'+(c.late?' class="w"':'')+'><b>'+c.late+'건</b>기한 지남</div><div><b>'+c.done+'건</b>완료</div></div></div>';
  if(!a.length) return top+'<div class="col" style="flex:1 1 100%"><div class="box"><h2>보낸 요청이 없습니다</h2><p>[업무 요청 보내기]로 보낸 일이 여기에 모입니다. 받는 분이 적은 진척과 진행 메모가 그대로 보입니다.</p></div></div>';
  return top+'<div class="col" style="flex:1 1 100%"><ol class="sl">'+a.map(function(k){ var kd=sentKind(k), p=k.st==='done'?100:(+k.pct||0);
   return '<li class="'+kd+'"><div class="s1"><span class="sb2 '+kd+'">'+(kd==='late'?'기한 지남':SL[kd])+'</span><b>'+esc(k.t)+'</b></div>'
   +'<div class="s2"><div><span class="lb">받는 사람</span>'+esc(k.to)+'</div><div><span class="lb">기한</span>'+esc(k.due||'없음')+(k.nego?' → <b>'+esc(k.nego)+'</b> 로 조율 요청':'')+'</div><div><span class="lb">보낸 날</span>'+esc(k.at||'')+'</div></div>'
   +'<div class="s3"><div class="bar"><i style="width:'+p+'%"></i></div><b>'+(k.st==='new'?'아직 받지 않음':k.st==='cant'?'수행 불가':p+'%')+'</b></div>'
   +(k.note?'<div class="s4"><span class="lb">진행</span>'+esc(k.note)+(k.noteAt?' <i>'+esc(k.noteAt)+'</i>':'')+'</div>':(k.why?'<div class="s4"><span class="lb">사유</span>'+esc(k.why)+'</div>':''))+'</li>'; }).join('')+'</ol></div>'; }
 /* ── 기록 ── */
 function dayDetail(n,d){
  var x=Dn(n)[d], t=((M&&M.TXT[n])||{})[d], h='<h2>'+MON()+'월 '+d+'일 · '+esc(n)+'</h2>';
  if(n===ME()&&d===TODAY()){ t=Z.done.filter(function(k){return !k.auto;}).map(function(k){return [k.t,1];}).concat(Z.tasks.map(function(k){return [k.t,0];})); }
  if(!x&&!(t&&t.length)) return h+'<p>기록이 없는 날입니다(휴무이거나 적지 않음).</p>';
  x=x||{dn:0,g:0,t:0,c:0,i:0,m:0,p:0};
  h+='<h3 class="sec">본인이 적은 업무</h3>';
  if(t&&t.length) h+=t.map(function(a){return '<div class="ln"><i>'+(a[1]?'완료':'못 끝냄')+'</i><div>'+esc(a[0])+'</div></div>';}).join('');
  else h+=x.dn?'<div class="ln"><i>완료</i><div>'+x.dn+'줄</div></div>':'<p>없음</p>';
  var au=AK.filter(function(k){return x[k[0]];});
  h+='<h3 class="sec au">자동으로 기록된 업무</h3>'+(au.length?au.map(function(k){var v=x[k[0]], one=(k[0]==='c'||k[0]==='m'||k[0]==='p'); return '<div class="ln"><i>'+k[1]+'</i><div>'+(one?'했음':v+'건')+'</div></div>';}).join('')+'<p style="margin-top:6px">그날 그 매장에서 함께 근무한 사람 모두에게 똑같이 기록됩니다.</p>':'<p>없음</p>');
  return h;}
 function tabRec(){
  if(!M) return waitBox();
  var n=S.rp&&M.D[S.rp]?S.rp:ME(); S.rp=n; if(!S.rday) S.rday=lastDay(n);
  var m=mon(n), sel='<select class="sel" id="rp" aria-label="누구 기록">'+NAMES().map(function(x){return '<option'+(x===n?' selected':'')+'>'+esc(x)+'</option>';}).join('')+'</select>';
  var top='<div class="col" style="flex:1 1 100%"><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">'+sel+'<button class="chip'+(S.rmode==='yest'?' on':'')+'" data-act="rmode" data-v="yest">어제 · 오늘</button><button class="chip'+(S.rmode==='month'?' on':'')+'" data-act="rmode" data-v="month">이달</button><button class="b1 s" data-act="card" data-n="'+esc(n)+'">이달 현황 그림(PNG)</button><span class="no" style="font-size:12.5px">누구나 누구 기록이든 볼 수 있습니다</span></div>'
  +'<div class="sum"><div><b>'+m.dd+'일</b>기록한 날</div><div><b>'+m.dn+'줄</b>완료한 업무</div><div><b>'+m.auto+'건</b>자동으로 기록된 업무</div><div><b>'+(m.g+m.t)+'건</b>그중 택배(따이공 '+m.g+' · 매장 지원 '+m.t+')</div></div></div>';
  if(S.rmode==='yest') return top+'<div class="col"><div class="box">'+dayDetail(n,Math.max(1,TODAY()-1))+'</div></div><div class="col"><div class="box">'+dayDetail(n,TODAY())+'</div></div>';
  var c='<div class="cal">'+['일','월','화','수','목','금','토'].map(function(x){return '<div class="hd">'+x+'</div>';}).join(''), off=new Date(YEAR(),MON()-1,1).getDay(), last=new Date(YEAR(),MON(),0).getDate();
  for(var b=0;b<off;b++) c+='<div></div>';
  for(var d=1;d<=last;d++){ var x=Dn(n)[d], fut=d>TODAY(), pk=x?x.g+x.t:0;
   c+='<button class="day'+(x?'':' off')+(d===S.rday?' sel':'')+(d===TODAY()?' today':'')+'" '+(fut?'disabled':'data-act="rday" data-d="'+d+'"')+'><b>'+d+'</b>'+(x&&x.dn?'<span>적은 업무 '+x.dn+'</span>':'')+(x&&autoOf(x)?'<span>자동 '+autoOf(x)+'</span>':'')+(pk?'<span><span class="k'+(pk>=6?' p':'')+'">택배 '+pk+'</span></span>':'')+'</button>'; }
  return top+'<div class="col" style="flex:2 1 520px">'+c+'</div></div><div class="col" style="flex:1 1 300px"><div class="box">'+dayDetail(n,S.rday)+'</div></div>';}
 function renderSheet(){
  var nsent=(A.sent?A.sent():[]).filter(function(k){return k.st!=='done';}).length, tabs=[['my','내 업무'],['sent','보낸 요청'+(nsent?' '+nsent:'')],['team','팀 현황'],['rec','기록']], adminSw=A.canAdmin&&A.canAdmin()?'<button class="chip'+(S.admin?' on':'')+'" data-act="admin">관리 보기</button>':'';
  $('sheet').innerHTML='<span class="grab"></span><div class="sh"><div class="ttl"><span>'+(S.admin?'관리 · ':'현장 · ')+esc(ME())+(A.me().store?' ('+esc(A.me().store)+')':'')+'</span><b>업무</b></div><div class="tabs">'+tabs.map(function(t){return '<button class="chip'+(S.tab===t[0]?' on':'')+'" data-act="tab" data-v="'+t[0]+'">'+t[1]+'</button>';}).join('')+adminSw+'</div><button class="b1 s" data-act="send">업무 요청 보내기</button><button class="b2 s" data-act="proxy">받은 일 대신 등록</button>'+legacyBtn()+'<button class="b2 s" data-act="view" data-v="mini">작게</button><button class="b2 s" data-act="closeSheet">닫기</button></div>'
  +'<div class="sb">'+(S.tab==='my'?tabMy():S.tab==='sent'?tabSent():S.tab==='team'?tabTeam():tabRec())+'</div>';}
 function place(){ var e=$('mini'); if(e.hidden) return; var w=e.offsetWidth,h=e.offsetHeight,x,y;
  if(S.pos){x=S.pos.x;y=S.pos.y;} else {var an=(opt.anchor&&opt.anchor())||$('pill'), b=an?an.getBoundingClientRect():{right:innerWidth-12,top:innerHeight-12,bottom:60}; var bl=typeof opt.below==='function'?opt.below(an):opt.below; x=b.right-w; y=bl?b.bottom+8:b.top-h-10;}
  x=Math.max(6,Math.min(x,innerWidth-w-6)); y=Math.max(6,Math.min(y,innerHeight-h-6)); e.style.left=x+'px'; e.style.top=y+'px'; }
 function needMonth(){ if((S.view==='full'&&S.tab!=='my')||!$('dlg').hidden){ loadMonth(false); } }
 function loadMonth(force){ if(Mbusy||!A.month) return; if(M&&!force) return; Mbusy=true; Merr='';
  Promise.resolve().then(function(){return A.month(force);}).then(function(m){M=m;Mbusy=false;render();if(loadMonth.then){var f=loadMonth.then;loadMonth.then=null;f();}},function(e){Mbusy=false;Merr=String((e&&e.message)||e);render();}); }
 var busy=false;
 function render(keep){
  if(busy) return; busy=true;
  try{
   try{Z=A.zones()||Z;}catch(e){ if(window.console) console.warn('qwork zones',e); }
   var act=R.activeElement, typing=act&&act.tagName==='INPUT'&&!keep&&S.view!=='pill', tv=typing?act.value:null, tid=typing?(act.id||null):null, tnote=typing&&act.dataset?act.dataset.note:null;
   var sc=R.querySelector('#mini .wb'), st=sc?sc.scrollTop:0, fc=R.querySelector('#sheet .sb'), ft=fc?fc.scrollTop:0;
   renderPill(); $('mini').hidden=S.view!=='mini'; $('sheet').hidden=$('ov').hidden=S.view!=='full';
   if(S.view==='mini'){renderMini(); R.querySelector('#mini .wb').scrollTop=st;} else $('mini').innerHTML='';
   if(S.view==='full'){renderSheet(); R.querySelector('#sheet .sb').scrollTop=ft; if(S.tab!=='my'&&S.tab!=='sent'&&!M) loadMonth(false);} else $('sheet').innerHTML='';
   place();
   var e=null; if(keep) e=$(keep); else if(tnote) e=R.querySelector('.pn input'); else if(tid) e=$(tid);
   if(e){ if(tv!=null&&!keep) e.value=tv; e.focus(); }
   if(opt.onRender) try{opt.onRender(Z,S);}catch(e2){}
  } finally { busy=false; }
 }
 var rq=0; function refresh(){ if(S.view==='pill'&&!$('pill')) return; clearTimeout(rq); rq=setTimeout(function(){ if(!Dg) render(); },60); }

 function doOp(fn){ try{ var r=fn(); if(r===false) return false; }catch(e){ toast('저장하지 못했습니다. 다시 시도해 주세요.'); if(window.console) console.warn('qwork',e); return false; } return true; }
 function move(id,from,to,idx){ if(to==='incoming') return; var ok=doOp(function(){return A.move(id,from,to,idx);}); if(ok&&from!==to) toast(ZN[from]+' → '+ZN[to]+(from==='incoming'?' · 요청을 받았습니다':'')); }
 function saveNote(id){var i=find(Z.tasks,id), e=R.querySelector('.pn input'); if(i<0||!e) return; var v=e.value.trim(); S.noteFor=null; if(v){ if(doOp(function(){return A.pct(id,Z.tasks[i].pct||0,v);})) toast('진행 상황을 적었습니다. 요청한 분과 팀 현황에 함께 보입니다.'); } render();}
 function addLine(src){var e=$(src); if(!e) return; var v=e.value.trim(); if(!v) return; if(doOp(function(){return A.add(v);})){ e.value=''; } render(src);}

 /* ── 끌기 ── */
 var Dg=null, line=document.createElement('div'); line.className='line';
 function dragStart(ev,g){var r=g.closest('.it'); Dg={id:r.dataset.id,from:r.dataset.zone,row:r,to:null,idx:0}; r.classList.add('drag'); $('qroot').classList.add('dragging'); var gh=$('ghost'); gh.textContent=r.querySelector('.t').firstChild.textContent; gh.hidden=false; dragMove(ev); Dg.timer=setInterval(function(){ if(Dg&&Dg.last) dragMove(Dg.last,true); },40); ev.preventDefault();}
 function dragMove(ev,auto){
  Dg.last={clientX:ev.clientX,clientY:ev.clientY};
  var gh=$('ghost'); gh.style.left=(ev.clientX+14)+'px'; gh.style.top=(ev.clientY+10)+'px';
  R.querySelectorAll('.zone.over').forEach(function(z){z.classList.remove('over');});
  var sc=auto&&Dg.row.closest('.wb,.sb'); if(sc){var b=sc.getBoundingClientRect(); if(ev.clientY<b.top+36) sc.scrollTop-=14; else if(ev.clientY>b.bottom-36) sc.scrollTop+=14;}
  var el=R.elementFromPoint(ev.clientX,ev.clientY), z=el&&el.closest&&el.closest('.zone[data-drop]');
  if(!z){ if(line.parentNode) line.parentNode.removeChild(line); Dg.to=null; return; }
  z.classList.add('over'); var list=z.querySelector('.zl'), rows=[].filter.call(list.querySelectorAll('.it'),function(r){return r!==Dg.row;}), idx=0;
  for(var i=0;i<rows.length;i++){var rb=rows[i].getBoundingClientRect(); if(ev.clientY>rb.top+rb.height/2) idx=i+1;}
  if(idx<rows.length) list.insertBefore(line,rows[idx]); else list.appendChild(line);
  Dg.to=z.dataset.drop; Dg.idx=idx;}
 function dragEnd(){ if(!Dg) return; var d=Dg; Dg=null; clearInterval(d.timer); $('qroot').classList.remove('dragging'); $('ghost').hidden=true; if(line.parentNode) line.parentNode.removeChild(line);
  if(d.to) move(d.id,d.from,d.to,d.idx); render(); }
 var Mv=null;
 function moveStart(ev){var b=$('mini').getBoundingClientRect(); Mv={dx:ev.clientX-b.left,dy:ev.clientY-b.top};}
 function moveMove(ev){ $('qroot').classList.add('dragging'); S.pos={x:ev.clientX-Mv.dx,y:ev.clientY-Mv.dy}; place(); }
 R.addEventListener('pointerdown',function(ev){
  if(ev.button>0) return;
  var g=ev.target.closest('[data-grip]'); if(g){dragStart(ev,g);return;}
  var h=ev.target.closest('[data-move]'); if(h&&!ev.target.closest('button')){moveStart(ev);ev.preventDefault();}
 });
 document.addEventListener('pointermove',function(ev){ if(Dg) dragMove(ev); else if(Mv) moveMove(ev); });
 document.addEventListener('pointerup',function(){ if(Dg) dragEnd(); else if(Mv){Mv=null;$('qroot').classList.remove('dragging'); try{localStorage.setItem('qw_pos',JSON.stringify(S.pos));}catch(e){}} });
 document.addEventListener('pointercancel',function(){ if(Dg){Dg.to=null;dragEnd();} Mv=null; });
 window.addEventListener('resize',function(){ if(S.view==='mini') place(); });

 /* ── 창 ── */
 function due0(n){var d=new Date(YMD()+'T00:00:00'); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
 function dlgSend(to,pref){
  var P=(A.people?A.people():NAMES()).filter(function(p){return p!==ME();});
  var opts=P.map(function(p){return '<option'+(p===to?' selected':'')+'>'+esc(p)+'</option>';}).join('');
  $('dlg').innerHTML='<form class="dbox" id="fSend"><span class="grab"></span><h2>업무 요청 보내기</h2><label>받는 사람<select id="sTo">'+opts+'</select></label><div id="sLoad" class="load"></div><label>무슨 일인지<input id="sT" maxlength="60" value="'+esc(pref||'')+'" placeholder="예: 신상품 진열 사진 3장"></label><label>언제까지<input id="sDue" type="date" value="'+due0(3)+'"></label><div class="dact"><button type="button" class="b2" data-act="close">취소</button><button class="b1">보내기</button></div></form>';
  $('dlg').hidden=false; loadInfo(); loadMonth.then=loadInfo; loadMonth(false); $('sT').focus();}
 function loadInfo(){var s=$('sTo'), b=$('sLoad'); if(!s||!b) return; var n=s.value; if(!M){b.className='load'; b.textContent=n+' 님의 업무 현황을 불러오는 중입니다…'; return;}
  var m=mon(n), rqn=rqOf(n).filter(function(k){return k.pct!==100;}).length, lt=lastTxt(n), hot=(m.g+m.t)>=25||rqn>=3; b.className='load'+(hot?' w':'');
  b.innerHTML=esc(n)+(storeOf(n)?' ('+esc(storeOf(n))+')':'')+'<br>받은 요청 '+rqn+'건 · 이달 택배 '+(m.g+m.t)+'건'+(m.pk>=6?' · '+mdl(m.pkd)+' 하루 '+m.pk+'건':'')+(lt?'<br>적은 업무: '+lt.a.slice(0,3).map(function(x){return esc(x[0]);}).join(' · '):'')+(hot?'<br>지금 가장 몰려 있는 편입니다. 꼭 이분이어야 하는지 확인해 주세요.':'');}
 function dlgProxy(){
  $('dlg').innerHTML='<form class="dbox" id="fProxy"><span class="grab"></span><h2>받은 일 대신 등록</h2><div class="load">카톡이나 말로 받은 일을 대신 올립니다. 누가 시켰는지 함께 남아 팀 현황에 보입니다.</div><label>누가 시켰는지<input id="pFrom" maxlength="20" placeholder="예: 박OO 과장"></label><label>무슨 일인지<input id="pT" maxlength="60" placeholder="예: 일본 POP 문구 수정 2종"></label><label>언제까지<input id="pDue" type="date" value="'+due0(3)+'"></label><div class="dact"><button type="button" class="b2" data-act="close">취소</button><button class="b1">등록</button></div></form>';
  $('dlg').hidden=false; $('pFrom').focus();}
 function dlgNego(id){
  $('dlg').innerHTML='<form class="dbox" id="fNego" data-id="'+esc(id)+'"><span class="grab"></span><h2>기한 조율 요청</h2><div class="load">받기 어렵거나 기한이 빠듯하면 날짜를 다시 제안합니다. 요청한 분 화면에 함께 보입니다.</div><label>가능한 날짜<input id="nDue" type="date" value="'+due0(4)+'"></label><label>한 줄 사유(선택)<input id="nWhy" maxlength="40" placeholder="예: 이번 주 택배가 많습니다"></label><div class="dact"><button type="button" class="b2" data-act="close">취소</button><button class="b1">조율 요청</button></div></form>';
  $('dlg').hidden=false;}
 var CG=[[/sns|인스타|릴스|쇼츠|공항점 X/i,'SNS 게시 · 활동 · 자동화 프로그램'],[/영상/,'영상 편집'],[/따이공/,'따이공 업무 (매출 점검 · 포장 · 발송)'],[/입고/,'입고 물품 정리'],[/발주|주문서/,'발주 · 주문서'],[/플레이스/,'플레이스 작업'],[/실사/,'재고실사'],[/시연대/,'시연대 점검'],[/택배|물품지원/,'택배 발송 · 물품 지원'],[/청소|정리|진열|라벨/,'정리 · 진열 · 청소'],[/재고/,'재고 확인']];
 function cardKey(k){for(var i=0;i<CG.length;i++) if(CG[i][0].test(k)) return CG[i][1]; return k;}
 function cardTop(n){ /* 이달 적은 업무를 같은 글자끼리 묶어 많은 순 */
  var t=(M&&M.TXT[n])||{}, days=Object.keys(t), c={}, full=true;
  days.forEach(function(d){t[d].forEach(function(x){var k=x[0].replace(/\s+/g,' ').trim(); if(/^외 \d+줄/.test(k)) return; k=cardKey(k); c[k]=c[k]||{n:0,dn:0}; c[k].n++; if(x[1]) c[k].dn++;});});
  return {full:full, a:Object.keys(c).map(function(k){return [k,c[k].n,c[k].dn];}).sort(function(a,b){return b[1]-a[1];})};}
 function drawCard(n){
  /* A4 세로 · 논리 크기 1240x1754(150dpi) 를 2배로 그려 300dpi 인쇄용 */
  var W=1240,H=1754,K=2,cv=document.createElement('canvas'); cv.width=W*K; cv.height=H*K; var g=cv.getContext('2d'); g.scale(K,K);
  var F='-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif';
  var INK='#1d1d1f',INK3='#6e6e73',LINE='#d9d9de',BG='#f2f2f7',BLUE='#1550b0',ORG='#b4530a',GRN='#217d37',OFF='#aeaeb2';
  function f(s,w){g.font=(w||'400')+' '+s+'px '+F;}
  function rr(x,y,w,h,r,fill){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();g.fillStyle=fill;g.fill();}
  function tx(s,x,y,col,al){g.fillStyle=col||INK;g.textAlign=al||'left';g.fillText(s,x,y);}
  function fit(s,w){ if(g.measureText(s).width<=w) return s; while(s.length>1&&g.measureText(s+'…').width>w) s=s.slice(0,-1); return s+'…'; }
  function wrapC(s,w){var o=[],c=''; for(var i=0;i<s.length;i++){ if(g.measureText(c+s[i]).width>w){o.push(c);c=s[i]===' '?'':s[i];} else c+=s[i]; } if(c) o.push(c); return o;}
  function wrap(s,w){var o=[],c=''; s.split('   ').forEach(function(t){var j=c?c+'   '+t:t; if(g.measureText(j).width<=w) c=j; else { if(c) o.push(c); if(g.measureText(t).width<=w) c=t; else {var p=wrapC(t,w); c=p.pop(); o=o.concat(p);} } }); if(c) o.push(c); return o;}
  function hl(x1,x2,y){g.strokeStyle=LINE;g.lineWidth=1;g.beginPath();g.moveTo(x1,y);g.lineTo(x2,y);g.stroke();}
  var m=mon(n), rq=rqOf(n), tot=total(n), rank=NAMES().slice().sort(function(a,b){return total(b)-total(a);}).indexOf(n)+1, WD=['일','월','화','수','목','금','토'];
  g.fillStyle='#fff'; g.fillRect(0,0,W,H); g.textBaseline='alphabetic';
  /* 1. 머리 */
  rr(40,40,1160,130,20,'#1d1d1f');
  f(17,'600'); tx(YEAR()+'년 '+MON()+'월 업무 현황 · '+MON()+'월 '+TODAY()+'일 기준 · Q-POS 기록 자동 정리',68,76,'#ffd400');
  f(50,'800'); tx(n,68,138,'#fff'); var nw=g.measureText(n).width; f(22,'500'); tx(storeOf(n),68+nw+16,136,'#c7c7cc');
  f(62,'800'); tx(String(tot),1172,122,'#ffd400','right'); f(17,'500'); tx('이달 합계 · '+NAMES().length+'명 중 '+rank+'번째 (받은 요청 + 적어 완료한 업무 + 자동 기록)',1172,150,'#c7c7cc','right');
  /* 2. 숫자 여섯 칸 */
  var st=[[m.dd+'일','기록한 날'],[m.dn+'줄','본인이 적어 완료한 업무'],[m.auto+'건','자동으로 기록된 업무'],[(m.g+m.t)+'건','택배 (따이공 '+m.g+' · 지원 '+m.t+')'],[m.pk?m.pk+'건':'없음',m.pk?'택배 최다일 · '+MON()+'월 '+m.pkd+'일':'택배 최다일'],[rq.length+'건','받은 요청']];
  st.forEach(function(s,i){var x=40+i*195; rr(x,186,185,96,16,BG); f(34,'800'); tx(s[0],x+16,232,(i===3&&m.g+m.t>=20)||(i===4&&m.pk>=6)?ORG:INK); f(13.5,'500'); tx(fit(s[1],160),x+16,262,INK3);});
  /* 3. 자동으로 기록된 업무 */
  rr(40,298,570,330,16,BG); f(20,'700'); tx('① 자동으로 기록된 업무 · 이달 '+m.auto+'건',62,334,GRN);
  var mx=Math.max.apply(null,AK.map(function(k){return m[k[0]];}).concat([1]));
  AK.forEach(function(k,i){var y=356+i*40,v=m[k[0]],big=(k[0]==='g'||k[0]==='t')&&v>=20, dd=Object.keys(Dn(n)).filter(function(d){return Dn(n)[d][k[0]];}).length;
   f(17,'600'); tx((i+1)+'. '+k[1],62,y+20,v?INK:OFF); rr(220,y+4,210,20,7,'#fff'); if(v) rr(220,y+4,Math.max(8,210*v/mx),20,7,big?ORG:GRN);
   f(18,'800'); tx(v+'건',496,y+21,big?ORG:(v?INK:OFF),'right'); f(13.5,'500'); tx(v?dd+'일에 걸쳐':'',588,y+20,INK3,'right');});
  f(14,'500'); tx('택배 · 청소 · 입고 · 마감 · 플레이스는 그날 함께 근무한 사람 모두에게 같은 건수로 기록됩니다',62,612,INK3);
  /* 4. 달력 */
  rr(630,298,570,330,16,BG); f(20,'700'); tx('② 날짜별 업무 건수',652,334,INK); f(13.5,'500'); tx('숫자 = 적어 완료한 업무 + 자동 기록 · 주황 = 택배 6건 이상',1178,333,INK3,'right');
  WD.forEach(function(d,i){f(14,'600'); tx(d,652+i*76+35,360,INK3,'center');});
  var off=new Date(YEAR(),MON()-1,1).getDay(), last=new Date(YEAR(),MON(),0).getDate(), six=off+last>35, stp=six?42:50, chh=six?38:45;
  for(var d=1;d<=last;d++){ var col=(d-1+off)%7,row=Math.floor((d-1+off)/7),x=652+col*76,y=370+row*stp,o=Dn(n)[d],v=o?o.dn+autoOf(o):0,pk=o?o.g+o.t:0,fut=d>TODAY();
   rr(x,y,70,chh,8,fut?'#fafafa':!o?'#fff':pk>=6?'#ffd9b0':v>=8?'#9fd3ad':v>=4?'#c9e8d1':'#e3f3e7');
   f(12.5,'500'); tx(String(d),x+6,y+15,fut?'#c7c7cc':INK3); if(o){f(20,'800'); tx(String(v),x+35,y+chh-8,pk>=6?'#7a2e00':INK,'center'); if(pk){f(11.5,'600'); tx('택배'+pk,x+65,y+15,pk>=6?'#7a2e00':INK3,'right');}} }
  /* 5. 본인이 적은 업무 묶음 */
  var tp=cardTop(n), y0=644, rows=Math.min(5,Math.ceil(Math.min(tp.a.length,10)/2))||1, gh=52+rows*28+10;
  rr(40,y0,1160,gh,16,BG); f(20,'700'); tx('③ 본인이 적은 업무',62,y0+36,BLUE); f(13.5,'500'); tx('비슷한 일끼리 묶어 많이 적은 순 · 적은 회수 (그중 완료)',1178,y0+35,INK3,'right');
  if(!tp.a.length){f(16,'500'); tx('적은 줄이 없습니다',62,y0+72,INK3);}
  tp.a.slice(0,10).forEach(function(a,i){var cx=62+(i%2)*580, cy=y0+72+Math.floor(i/2)*28; f(16,'700'); tx((i+1)+'.',cx,cy,INK3); f(16,'600'); tx(fit(a[0],380),cx+30,cy,INK); f(16,'800'); tx(a[1]+'회',cx+478,cy,INK,'right'); f(13.5,'500'); tx('(완료 '+a[2]+')',cx+484,cy,INK3);});
  var y=y0+gh+16;
  /* 6. 받은 요청 */
  if(rq.length){ var qh=46+Math.min(rq.length,4)*26+10; rr(40,y,1160,qh,16,'#eef4ff'); f(20,'700'); tx('④ 받은 요청 '+rq.length+'건',62,y+34,BLUE);
   rq.slice(0,4).forEach(function(k,i){var ry=y+64+i*26; f(15.5,'600'); tx((i+1)+'.',62,ry,INK3); tx(fit('지시자 '+(k.from||'미상'),210),90,ry,INK); tx(fit('업무 '+k.t,470),310,ry,INK); tx(fit('기한 '+k.due+(k.pct!=null?' · 진척 '+k.pct+'%':' · 아직 받지 않음')+(k.note?' · '+k.note:''),390),790,ry,INK);});
   y+=qh+16; }
  /* 7. 날짜별 상세 표 */
  var no=rq.length?'⑤':'④'; f(20,'700'); tx(no+' 날짜별 상세',40,y+22,INK); f(13.5,'500'); tx('● 완료   ○ 못 끝냄   숫자 칸 = 자동으로 기록된 업무 건수',1200,y+21,INK3,'right'); y+=36;
  var CX=[40,128,870,926,982,1038,1094,1150], CW=730, HD=['따이공','지원택배','입고','청소','마감','플레이스'], KS=['g','t','i','c','m','p'];
  rr(40,y,1160,30,8,'#1d1d1f'); f(13.5,'700'); tx('날짜',52,y+20,'#fff'); tx('본인이 적은 업무',CX[1],y+20,'#fff'); HD.forEach(function(h,i){tx(h,CX[2]+i*55+26,y+20,'#fff','center');}); y+=30;
  var days=Object.keys(Dn(n)).map(Number).sort(function(a,b){return a-b;}), T=(M&&M.TXT[n])||{}, avail=H-64-y;
  f(14.5,'500');
  var txt=days.map(function(d){var o=Dn(n)[d], a=T[d]; if(a&&!a.length) a=null; if(a) return a.map(function(x){return (x[1]?'● ':'○ ')+x[0];}).join('   '); return o.dn?'완료한 업무 '+o.dn+'줄':'적은 줄 없음';});
  var ml=5,LH=19,PAD=11,lines; for(;ml>=1;ml--){ lines=txt.map(function(t){var w=wrap(t,CW); if(w.length>ml){w=w.slice(0,ml); w[ml-1]=fit(w[ml-1]+' …………',CW);} return w;}); var need=lines.reduce(function(s,l){return s+l.length*LH+PAD;},0); if(need<=avail) break; } if(ml<1){LH=17;PAD=6;}
  days.forEach(function(d,i){ var o=Dn(n)[d], l=lines[i], h=l.length*LH+PAD, pk=o.g+o.t; if(y+h>H-58) return;
   if(pk>=6) {g.fillStyle='#fff1e0'; g.fillRect(40,y,1160,h);} else if(i%2){g.fillStyle='#fafafc'; g.fillRect(40,y,1160,h);}
   f(14.5,'700'); tx(MON()+'/'+d+' ('+WD[new Date(YEAR(),MON()-1,d).getDay()]+')',52,y+LH+1,INK); f(14.5,'500'); l.forEach(function(s,j){tx(s,CX[1],y+LH+1+j*LH,T[d]?INK:INK3);});
   KS.forEach(function(k,j){var v=o[k]; f(15,v?'800':'400'); tx(v?String(v):'·',CX[2]+j*55+26,y+LH+1,v?((k==='g'||k==='t')&&pk>=6?ORG:INK):OFF,'center');});
   y+=h; hl(40,1200,y); });
  f(12.5,'500'); tx('Q-POS가 기록에서 자동으로 정리한 문서입니다 · 합계는 건수를 그대로 더한 값이며 업무별 무게는 반영하지 않았습니다',W/2,H-34,INK3,'center');
  return cv;}
 function dlgCard(n){
  if(!M){ loadMonth.then=function(){dlgCard(n);}; loadMonth(false); $('dlg').innerHTML='<div class="dbox cardbox"><h2>이달 기록을 불러오는 중입니다…</h2><button type="button" class="b2 s" data-act="close">닫기</button></div>'; $('dlg').hidden=false; return; }
  if(!n||NAMES().indexOf(n)<0) n=ME(); var url=drawCard(n).toDataURL('image/png');
  $('dlg').innerHTML='<div class="dbox cardbox"><div class="cardhd"><h2>이달 업무 현황 그림</h2><select class="sel" id="cardSel" aria-label="직원 고르기">'+NAMES().slice().sort(function(a,b){return total(b)-total(a);}).map(function(x){return '<option'+(x===n?' selected':'')+'>'+esc(x)+'</option>';}).join('')+'</select><a class="b1 s" id="cardDl" download="업무현황_'+YMD().slice(0,7)+'_'+esc(n)+'.png" href="'+url+'">PNG 저장</a><button type="button" class="b2 s" data-act="close">닫기</button></div><img class="cardimg" alt="'+esc(n)+' 업무 현황" src="'+url+'"><p class="no" style="margin:0;font-size:12.5px">A4 세로 크기(300dpi)라 그대로 인쇄할 수 있습니다. 저장 단추가 안 먹히는 기기에서는 그림을 길게 누르거나 오른쪽 단추로 저장하시면 됩니다.</p></div>';
  $('dlg').hidden=false;}
 

 R.addEventListener('click',function(ev){
  var b=ev.target.closest('[data-act]'); if(!b) return; var a=b.dataset.act, id=b.dataset.id, i;
  if(a==='pill'){toggle();}
  else if(a==='view'){S.view=b.dataset.v;S.noteFor=null;render(S.view==='mini'?'newMini':null);}
  else if(a==='closeSheet'){S.view='pill';render();}
  else if(a==='admin'){S.admin=!S.admin; if(S.admin) S.tab='team'; render();}
  else if(a==='tab'){S.tab=b.dataset.v; if(S.view!=='full'){S.view='full'; if(A.open) try{A.open();}catch(e){}} render();}
  else if(a==='reload'){M=null;loadMonth(true);render();}
  else if(a==='rec'){S.tab='rec';S.rp=b.dataset.n;S.rmode='month';S.rday=lastDay(S.rp);render();}
  else if(a==='rmode'){S.rmode=b.dataset.v;render();}
  else if(a==='rday'){S.rday=+b.dataset.d;render();}
  else if(a==='add'){addLine(b.dataset.src);}
  else if(a==='pct'){i=find(Z.tasks,id); if(i<0) return; var v=+b.dataset.v; if(v===100){S.noteFor=null;move(id,'tasks','done');render();} else { doOp(function(){return A.pct(id,v,null);}); S.noteFor=id; render(); var e=R.querySelector('.pn input'); if(e){e.focus();e.select();} }}
  else if(a==='noteok'){saveNote(id);}
  else if(a==='noteno'){S.noteFor=null;render();}
  else if(a==='accept'){move(id,'incoming','tasks',0);render();}
  else if(a==='mv'){move(id,b.dataset.from,b.dataset.to);render();}
  else if(a==='del'){ if(doOp(function(){return A.del(id);})) toast('지웠습니다.'); render();}
  else if(a==='nego'){dlgNego(id);}
  else if(a==='send'){dlgSend(b.dataset.to,b.dataset.pref);}
  else if(a==='proxy'){dlgProxy();}
  else if(a==='close'){$('dlg').hidden=true;}
  else if(a==='card'){dlgCard(b.dataset.n);}
  else if(a==='legacy'){S.view='pill';render(); try{A.legacy();}catch(e){}}
 });
 R.addEventListener('keydown',function(ev){ var t=ev.target; ev.stopPropagation();
  if(ev.key==='Enter'&&t.dataset&&t.dataset.new){ev.preventDefault();addLine(t.id);return;}
  if(ev.key==='Enter'&&t.dataset&&t.dataset.note){ev.preventDefault();saveNote(t.dataset.note);return;}
  if(ev.key==='Escape'){ if(!$('dlg').hidden) $('dlg').hidden=true; else if(S.view!=='pill'){S.view='pill';render();} } });
 R.addEventListener('keyup',function(ev){ev.stopPropagation();}); R.addEventListener('keypress',function(ev){ev.stopPropagation();});
 R.addEventListener('change',function(ev){ var t=ev.target; if(t.id==='sTo') loadInfo(); if(t.id==='cardSel') dlgCard(t.value); if(t.id==='rp'){S.rp=t.value;S.rday=lastDay(S.rp);render();} });
 R.addEventListener('submit',function(ev){
  ev.preventDefault(); var f=ev.target.id;
  if(f==='fSend'){var t=$('sT').value.trim(); if(!t){$('sT').focus();return;} var to=$('sTo').value, due=$('sDue').value; if(!to) return; if(doOp(function(){return A.send(to,t,due);})){ $('dlg').hidden=true; M=null; toast(to+' 님께 요청을 보냈습니다. 받는 분 화면의 «도착한 요청»에 뜹니다.'); } render();}
  if(f==='fProxy'){var pt=$('pT').value.trim(), pf=$('pFrom').value.trim(); if(!pt){$('pT').focus();return;} if(doOp(function(){return A.proxy(pf||'미상',pt,$('pDue').value);})){ $('dlg').hidden=true; M=null; toast('대신 등록했습니다. 오늘 업무에 올라갔습니다.'); } render();}
  if(f==='fNego'){var nid=ev.target.dataset.id; if(doOp(function(){return A.nego(nid,$('nDue').value,$('nWhy').value.trim());})){ $('dlg').hidden=true; toast('기한 조율을 요청했습니다.'); } render();}
 });
 function toggle(){ S.noteFor=null; if(S.view==='pill'){ S.view='mini'; if(A.open) try{A.open();}catch(e){} render('newMini'); } else { S.view='pill'; render(); } }
 function openFull(tab){ S.view='full'; if(tab) S.tab=tab; if(A.open) try{A.open();}catch(e){} render(); }
 if(A.onChange) A.onChange(refresh);
 render();
 return {toggle:toggle, openFull:openFull, refresh:refresh, close:function(){S.view='pill';render();}, isOpen:function(){return S.view!=='pill';}, state:S, root:R, reloadMonth:function(){M=null;}};
}
window.QWORK={mount:mount, AK:AK, version:'2026.11.24'};
})();
