import { cors, json, authUser, profile } from '../_shared/utils.ts';

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

    const { topic } = await req.json();
    if (!topic || typeof topic !== 'string') {
      return json({ error: 'topic is required' }, 400);
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return json({ error: 'AI drafting is not configured yet. Set ANTHROPIC_API_KEY as a Supabase secret.' }, 501);
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1800,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Write a guide about: ${topic}` }],
      }),
    });

    const completion = await res.json();
    if (!res.ok) {
      return json({ error: completion.error?.message || 'AI request failed' }, 502);
    }

    const raw = completion.content?.[0]?.text ?? '{}';
    const cleaned = raw.trim().replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
    const draft = JSON.parse(cleaned);

    return json(draft);
  } catch (e) {
    return json({ error: e.message }, 400);
  }
});
