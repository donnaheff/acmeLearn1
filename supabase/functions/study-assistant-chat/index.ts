import { cors, json, admin, authUser, rateLimit, callClaude } from '../_shared/utils.ts';

const SYSTEM_PROMPT = `You are AcmeLearn's IELTS study assistant. Answer clearly and concisely (under 200 words unless asked for detail).
When one of the provided guide excerpts is relevant, ground your answer in it and mention the guide by title.
If none are relevant, answer from general well-established IELTS knowledge, and say so.
Never invent AcmeLearn policies, prices or dates you were not given.`;

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'i', 'my',
  'how', 'what', 'do', 'does', 'can', 'you', 'me', 'it', 'this', 'that', 'with', 'be', 'as', 'at',
]);

function keywords(text: string): string[] {
  return (text.toLowerCase().match(/[a-z']+/g) || []).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function relevantArticles(question: string, articles: Array<{ title: string; excerpt: string; body: string; slug: string }>) {
  const qWords = new Set(keywords(question));
  return articles
    .map((a) => {
      const haystack = keywords(`${a.title} ${a.excerpt} ${a.body}`);
      const score = haystack.filter((w) => qWords.has(w)).length;
      return { article: a, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.article);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const user = await authUser(req);
    await rateLimit(`ai-chat:${user.id}`, 30, 3600);

    const { message } = await req.json();
    if (!message || typeof message !== 'string') return json({ error: 'message is required' }, 400);

    const articles = await admin('/rest/v1/articles?status=eq.published&select=title,excerpt,body,slug');
    const matches = relevantArticles(message, articles);

    const context = matches.length
      ? matches.map((a) => `Guide: "${a.title}"\n${a.excerpt}\n${a.body.slice(0, 1200)}`).join('\n\n---\n\n')
      : 'No matching guide found in the library — answer from general IELTS knowledge.';

    const answer = await callClaude(SYSTEM_PROMPT, `Student question: ${message}\n\nAvailable guide excerpts:\n${context}`, 900);

    return json({
      answer: answer.trim(),
      sources: matches.map((a) => ({ title: a.title, slug: a.slug })),
    });
  } catch (e) {
    return json({ error: e.message }, 400);
  }
});
