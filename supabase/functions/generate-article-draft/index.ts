import { cors, json, authUser, profile, rateLimit, callClaude, parseJsonLoose } from '../_shared/utils.ts';

const SYSTEM_PROMPT = `You write short IELTS-preparation guides for AcmeLearn, an IELTS coaching platform.
Reply with ONLY a JSON object (no markdown fences, no commentary) with exactly these keys:
{"title": string, "excerpt": string (one sentence), "meta_description": string (max 155 characters, for search engine results), "category": string (one or two words, e.g. "Writing", "Speaking", "Planning"), "read_minutes": number (integer 3-10), "body": string}.
The "body" must be plain text: paragraphs separated by a blank line, and section headings written as their own line starting with "## ". Do not use any other markdown syntax. Keep it accurate, practical and specific to IELTS.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const user = await authUser(req);
    const callerProfile = await profile(user.id);
    if (!['admin', 'tutor'].includes(callerProfile.role)) {
      return json({ error: 'Only staff can generate article drafts' }, 403);
    }
    await rateLimit(`ai-draft:${user.id}`, 10, 3600); // 10 drafts/hour/user — this calls a paid API per request

    const { topic } = await req.json();
    if (!topic || typeof topic !== 'string') {
      return json({ error: 'topic is required' }, 400);
    }

    const raw = await callClaude(SYSTEM_PROMPT, `Write a guide about: ${topic}`, 1800);
    return json(parseJsonLoose(raw));
  } catch (e) {
    return json({ error: e.message }, 400);
  }
});
