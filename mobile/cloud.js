/* Dependency-free Supabase Auth/REST adapter. Uses local demo mode until config.js is connected. */
window.AcmeCloud=(()=>{
 const c=window.ACME_CONFIG||{}; const demo=c.DEMO_MODE||!c.SUPABASE_URL||c.SUPABASE_URL.includes('YOUR_PROJECT');
 const key='acmeSession';
 const headers=(token)=>({'apikey':c.SUPABASE_ANON_KEY,'Authorization':`Bearer ${token||c.SUPABASE_ANON_KEY}`,'Content-Type':'application/json'});
 const session=()=>JSON.parse(localStorage.getItem(key)||'null');
 const token=()=>session()?.access_token;
 const save=s=>{localStorage.setItem(key,JSON.stringify(s));return s};
 async function request(path,opt={}){const r=await fetch(c.SUPABASE_URL+path,{...opt,headers:{...headers(token()),...(opt.headers||{})}});const body=await r.json().catch(()=>({}));if(!r.ok)throw Error(body.msg||body.message||body.error_description||'Request failed');return body}
 async function signIn(email,password){if(demo)return save({access_token:'demo',user:{id:'demo-student',email,user_metadata:{first_name:email.split('@')[0]},app_metadata:{role:'student'}}});return save(await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})}))}
 async function signUp(email,password,meta){if(demo)return signIn(email,password);return save(await request('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password,data:meta})}))}
 function oauth(provider){if(demo)return null;const redirect=c.OAUTH_REDIRECT||`${c.SITE_URL}/index.html`;location.href=`${c.SUPABASE_URL}/auth/v1/authorize?provider=${encodeURIComponent(provider)}&redirect_to=${encodeURIComponent(redirect)}`}
 function captureOAuth(){if(!location.hash.includes('access_token='))return null;const p=new URLSearchParams(location.hash.slice(1));const s=save({access_token:p.get('access_token'),refresh_token:p.get('refresh_token'),expires_at:Date.now()/1000+Number(p.get('expires_in')),user:null});history.replaceState(null,'',location.pathname);return s}
 async function me(){const s=session();if(!s)return null;if(demo)return s.user;try{return await request('/auth/v1/user')}catch{return null}}
 async function table(name,query=''){return request(`/rest/v1/${name}?${query}`)}
 async function invoke(name,body){return request(`/functions/v1/${name}`,{method:'POST',body:JSON.stringify(body||{})})}
 async function logout(){if(!demo&&token())await request('/auth/v1/logout',{method:'POST'}).catch(()=>{});localStorage.removeItem(key);localStorage.removeItem('acmeProfile');localStorage.removeItem('bandupProfile')}
 function demoMode(){return demo}
 return{signIn,signUp,oauth,captureOAuth,me,table,invoke,logout,session,demoMode};
})();