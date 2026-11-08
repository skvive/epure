import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
const root=resolve(new URL('..', import.meta.url).pathname);
const pages=readdirSync(root).filter(n=>n.endsWith('.html'));
const image=(n)=>join(root,n);
test('21 HTML documents have versioned CSS and SEO image',()=>{
 assert.equal(pages.length,21);
 for(const name of pages){
  const content=readFileSync(join(root,name),'utf8');
  assert.match(content,/\/assets\/styles\.css\?v=2\.[0-9]+\.[0-9]+/);
  assert.match(content,/og:image:width/);
  assert.match(content,/twitter:image/);
  assert.match(content,/apple-touch-icon/);
 }
});
test('all local HTML href and image/script src targets exist',()=>{
 for(const name of pages){
  const html=readFileSync(join(root,name),'utf8');
  const regex=/(?:href|src)="([^"]+)"/g;
  for(const [,raw] of html.matchAll(regex)){
   if(/^(https?:|mailto:|tel:|#|data:)/.test(raw))continue;
   const url=raw.split(/[?#]/)[0];
   if(!url)continue;
   const target=join(root,url.startsWith('/')?url.slice(1):url);
   assert.ok(existsSync(target),`${name}: broken reference ${raw}`);
  }
 }
});
test('SEO assets and PWA manifest icon files present',()=>{
 for(const f of ['assets/og.jpg','assets/monogram.svg','favicon.ico','favicon-32.png','favicon-192.png','favicon-512.png','apple-touch-icon.png','sitemap.xml','robots.txt','feed.xml'])assert.ok(existsSync(image(f)), f);
 const manifest=JSON.parse(readFileSync(join(root,'manifest.webmanifest'),'utf8'));
 for(const entry of manifest.icons)assert.ok(existsSync(image(entry.src.slice(1))),entry.src);
 const sitemap=readFileSync(join(root,'sitemap.xml'),'utf8');
 assert.equal((sitemap.match(/<url>/g)||[]).length,21);
 assert.equal((sitemap.match(/<lastmod>/g)||[]).length,21);
});
