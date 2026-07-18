import {json,admin,zoomToken} from '../_shared/utils.ts';
const secret=Deno.env.get('ZOOM_WEBHOOK_SECRET_TOKEN')!;
async function hmac(value:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const sig=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value));return [...new Uint8Array(sig)].map(b=>b.toString(16).padStart(2,'0')).join('')}
Deno.serve(async(req)=>{try{const raw=await req.text(),body=JSON.parse(raw);
 if(body.event==='endpoint.url_validation')return json({plainToken:body.payload.plainToken,encryptedToken:await hmac(body.payload.plainToken)});
 const ts=req.headers.get('x-zm-request-timestamp')||'',provided=req.headers.get('x-zm-signature')||'',expected=`v0=${await hmac(`v0:${ts}:${raw}`)}`;
 if(Math.abs(Date.now()/1000-Number(ts))>300||provided!==expected)return json({error:'Invalid Zoom signature'},401);
 const allowed=['meeting.participant_joined','meeting.participant_left','meeting.ended','recording.completed'];if(!allowed.includes(body.event))return json({received:true});
 const obj=body.payload.object,meetingId=String(obj.id);const ls=await admin(`/rest/v1/lectures?zoom_meeting_id=eq.${meetingId}&select=id`);if(!ls[0])return json({received:true,matched:false});const lecture_id=ls[0].id;
 if(body.event==='meeting.participant_joined'||body.event==='meeting.participant_left'){
  const pt=obj.participant;let user_id=null;if(pt.email){const r=await admin('/rest/v1/rpc/profile_id_by_email',{method:'POST',body:JSON.stringify({lookup_email:pt.email})});user_id=r||null}
  if(user_id){let joined=pt.join_time||new Date().toISOString();if(body.event.endsWith('left')){const existing=await admin(`/rest/v1/attendance?lecture_id=eq.${lecture_id}&user_id=eq.${user_id}&select=joined_at`);if(existing[0]?.joined_at)joined=existing[0].joined_at}const payload:any={lecture_id,user_id,zoom_participant_id:String(pt.id||pt.user_id||''),joined_at:joined};if(body.event.endsWith('left')){payload.left_at=pt.leave_time||new Date().toISOString();payload.duration_minutes=Math.max(0,Math.round((new Date(payload.left_at).getTime()-new Date(joined).getTime())/60000))}
   await admin('/rest/v1/attendance?on_conflict=lecture_id,user_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify(payload)})
  }
 }
 if(body.event==='meeting.ended')await admin(`/rest/v1/lectures?id=eq.${lecture_id}`,{method:'PATCH',body:JSON.stringify({status:'completed'})});
 if(body.event==='recording.completed'){
  const file=(obj.recording_files||[]).find((f:any)=>f.file_type==='MP4'&&f.status==='completed');if(file){const zt=await zoomToken(),download=await fetch(file.download_url,{headers:{Authorization:`Bearer ${zt}`}});if(!download.ok)throw Error('Zoom recording download failed');const path=`${lecture_id}/${file.id}.mp4`,supabase=Deno.env.get('SUPABASE_URL')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;const upload=await fetch(`${supabase}/storage/v1/object/lecture-recordings/${path}`,{method:'POST',headers:{apikey:service,Authorization:`Bearer ${service}`,'Content-Type':'video/mp4','x-upsert':'true'},body:await download.arrayBuffer()});if(!upload.ok)throw Error('Recording storage upload failed');await admin('/rest/v1/recordings',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify({lecture_id,title:obj.topic||'Lecture recording',storage_path:path,duration_seconds:Number(file.recording_end?((new Date(file.recording_end).getTime()-new Date(file.recording_start).getTime())/1000):0),published:false,available_until:new Date(Date.now()+60*86400000).toISOString()})})}
 }
 return json({received:true});
}catch(e){return json({error:e.message},400)}});
