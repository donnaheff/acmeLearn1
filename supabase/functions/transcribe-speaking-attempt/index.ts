import { cors, json, admin, authUser, profile, rateLimit } from '../_shared/utils.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const user = await authUser(req);
    const { attempt_id } = await req.json();
    if (!attempt_id) return json({ error: 'attempt_id is required' }, 400);

    const rows = await admin(`/rest/v1/speaking_attempts?id=eq.${attempt_id}&select=*`);
    const attempt = rows[0];
    if (!attempt) return json({ error: 'Attempt not found' }, 404);
    if (!attempt.audio_path) return json({ error: 'No audio recorded for this attempt' }, 400);

    const callerProfile = await profile(user.id);
    const isOwner = attempt.user_id === user.id;
    const isStaff = ['admin', 'tutor'].includes(callerProfile.role);
    if (!isOwner && !isStaff) return json({ error: 'Not permitted' }, 403);

    await rateLimit(`ai-transcribe:${user.id}`, 20, 3600);

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return json({ error: 'Automatic transcription is not configured yet. Set OPENAI_API_KEY as a Supabase secret.' }, 501);
    }

    const audioRes = await fetch(`${SUPABASE_URL}/storage/v1/object/speaking-attempts/${attempt.audio_path}`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    if (!audioRes.ok) return json({ error: 'Could not read the stored recording' }, 502);
    const audioBlob = await audioRes.blob();

    const form = new FormData();
    form.append('file', audioBlob, 'attempt.webm');
    form.append('model', 'whisper-1');

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    const whisper = await whisperRes.json();
    if (!whisperRes.ok) return json({ error: whisper.error?.message || 'Transcription failed' }, 502);

    await admin(`/rest/v1/speaking_attempts?id=eq.${attempt_id}`, {
      method: 'PATCH',
      body: JSON.stringify({ transcript: whisper.text }),
    });

    return json({ transcript: whisper.text });
  } catch (e) {
    return json({ error: e.message }, 400);
  }
});
