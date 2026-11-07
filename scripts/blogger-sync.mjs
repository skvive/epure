import fs from 'node:fs/promises';
const base = new URL('../', import.meta.url);
const posts = JSON.parse(await fs.readFile(new URL('content/articles.json',base),'utf8'));
const opts = new Set(process.argv.slice(2));
const apply = opts.has('--apply'), publish = opts.has('--publish');
const blogId = process.env.BLOGGER_BLOG_ID;
const required=['BLOGGER_BLOG_ID','BLOGGER_CLIENT_ID','BLOGGER_CLIENT_SECRET','BLOGGER_OAUTH_REFRESH_TOKEN'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const postBody = a=>`<p>${esc(a.excerpt)}</p>${a.body.map(([heading,copy])=>`<h2>${esc(heading)}</h2><p>${esc(copy)}</p>`).join('')}<p><a href="https://bielnora.lexid.site/article-${encodeURIComponent(a.slug)}.html">BIELNORA 원문 및 컬렉션 살펴보기 →</a></p><p><small>© 2026 BIELNORA / 브랜드 데모</small></p>`;
if (!apply) { console.log(JSON.stringify({mode:'dry-run',publish:false,items:posts.map(p=>({title:p.title,slug:p.slug,labels:[p.category,'bielnora-origin']}))},null,2));process.exit(0); }
if (required.some(k=>!process.env[k])) { console.error('Missing OAuth env: '+required.filter(k=>!process.env[k]).join(', '));process.exit(2); }
const tokRes=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:process.env.BLOGGER_CLIENT_ID,client_secret:process.env.BLOGGER_CLIENT_SECRET,refresh_token:process.env.BLOGGER_OAUTH_REFRESH_TOKEN,grant_type:'refresh_token'})});
if(!tokRes.ok)throw Error('Google OAuth refresh failed '+tokRes.status);const {access_token}=await tokRes.json();if(!access_token)throw Error('No access token');
const endpoint=`https://www.googleapis.com/blogger/v3/blogs/${encodeURIComponent(blogId)}/posts`;
const auth={Authorization:`Bearer ${access_token}`};
async function api(url,method='GET',payload){const r=await fetch(url,{method,headers:{...auth,...(payload?{'content-type':'application/json'}:{})},body:payload?JSON.stringify(payload):undefined});if(!r.ok)throw Error(`${method} Blogger ${r.status}: ${(await r.text()).slice(0,150)}`);return r.json()}
const existing=new Set();for(const status of ['published','draft']){let token='';do{const q=new URLSearchParams({status,maxResults:'100',fetchBodies:'false'});if(token)q.set('pageToken',token);const r=await api(`${endpoint}?${q}`);(r.items||[]).forEach(x=>existing.add(x.title));token=r.nextPageToken||''}while(token)}
for(const post of posts){if(existing.has(post.title)){console.log('SKIP existing:',post.title);continue}
const body={kind:'blogger#post',title:post.title,content:postBody(post),labels:[post.category,'bielnora-origin']};
const result=await api(`${endpoint}?isDraft=true`,'POST',body);
console.log('DRAFT CREATED',result.id,post.title);
if(publish){await api(`${endpoint}/${result.id}/publish`,'POST');console.log('PUBLISHED',post.title)}
}
