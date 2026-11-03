/* learn-engine.js — tutorial grid, search and reader. Needs learn-core.js + learn-data.js */
(function(){
'use strict';
var C=window.LearnCore, TUTS=window.TUTS, BUILTIN=TUTS.slice();
var $=function(id){return document.getElementById(id);};
var gridEl=$('l-grid'), catsEl=$('l-cats'), cntEl=$('l-count'), moreEl=$('l-more'), emptyEl=$('l-empty');
if(!gridEl) return;
var SHOW_ALL=gridEl.getAttribute('data-all')==='1';
var L={q:'',cat:'all',all:SHOW_ALL,list:TUTS.slice()};
TUTS.forEach(C.prepare);

function cardHTML(t){
  return '<button type="button" class="lcard" data-c="'+t.cat+'" data-id="'+t.id+'"><div class="meta"><span class="cat"><i></i>'+C.catName(t.cat)+'</span><span>'+t.lvl+'</span><span>'+C.fa(t.min)+' دقیقه</span></div><h4>'+C.escH(t.title)+'</h4><p>'+C.escH(t.sum)+'</p><span class="go">خواندن آموزش</span></button>';
}
function renderCats(){
  var btn=function(id,name,n){ return '<button type="button" role="tab" data-f="'+id+'" class="'+(L.cat===id?'on':'')+'" aria-selected="'+(L.cat===id)+'">'+name+' <span style="opacity:.6">('+C.fa(n)+')</span></button>'; };
  catsEl.innerHTML=btn('all','همه',TUTS.length)+C.CATS.filter(function(c){return TUTS.some(function(t){return t.cat===c.id;});}).map(function(c){return btn(c.id,c.name,TUTS.filter(function(t){return t.cat===c.id;}).length);}).join('');
}
function renderGrid(){
  var list=TUTS.slice();
  if(L.q.trim()){ var r=C.search(TUTS,L.q); if(r) list=r; }
  if(L.cat!=='all') list=list.filter(function(t){return t.cat===L.cat;});
  L.list=list;
  var filtering=!!L.q.trim()||L.cat!=='all';
  var limit=(!filtering&&!L.all)?9:list.length;
  gridEl.innerHTML=list.slice(0,limit).map(cardHTML).join('');
  if(moreEl) moreEl.style.display=list.length>limit?'flex':'none';
  if(emptyEl) emptyEl.hidden=list.length>0;
  var ncat=C.CATS.filter(function(c){return TUTS.some(function(t){return t.cat===c.id;});}).length;
  cntEl.textContent=filtering?C.fa(list.length)+' آموزش پیدا شد':C.fa(TUTS.length)+' آموزش در '+C.fa(ncat)+' دسته';
}
renderCats(); renderGrid();
catsEl.addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; L.cat=b.dataset.f; renderCats(); renderGrid(); });
$('l-q').addEventListener('input',function(e){ L.q=e.target.value; renderGrid(); });
if($('l-more-btn')) $('l-more-btn').addEventListener('click',function(){ L.all=true; renderGrid(); });
gridEl.addEventListener('click',function(e){ var c=e.target.closest('.lcard'); if(c) openT(c.dataset.id); });

