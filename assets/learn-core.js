/* learn-core.js — shared by the site, the admin panel and the Node build.
   UMD: window.LearnCore in the browser, module.exports in Node. */
(function(root,factory){ if(typeof module==='object'&&module.exports) module.exports=factory(); else root.LearnCore=factory(); })(typeof self!=='undefined'?self:this,function(){
'use strict';
var SITE={url:'https://rohmro.github.io',name:'Roham Prog',author:'Roham',email:'rohamoliyaie@gmail.com',phone:'09231926081',telegram:'Roham_Ro'};
var CATS=[
 {id:'install',name:'نصب و آماده‌سازی'},
 {id:'web',name:'وب و برنامه‌نویسی'},
 {id:'ai',name:'هوش مصنوعی و پرامپت'},
 {id:'edit',name:'ادیت ویدیو و عکس'},
 {id:'sec',name:'امنیت'},
 {id:'daily',name:'مهارت‌های روزمره و کار'},
 {id:'tips',name:'مسیر و ترفندها'}
];
var LEVELS=['مبتدی','متوسط','پیشرفته'];
var BLOCKS=['p','h','ul','ol','code','prompt','tip','warn'];
function catName(id){ for(var i=0;i<CATS.length;i++) if(CATS[i].id===id) return CATS[i].name; return ''; }
function fa(n){ return Number(n).toLocaleString('fa-IR'); }
function escH(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function inl(s){ return escH(s).replace(/\[\[(.+?)\]\]/g,'<code>$1</code>').replace(/`([^`\n]+?)`/g,'<code>$1</code>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>'); }
function plain(s){ return String(s).replace(/\*\*|\[\[|\]\]|`/g,''); }
function norm(s){ return (s||'').toLowerCase()
  .replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[ۀة]/g,'ه')
  .replace(/[ً-ٟـ]/g,'').replace(/‌/g,' ')
  .replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);})
  .replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);})
  .replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim(); }
function lev(a,b){ if(Math.abs(a.length-b.length)>2) return 9; var m=[],i,j; for(i=0;i<=b.length;i++) m.push(i);
  for(i=1;i<=a.length;i++){ var p=m[0]; m[0]=i; for(j=1;j<=b.length;j++){ var t=m[j]; m[j]=Math.min(m[j]+1,m[j-1]+1,p+(a[i-1]===b[j-1]?0:1)); p=t; } } return m[b.length]; }
