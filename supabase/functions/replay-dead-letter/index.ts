import {cors,json,admin,authUser,profile,processPaymentReference} from '../_shared/utils.ts';
Deno.serve(async(req)=>{if(req.method==='OPTIONS')return new Response('ok',{headers:cors});try{
 const user=await authUser(req),p=await profile(user.id);
 if(p.role!=='admin')return json({error:'Administrator role required'},403);
 const {id}=await req.json();
 if(!id)return json({error:'id is required'},400);
 const rows=await admin(`/rest/v1/webhook_dead_letters?id=eq.${id}&select=*`),dl=rows[0];
 if(!dl)return json({error:'Dead-letter event not found'},404);
 if(dl.replayed_at)return json({error:'This event has already been replayed'},409);
 const event=dl.payload;
 let reference='';
 if(dl.provider==='stripe'){
  if(event.type!=='checkout.session.completed')return json({error:'Not a completed-checkout event — nothing to replay'},400);
  reference=event.data.object.client_reference_id;
 } else {
  if(event.event!=='charge.success')return json({error:'Not a charge.success event — nothing to replay'},400);
  reference=event.data.reference;
 }
 await processPaymentReference(reference);
 await admin(`/rest/v1/webhook_dead_letters?id=eq.${id}`,{method:'PATCH',body:JSON.stringify({replayed_by:user.id,replayed_at:new Date().toISOString()})});
 return json({replayed:true,reference});
}catch(e){return json({error:e.message},400)}});
