import fs from 'node:fs/promises';
const url=process.env.BLOGGER_URL;
if(!url){console.log('BLOGGER_URL not set; no external posts fetched.');process.exit(0)}
const base=new URL(url);if(!['https:','http:'].includes(base.protocol))throw Error('Invalid URL');
const feed=new URL('/feeds/posts/default?alt=json&max-results=50',base);
const r=await fetch(feed,{headers:{accept:'application/json'}});if(!r.ok)throw Error(`Blogger feed ${r.status}`);
const data=await r.json();const entries=(data.feed?.entry||[]).filter(e=>!((e.category||[]).some(c=>['bielnora-origin','epure-origin'].includes(c.term)))).map(e=>({title:e.title?.$t||'',url:(e.link||[]).find(l=>l.rel==='alternate')?.href||'',updated:e.updated?.$t||'',summary:(e.summary?.$t||'').replace(/<[^>]*>/g,'').slice(0,250)})).filter(x=>x.title&&x.url);
await fs.writeFile(new URL('../content/blogger-cache.json',import.meta.url),JSON.stringify(entries,null,2));console.log(`Fetched ${entries.length} external Blogger posts`);