function flat(body){ return body.map(function(x){ return Array.isArray(x[1])?x[1].join(' '):x[1]; }).join(' '); }
function prepare(t){ t._h=norm(t.title); t._t=norm(t.tags||''); t._s=norm(t.sum||''); t._b=norm(plain(flat(t.body))); return t; }
var STOP={}; ('آموزش آموزشی ها های یاد بگیرم بگیر می میخوام خوام چطور چگونه راهنما راهنمایی لطفا برای رو را از به در با و یه یک کنم کنیم بلدم how to tutorial learn the a of').split(' ').forEach(function(w){ STOP[w]=1; });
/* null when the query has no meaningful word, otherwise a ranked list */
function search(list,q){
  var toks=norm(q).split(' ').filter(function(t){ return t&&!STOP[t]; });
  if(!toks.length) return null;
  var out=[];
  list.forEach(function(t){
    if(!t._h) prepare(t);
    var s=0,ok=true;
    for(var i=0;i<toks.length;i++){ var k=toks[i],ks=0;
      if(t._h.indexOf(k)>-1) ks+=6; if(t._t.indexOf(k)>-1) ks+=4; if(t._s.indexOf(k)>-1) ks+=2; if(t._b.indexOf(k)>-1) ks+=1;
      if(!ks&&k.length>=4){ var ws=(t._h+' '+t._t).split(' '); for(var j=0;j<ws.length;j++){ if(ws[j].length>=4&&lev(ws[j],k)<=1){ ks+=2; break; } } }
      if(!ks){ ok=false; break; } s+=ks; }
    if(ok) out.push([s,t]);
  });
  return out.sort(function(a,b){ return b[0]-a[0]; }).map(function(x){ return x[1]; });
}
function renderBody(t){
  var toc=[],hi=0;
  var html=t.body.map(function(b){
    var k=b[0],v=b[1];
    if(k==='p') return '<p>'+inl(v)+'</p>';
    if(k==='h'){ var id='h'+(hi++); toc.push([id,v]); return '<h3 id="'+id+'">'+inl(v)+'</h3>'; }
    if(k==='ul') return '<ul>'+v.map(function(i){return '<li>'+inl(i)+'</li>';}).join('')+'</ul>';
    if(k==='ol') return '<ol>'+v.map(function(i){return '<li>'+inl(i)+'</li>';}).join('')+'</ol>';
    if(k==='code') return '<div class="cb"><button type="button" class="cp">کپی</button><pre><code>'+escH(v)+'</code></pre></div>';
    if(k==='prompt') return '<div class="pbx"><div class="pl">پرامپت نمونه<button type="button" class="cp">کپی</button></div><div class="pt" dir="auto">'+escH(v)+'</div></div>';
    if(k==='tip') return '<aside class="call tip"><b>نکته</b>'+inl(v)+'</aside>';
    if(k==='warn') return '<aside class="call warn"><b>احتیاط</b>'+inl(v)+'</aside>';
    return '';
  }).join('');
  return {html:html,toc:toc};
}
function renderArticle(t){
  var r=renderBody(t);
  var tocH=r.toc.length>=3?'<nav class="r-toc"><b>در این آموزش</b>'+r.toc.map(function(x){return '<a tabindex="0" role="button" data-t="'+x[0]+'">'+inl(x[1])+'</a>';}).join('')+'</nav>':'';
  return '<h2 id="r-title">'+escH(t.title)+'</h2><p class="lvl">'+escH(t.sum)+'</p>'+tocH+r.html;
}
/* ---------- text <-> blocks (admin editor) ---------- */
function textToBlocks(text){
  var lines=String(text||'').replace(/\r/g,'').split('\n'),out=[],i=0,para=[];
  function flush(){ if(para.length){ out.push(['p',para.join(' ')]); para=[]; } }
  while(i<lines.length){
    var ln=lines[i],m;
    if(/^```/.test(ln)){ flush(); var lang=ln.slice(3).trim().toLowerCase(),buf=[]; i++;
      while(i<lines.length&&!/^```\s*$/.test(lines[i])){ buf.push(lines[i]); i++; } i++;
      out.push([lang==='prompt'?'prompt':'code',buf.join('\n')]); continue; }
    if(/^\s*$/.test(ln)){ flush(); i++; continue; }
    if((m=ln.match(/^##\s+(.+)$/))){ flush(); out.push(['h',m[1].trim()]); i++; continue; }
    if(/^\s*[-•]\s+/.test(ln)){ flush(); var ul=[]; while(i<lines.length&&/^\s*[-•]\s+/.test(lines[i])){ ul.push(lines[i].replace(/^\s*[-•]\s+/,'').trim()); i++; } out.push(['ul',ul]); continue; }
    if(/^\s*[0-9۰-۹]+[.)]\s+/.test(ln)){ flush(); var ol=[]; while(i<lines.length&&/^\s*[0-9۰-۹]+[.)]\s+/.test(lines[i])){ ol.push(lines[i].replace(/^\s*[0-9۰-۹]+[.)]\s+/,'').trim()); i++; } out.push(['ol',ol]); continue; }
    if((m=ln.match(/^>\s*(نکته|tip)\s*[:：]\s*(.*)$/i))){ flush(); out.push(['tip',m[2].trim()]); i++; continue; }
    if((m=ln.match(/^>\s*(احتیاط|هشدار|warn|warning)\s*[:：]\s*(.*)$/i))){ flush(); out.push(['warn',m[2].trim()]); i++; continue; }
    para.push(ln.trim()); i++;
  }
  flush(); return out;
}
function blocksToText(body){
  return body.map(function(b){
    var k=b[0],v=b[1];
    if(k==='p') return v;
    if(k==='h') return '## '+v;
    if(k==='ul') return v.map(function(x){return '- '+x;}).join('\n');
    if(k==='ol') return v.map(function(x,i){return (i+1)+'. '+x;}).join('\n');
    if(k==='code') return '```\n'+v+'\n```';
    if(k==='prompt') return '```prompt\n'+v+'\n```';
    if(k==='tip') return '> نکته: '+v;
    if(k==='warn') return '> احتیاط: '+v;
    return '';
  }).join('\n\n');
}
function validate(t,existingIds){
  var e=[];
  if(!t.id||!/^[a-z0-9][a-z0-9-]{1,40}$/.test(t.id)) e.push('شناسه (id) باید انگلیسی کوچک، عدد یا خط‌تیره باشد (۲ تا ۴۱ نویسه).');
  if(existingIds&&existingIds.indexOf(t.id)>-1) e.push('این شناسه قبلاً وجود دارد.');
  if(!t.title||t.title.length<4) e.push('عنوان خیلی کوتاه است.');
  if(!CATS.some(function(c){return c.id===t.cat;})) e.push('دسته نامعتبر است.');
  if(LEVELS.indexOf(t.lvl)<0) e.push('سطح نامعتبر است.');
  if(!(t.min>0)) e.push('زمان مطالعه باید عدد مثبت باشد.');
  if(!t.sum||t.sum.length<10) e.push('خلاصه خیلی کوتاه است.');
  if(!t.body||!t.body.length) e.push('متن آموزش خالی است.');
  else if(!t.body.some(function(b){return b[0]==='p'||b[0]==='ul'||b[0]==='ol';})) e.push('حداقل یک پاراگراف یا فهرست لازم است.');
  return e;
}
/* ---------- static page for SEO ---------- */
function jsonLd(o){ return JSON.stringify(o).replace(/</g,'\\u003c'); }
function pageHTML(t,all,date){
  var url=SITE.url+'/learn/'+t.id+'.html', d=date||new Date().toISOString().slice(0,10);
  var rel=(all||[]).filter(function(x){return x.cat===t.cat&&x.id!==t.id;}).slice(0,6);
  var kw=(t.tags||'').split(/\s+/).filter(Boolean).slice(0,15).join('، ');
  var desc=plain(t.sum).slice(0,155);
  var ld={'@context':'https://schema.org','@graph':[
    {'@type':'Article','headline':t.title,'description':plain(t.sum),'inLanguage':'fa','author':{'@type':'Person','name':'رهام (Roham)','url':SITE.url+'/'},'publisher':{'@type':'Person','name':'Roham Prog','url':SITE.url+'/'},'mainEntityOfPage':url,'dateModified':d,'keywords':kw,'articleSection':catName(t.cat),'timeRequired':'PT'+t.min+'M'},
    {'@type':'BreadcrumbList','itemListElement':[
      {'@type':'ListItem','position':1,'name':'Roham Prog','item':SITE.url+'/'},
      {'@type':'ListItem','position':2,'name':'آموزش‌ها','item':SITE.url+'/tutorials.html'},
      {'@type':'ListItem','position':3,'name':t.title,'item':url}]}]};
  return '<!doctype html>\n<html lang="fa" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n'+
  '<title>'+escH(t.title)+' | آموزش Roham Prog</title>\n'+
  '<meta name="description" content="'+escH(desc)+'">\n<meta name="keywords" content="'+escH(kw)+'">\n'+
  '<link rel="canonical" href="'+url+'">\n<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">\n<meta name="theme-color" content="#04050c">\n'+
  '<meta property="og:type" content="article"><meta property="og:locale" content="fa_IR"><meta property="og:site_name" content="Roham Prog">\n'+
  '<meta property="og:title" content="'+escH(t.title)+'"><meta property="og:description" content="'+escH(desc)+'"><meta property="og:url" content="'+url+'"><meta property="og:image" content="'+SITE.url+'/assets/og.png">\n'+
  '<meta name="twitter:card" content="summary_large_image">\n<link rel="icon" href="../favicon.svg" type="image/svg+xml">\n'+
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;800&display=swap">\n'+
  '<link rel="stylesheet" href="../assets/page.css"><link rel="stylesheet" href="../assets/theme.css">\n<script type="application/ld+json">'+jsonLd(ld)+'</script>\n</head>\n<body>\n'+
  '<canvas class="bg-fluid" aria-hidden="true"></canvas><div class="bg-dim"></div><header class="nav"><a class="brand" href="../index.html"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2.5 9c2.5 0 2.5 4.2 5 4.2S10 9 12 9s2.5 4.2 5 4.2S19.5 9 21.5 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M2.5 15c2.5 0 2.5 4.2 5 4.2S10 15 12 15s2.5 4.2 5 4.2S19.5 15 21.5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.5"/></svg>Roham prog</a><nav class="linkpill"><a href="../index.html#services">خدمات</a><a href="../tutorials.html">آموزش‌ها</a><a href="../index.html#about">درباره من</a><a href="../index.html#faq">پرسش و پاسخ</a><a href="../index.html#contact">تماس</a></nav><a class="pill" href="../index.html#contact">تماس سریع</a></header>\n'+
  '<main class="art">\n<p class="crumb"><a href="../index.html">خانه</a> › <a href="../tutorials.html">آموزش‌ها</a> › '+escH(catName(t.cat))+'</p>\n'+
  '<h1>'+escH(t.title)+'</h1>\n<p class="meta"><span>'+escH(catName(t.cat))+'</span><span>'+escH(t.lvl)+'</span><span>'+fa(t.min)+' دقیقه</span></p>\n<p class="lead">'+escH(t.sum)+'</p>\n'+
  renderBody(t).html+'\n<p class="cta"><a href="../index.html#learn-'+t.id+'">باز کردن در خواننده سایت</a> · <a href="../index.html#contact">سؤال دارید؟ با رهام در تماس باشید</a></p>\n'+
  (rel.length?'<section class="rel"><h2>آموزش‌های مرتبط</h2><ul>'+rel.map(function(x){return '<li><a href="'+x.id+'.html">'+escH(x.title)+'</a></li>';}).join('')+'</ul></section>\n':'')+
  '</main>\n<footer class="foot">Copyright © Roham Prog 2026 · <a href="mailto:'+SITE.email+'">'+SITE.email+'</a> · <a href="https://t.me/'+SITE.telegram+'">@'+SITE.telegram+'</a></footer>\n'+
  '<script type="module" src="../assets/fluid.js"></script>\n<script>document.addEventListener("click",function(e){var b=e.target.closest(".cp");if(!b)return;var box=b.closest(".cb")||b.closest(".pbx");var el=box.querySelector("pre code")||box.querySelector(".pt");navigator.clipboard&&navigator.clipboard.writeText(el.textContent).then(function(){var o=b.textContent;b.textContent="کپی شد ✓";setTimeout(function(){b.textContent=o},1400)})});</script>\n</body>\n</html>\n';
}
return {SITE:SITE,CATS:CATS,LEVELS:LEVELS,BLOCKS:BLOCKS,catName:catName,fa:fa,escH:escH,inl:inl,plain:plain,norm:norm,lev:lev,flat:flat,prepare:prepare,search:search,renderBody:renderBody,renderArticle:renderArticle,textToBlocks:textToBlocks,blocksToText:blocksToText,validate:validate,pageHTML:pageHTML};
});
