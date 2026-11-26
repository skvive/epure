import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {searchEpurePublicFaq} from '../content/epure-public-retrieval.mjs';
const kb=JSON.parse(readFileSync('content/epure-public-facts-v1.json','utf8'));
const guide=readFileSync('guide.html','utf8');
test('ÉPURE FAQ provenance, canonical and no fabricated retail claims',()=>{
 assert.equal(kb.entries.length,12);
 assert.equal(new Set(kb.entries.map(x=>x.question)).size,12);
 assert.equal((guide.match(/class="guide-qa"/g)||[]).length,12);
 assert.match(guide,/rel="canonical" href="https:\/\/epure\.lexid\.site\/guide\.html"/);
 assert.ok(kb.entries.every(x=>x.source_url.startsWith('https://epure.lexid.site/guide.html#q')));
});
test('LEXID AI local retrieval cites only public guide',()=>{
 for(const [query,term] of [["실제 상품 판매 쇼핑몰","판매"],["실제 파리 매장 운영","파리"],["VIP 피팅 예약","피팅"],["뉴스레터 발송","뉴스레터"]]){
  const result=searchEpurePublicFaq(kb,query,{limit:4});
  assert.ok(result.some(x=>x.question.includes(term)),query);
  assert.ok(result.every(x=>x.citation_url.startsWith('https://epure.lexid.site/guide.html#q')));
 }
 assert.deepEqual(searchEpurePublicFaq(kb,''),[]);
 assert.deepEqual(searchEpurePublicFaq({entries:[{question:'비밀 사항',answer:'내부',source_url:'https://internal.lexid.site/guide.html#q1'}]},'비밀 사항'),[]);
});
