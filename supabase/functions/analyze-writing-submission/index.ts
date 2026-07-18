import { cors, json, admin, authUser, profile, rateLimit, callClaude, parseJsonLoose } from '../_shared/utils.ts';

const SYSTEM_PROMPT = `You are an experienced IELTS Writing examiner giving instant, honest feedback to a student.
Score the response against the four official IELTS Writing band descriptors, each 0-9 in 0.5 steps:
- task_response: does it fully address the task, with a clear position and developed, relevant ideas?
- coherence_cohesion: logical organisation, paragraphing, and appropriate use of cohesive devices?
- lexical_resource: range and precision of vocabulary, natural collocation, spelling accuracy?
- grammatical_range_accuracy: range of structures used and how error-free they are?
overall_band is the arithmetic mean of the four, rounded to the nearest 0.5.
Reply with ONLY a JSON object (no markdown fences, no commentary):
{"criterion_scores": {"task_response": number, "coherence_cohesion": number, "lexical_resource": number, "grammatical_range_accuracy": number}, "overall_band": number, "strengths": [string, string], "improvements": [string, string, string], "summary": string (2-3 sentences)}.
Be specific — reference actual words or sentences from the response where possible, not generic advice.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const user = await authUser(req);
    const { submission_id } = await req.json();
    if (!submission_id) return json({ error: 'submission_id is required' }, 400);

    const rows = await admin(`/rest/v1/writing_submissions?id=eq.${submission_id}&select=*`);
    const submission = rows[0];
    if (!submission) return json({ error: 'Submission not found' }, 404);

    const callerProfile = await profile(user.id);
    const isOwner = submission.user_id === user.id;
    const isStaff = ['admin', 'tutor'].includes(callerProfile.role);
    if (!isOwner && !isStaff) return json({ error: 'Not permitted' }, 403);

    await rateLimit(`ai-writing:${user.id}`, 20, 3600);

    const raw = await callClaude(
      SYSTEM_PROMPT,
      `Task: ${submission.task_type ?? 'Task 2'}\nQuestion: ${submission.question}\n\nStudent response:\n${submission.response}`,
      1600,
    );
    const feedback = parseJsonLoose(raw);

    const feedbackText = [
      feedback.summary,
      '',
      'Strengths:',
      ...(feedback.strengths ?? []).map((s: string) => `- ${s}`),
      '',
      'To improve:',
      ...(feedback.improvements ?? []).map((s: string) => `- ${s}`),
    ].join('\n');

    await admin(`/rest/v1/writing_submissions?id=eq.${submission_id}`, {
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
