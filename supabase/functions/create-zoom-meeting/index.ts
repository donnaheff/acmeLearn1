import {cors,json,admin,authUser,profile,zoomToken,encrypt} from '../_shared/utils.ts';
Deno.serve(async(req)=>{if(req.method==='OPTIONS')return new Response('ok',{headers:cors});try{
 const user=await authUser(req),actor=await profile(user.id);if(!['admin','tutor'].includes(actor.role))return json({error:'Staff role required'},403);
 const {course_id,title,description,starts_at,duration_minutes=60}=await req.json();
 const courses=await admin(`/rest/v1/courses?id=eq.${course_id}&select=*`);const course=courses[0];if(!course||(actor.role==='tutor'&&course.tutor_id!==user.id))return json({error:'You cannot manage this course'},403);
 const token=await zoomToken(),host=encodeURIComponent(Deno.env.get('ZOOM_HOST_USER_ID')||'me');
 const zr=await fetch(`https://api.zoom.us/v2/users/${host}/meetings`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({topic:title,agenda:description,type:2,start_time:starts_at,timezone:'UTC',duration:duration_minutes,settings:{approval_type:0,registration_type:1,waiting_room:true,join_before_host:false,mute_upon_entry:true,participant_video:false,host_video:true,auto_recording:'cloud',meeting_authentication:false,email_notification:true}})});
 const zoom=await zr.json();if(!zr.ok)throw new Error(zoom.message||'Zoom meeting creation failed');
 const rows=await admin('/rest/v1/lectures',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({course_id,title,description,tutor_id:user.id,starts_at,duration_minutes,platform:'zoom',status:'scheduled',zoom_meeting_id:String(zoom.id),zoom_start_url_encrypted:await encrypt(zoom.start_url)})});
 // Queue reminder jobs for all active students. Cron function sends them at due time.
 const enrolled=await admin(`/rest/v1/enrollments?course_id=eq.${course_id}&status=eq.active&select=user_id`);const lecture=rows[0];
 const jobs=enrolled.flatMap((e:any)=>['email','whatsapp'].flatMap(channel=>[
  {user_id:e.user_id,lecture_id:lecture.id,channel,kind:'24_hour',scheduled_for:new Date(new Date(starts_at).getTime()-86400000).toISOString()},
  {user_id:e.user_id,lecture_id:lecture.id,channel,kind:'15_minute',scheduled_for:new Date(new Date(starts_at).getTime()-900000).toISOString()}
 ]));if(jobs.length)await admin('/rest/v1/notifications',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates'},body:JSON.stringify(jobs)});
 return json({lecture,zoom:{id:zoom.id,settings:{waiting_room:true,registration:true,cloud_recording:true}}},201);
}catch(e){return json({error:e.message},400)}});
