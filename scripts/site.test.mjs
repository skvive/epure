import { test } from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
test('all html pages have title, canonical, OG, and language',async()=>{const files=(await readdir(root)).filter(x=>x.endsWith('.html'));assert.equal(files.length,16);for(const f of files){const t=await readFile(new URL(f,root),'utf8');for(const key of ['<title>','rel="canonical"','property="og:image"','lang="ko"'])assert.ok(t.includes(key),`${f} missing ${key}`)}});
test('rss has eight articles',async()=>{const rss=await readFile(new URL('feed.xml',root),'utf8');assert.equal((rss.match(/<item>/g)||[]).length,8)});
test('sitemap has 16 pages',async()=>{const xml=await readFile(new URL('sitemap.xml',root),'utf8');assert.equal((xml.match(/<url>/g)||[]).length,16)});
test('no image placeholder paths',async()=>{const files=(await readdir(root)).filter(x=>x.endsWith('.html'));for(const f of files){const text=await readFile(new URL(f,root),'utf8');for(const m of text.matchAll(/src="(assets\/[^"]+)"/g)){const b=await readFile(new URL(m[1],root));assert.ok(b.length>0,`${f} ${m[1]}`)}}});
