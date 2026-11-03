// Usage: node tools/build-pages.mjs   (run from the site root)
// Generates learn/<id>.html for every tutorial, sitemap.xml, robots.txt,
// and refreshes the crawlable link list + ItemList JSON-LD in index.html / tutorials.html.
import fs from 'fs'; import vm from 'vm'; import { createRequire } from 'module';
const require=createRequire(import.meta.url);
const C=require('../assets/learn-core.js');
const ctx={window:{}}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('assets/learn-data.js','utf8'),ctx);
let T=ctx.window.TUTS;
// merge extra tutorials from the admin panel, if present
try{ const x=JSON.parse(fs.readFileSync('assets/tutorials-extra.json','utf8')); const m=new Map(T.map(t=>[t.id,t])); (x.tutorials||[]).forEach(t=>m.set(t.id,t)); (x.hidden||[]).forEach(id=>m.delete(id)); T=[...m.values()]; }catch(e){}
const date=new Date().toISOString().slice(0,10), U=C.SITE.url;
fs.mkdirSync('learn',{recursive:true});
for(const f of fs.readdirSync('learn')) if(f.endsWith('.html')&&!T.some(t=>f===t.id+'.html')) fs.unlinkSync('learn/'+f);
for(const t of T){ const e=C.validate(t); if(e.length) throw new Error(t.id+': '+e.join(' ')); fs.writeFileSync('learn/'+t.id+'.html',C.pageHTML(t,T,date)); }
const urls=[['/',1.0],['/tutorials.html',0.9],...T.map(t=>['/learn/'+t.id+'.html',0.7])];
fs.writeFileSync('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(([p,pr])=>`  <url><loc>${U}${p}</loc><lastmod>${date}</lastmod><changefreq>${p==='/'?'weekly':'monthly'}</changefreq><priority>${pr}</priority></url>`).join('\n')+'\n</urlset>\n');
fs.writeFileSync('robots.txt',`User-agent: *\nAllow: /\nDisallow: /admin.html\n\nSitemap: ${U}/sitemap.xml\n`);
const itemList='<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@type':'ItemList','name':'آموزش‌های Roham Prog','numberOfItems':T.length,'itemListElement':T.map((t,i)=>({'@type':'ListItem','position':i+1,'url':U+'/learn/'+t.id+'.html','name':t.title}))}).replace(/</g,'\\u003c')+'</script>';
const links=C.CATS.map(c=>{ const l=T.filter(t=>t.cat===c.id); return l.length?`<h3>${c.name}</h3><ul>`+l.map(t=>`<li><a href="learn/${t.id}.html">${C.escH(t.title)}</a></li>`).join('')+'</ul>':''; }).join('');
function patch(file,a,b,html){ let s=fs.readFileSync(file,'utf8'); const i=s.indexOf(a),j=s.indexOf(b); if(i<0||j<0) throw new Error('marker '+a+' in '+file); fs.writeFileSync(file,s.slice(0,i+a.length)+html+s.slice(j)); }
patch('index.html','<!--ITEMLIST-->','<!--/ITEMLIST-->',itemList);
patch('tutorials.html','<!--ITEMLIST-->','<!--/ITEMLIST-->',itemList);
patch('tutorials.html','<!--LINKS-->','<!--/LINKS-->',links);
console.log('pages:',T.length,'sitemap urls:',urls.length);