/* ---------- reader ---------- */
var R={el:$('reader'),panel:$('r-panel'),body:$('r-body'),meta:$('r-meta'),bar:$('r-bar'),prev:$('r-prev'),next:$('r-next')};
var curT=null,isOpen=false,lastFocus=null,pushed=false;
function lenis(){ return window.__lenis||null; }
function copyText(txt,btn){
  var old=btn.textContent;
  var done=function(){ btn.textContent='کپی شد ✓'; setTimeout(function(){ btn.textContent=old; },1400); };
  var fb=function(){ var ta=document.createElement('textarea'); ta.value=txt; ta.style.cssText='position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); done(); }catch(e){} ta.remove(); };
  if(navigator.clipboard&&window.isSecureContext) navigator.clipboard.writeText(txt).then(done,fb); else fb();
}
function openT(id,fromPop){
  var t=TUTS.filter(function(x){return x.id===id;})[0]; if(!t) return;
  if(isOpen&&curT&&curT.id===id) return;
  var wasOpen=isOpen; curT=t; R.el.dataset.c=t.cat;
  R.meta.innerHTML='<span class="cat"><i></i>'+C.catName(t.cat)+'</span><span>'+t.lvl+'</span><span>'+C.fa(t.min)+' دقیقه</span>';
  R.body.innerHTML=C.renderArticle(t);
  var nav=L.list.indexOf(t)>-1?L.list:TUTS, i=nav.indexOf(t), pv=nav[i-1], nx=nav[i+1];
  R.prev.disabled=!pv; R.next.disabled=!nx; R.prev.dataset.id=pv?pv.id:''; R.next.dataset.id=nx?nx.id:'';
  R.prev.querySelector('span').textContent=pv?pv.title:'—'; R.next.querySelector('span').textContent=nx?nx.title:'—';
  R.panel.scrollTo({top:0,behavior:'instant'}); R.bar.style.transform='scaleX(0)';
  document.title=t.title+' | آموزش Roham Prog';
  if(!wasOpen){
    isOpen=true; lastFocus=document.activeElement; R.el.classList.add('open'); document.body.classList.add('lock');
    if(lenis()) lenis().stop();
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ R.el.classList.add('show'); }); });
  }
  try{ R.panel.focus({preventScroll:true}); }catch(e){}
  if(!fromPop){ try{ var h='#learn-'+id; if(wasOpen) history.replaceState(null,'',h); else if(location.hash!==h){ history.pushState(null,'',h); pushed=true; } }catch(e){} }
}
var BASE_TITLE=document.title;
function closeT(fromPop){
  if(!isOpen) return; isOpen=false; curT=null; R.el.classList.remove('show'); document.title=BASE_TITLE;
  setTimeout(function(){ if(!isOpen) R.el.classList.remove('open'); },330);
  document.body.classList.remove('lock'); if(lenis()) lenis().start();
  try{ if(lastFocus&&lastFocus.focus) lastFocus.focus({preventScroll:true}); }catch(e){}
  if(!fromPop){ try{ if(/^#learn-/.test(location.hash)){ if(pushed){ pushed=false; history.back(); } else history.replaceState(null,'','#learn'); } }catch(e){} } else pushed=false;
}
function syncHash(){
  var m=location.hash.match(/^#learn-(.+)$/);
  if(m){ var id=decodeURIComponent(m[1]); if(TUTS.some(function(x){return x.id===id;})) openT(id,true); else closeT(true); }
  else if(isOpen) closeT(true);
}
addEventListener('popstate',syncHash); addEventListener('hashchange',syncHash);
$('r-close').addEventListener('click',function(){closeT();}); $('r-back').addEventListener('click',function(){closeT();});
$('r-link').addEventListener('click',function(e){ if(curT) copyText(C.SITE.url+'/learn/'+curT.id+'.html',e.currentTarget); });
R.prev.addEventListener('click',function(){ if(R.prev.dataset.id) openT(R.prev.dataset.id); });
R.next.addEventListener('click',function(){ if(R.next.dataset.id) openT(R.next.dataset.id); });
R.body.addEventListener('click',function(e){
  var a=e.target.closest('[data-t]');
  if(a){ var h=document.getElementById(a.dataset.t); if(h) h.scrollIntoView({behavior:'smooth',block:'start'}); return; }
  var b=e.target.closest('.cp'); if(!b) return;
  var box=b.closest('.cb')||b.closest('.pbx'), el=box.querySelector('pre code')||box.querySelector('.pt');
  copyText(el.textContent,b);
});
R.body.addEventListener('keydown',function(e){ if(e.key==='Enter'&&e.target.matches('[data-t]')) e.target.click(); });
R.panel.addEventListener('scroll',function(){ var max=R.panel.scrollHeight-R.panel.clientHeight; R.bar.style.transform='scaleX('+(max>0?Math.min(1,R.panel.scrollTop/max):0)+')'; },{passive:true});
document.addEventListener('keydown',function(e){
  if(!isOpen) return;
  if(e.key==='Escape'){ closeT(); return; }
  if(e.key==='Tab'){ var f=[].slice.call(R.panel.querySelectorAll('button:not([disabled]),a[data-t]')); if(!f.length) return;
    var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&(document.activeElement===first||document.activeElement===R.panel)){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); } }
});
syncHash();

/* ---------- extra tutorials added from the admin panel ---------- */
function applyExtra(j){
  if(!j) return;
  var hidden=j.hidden||[], extra=j.tutorials||[];
  var map={}; BUILTIN.forEach(function(t){map[t.id]=t;});
  extra.forEach(function(t){ map[t.id]=C.prepare(t); });
  var out=[]; BUILTIN.forEach(function(t){ if(map[t.id]&&hidden.indexOf(t.id)<0) out.push(map[t.id]); });
  extra.forEach(function(t){ if(!BUILTIN.some(function(b){return b.id===t.id;})&&hidden.indexOf(t.id)<0) out.push(t); });
  TUTS.length=0; out.forEach(function(t){TUTS.push(t);});
  renderCats(); renderGrid(); syncHash();
}
try{ fetch('assets/tutorials-extra.json',{cache:'no-cache'}).then(function(r){ return r.ok?r.json():null; }).then(applyExtra).catch(function(){}); }catch(e){}

window.RohamLearn={
  open:openT, all:function(){return TUTS;}, search:function(q){return C.search(TUTS,q)||[];},
  find:function(title){ title=(title||'').trim(); return TUTS.filter(function(t){return t.title===title;})[0]; }
};
})();
