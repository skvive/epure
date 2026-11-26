/** Source-cited public FAQ retrieval, safe for a read-only LEXID AI adapter. */
const normalize=s=>String(s??"").normalize("NFKC").toLowerCase().replace(/[^가-힣a-z0-9]+/g," ").trim();
const grams=s=>{const arr=normalize(s).split(/\s+/).filter(t=>t.length>=2),out=new Set();for(const t of arr){out.add(t);if(t.length>2)for(let i=0;i<t.length-1;i++)out.add(t.slice(i,i+2))}return out};
export function searchEpurePublicFaq(kb,query,{limit=3}={}){
 if(!Array.isArray(kb?.entries)||!normalize(query))return[];
 const q=grams(query);if(!q.size)return[];
 return kb.entries.map(item=>{
  if(!item?.question||!item?.answer||!/^https:\/\/epure\.lexid\.site\/guide\.html#q\d+$/.test(item.source_url||""))return null;
  const a=grams(item.question),b=grams(item.answer);
  let score=normalize(item.question).includes(normalize(query))?24:0;
  for(const t of q)score+=a.has(t)?(t.length>2?4:2):b.has(t)?1:0;
  return score>=4?{id:item.id,question:item.question,answer:item.answer,citation_url:item.source_url,source_status:item.source_status,score}:null;
 }).filter(Boolean).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,Math.max(1,Math.min(Number(limit)||3,10)));
}
