import { cors, json, admin, authUser, profile, rateLimit, callClaude, parseJsonLoose } from '../_shared/utils.ts';

const SYSTEM_PROMPT = `You are an experienced IELTS Speaking examiner giving instant, honest feedback from a transcript of a student's spoken response.
Score against three of the four official IELTS Speaking band descriptors that can be judged from text alone, each 0-9 in 0.5 steps:
- fluency_coherence: does the answer flow naturally with logical connections, or is it disjointed/repetitive?
- lexical_resource: range and precision of vocabulary for the topic?
- grammatical_range_accuracy: range of structures used and how error-free they are?
overall_band is the mean of these three, rounded to the nearest 0.5.
Pronunciation cannot be judged from a transcript, so never invent a pronunciation score.
Reply with ONLY a JSON object (no markdown fences, no commentary):
{"criterion_scores": {"fluency_coherence": number, "lexical_resource": number, "grammatical_range_accuracy": number}, "overall_band": number, "strengths": [string, string], "improvements": [string, string, string], "summary": string (2-3 sentences), "note": "Pronunciation was not assessed — this feedback is based on the transcript only."}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const user = await authUser(req);
    const { attempt_id } = await req.json();
    if (!attempt_id) return json({ error: 'attempt_id is required' }, 400);

    const rows = await admin(`/rest/v1/speaking_attempts?id=eq.${attempt_id}&select=*`);
    const attempt = rows[0];
    if (!attempt) return json({ error: 'Attempt not found' }, 404);
    if (!attempt.transcript || !attempt.transcript.trim()) {
      return json(
        { error: 'Add a transcript first — automatic speech-to-text isn\'t wired up yet, so feedback needs a typed transcript of what was said.' },
        400,
      );
    }

    const callerProfile = await profile(user.id);
    const isOwner = attempt.user_id === user.id;
    const isStaff = ['admin', 'tutor'].includes(callerProfile.role);
    if (!isOwner && !isStaff) return json({ error: 'Not permitted' }, 403);

    await rateLimit(`ai-speaking:${user.id}`, 20, 3600);

    const raw = await callClaude(
      SYSTEM_PROMPT,
      `Part: ${attempt.part}\nQuestion: ${attempt.question}\n\nTranscript of student's spoken response:\n${attempt.transcript}`,
      1400,
    );
    const feedback = parseJsonLoose(raw);

    const feedbackText = [
      feedback.summary,
      feedback.note ? `\n${feedback.note}` : '',
      '',
      'Strengths:',
      ...(feedback.strengths ?? []).map((s: string) => `- ${s}`),
      '',
      'To improve:',
      ...(feedback.improvements ?? []).map((s: string) => `- ${s}`),
    ].join('\n');

    await admin(`/rest/v1/speaking_attempts?id=eq.${attempt_id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ai_criterion_scores: feedback.criterion_scores,
        ai_overall_band: feedback.overall_band,
        ai_feedback: feedbackText,
      }),
    });

    return json({ ...feedback, feedback_text: feedbackText });
  } catch (e) {
    return json({ error: e.message }, 400);
  }
});
