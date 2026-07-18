import { cors, json, admin, authUser, callClaude, parseJsonLoose } from '../_shared/utils.ts';

const CATALOG: Record<string, [string, string, string]> = {
  writing: ['Build stronger Task 2 paragraphs', '/writing', 'Your writing criterion score has the largest target-band gap.'],
  speaking: ['Complete a timed Part 2 response', '/speaking', 'Regular recorded answers will improve fluency and pacing.'],
  reading: ['Practise matching headings', '/mock', 'This drill targets reading accuracy under time pressure.'],
  listening: ['Complete a Section 2 map drill', '/mock', 'Map labelling is a high-impact listening question type.'],
};

const PERSONALIZE_PROMPT = `You are an IELTS coach writing short, specific, encouraging one-sentence reasons for a student's weekly recommendations.
You will be given the student's target band and their current estimated score per skill, plus a default reason for each.
Rewrite each "reason" to be more specific and motivating, referencing the actual numbers. Keep each reason under 220 characters.
Reply with ONLY a JSON object mapping skill name to the rewritten reason string, e.g. {"writing": "...", "speaking": "...", "reading": "...", "listening": "..."}. Include only skills you were given.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const user = await authUser(req);
    const profiles = await admin(`/rest/v1/profiles?id=eq.${user.id}&select=target_band`);
    const target = Number(profiles[0]?.target_band || 7);
    const scores = await admin(
      `/rest/v1/skill_scores?user_id=eq.${user.id}&select=skill,score,recorded_at&order=recorded_at.desc`,
    );
    const latest: Record<string, number> = {};
    for (const s of scores) if (latest[s.skill] === undefined) latest[s.skill] = Number(s.score);

    const base = Object.keys(CATALOG).map((skill) => {
      const score = latest[skill] || 5.5;
      const gap = Math.max(0, target - score);
      const [title, url, reason] = CATALOG[skill];
      return {
        skill,
        title,
        activity_url: url,
        reason: `${reason} Current estimate ${score.toFixed(1)}; target ${target.toFixed(1)}.`,
        priority: Math.round(gap * 20 + 30),
        score,
      };
    });

    // Best-effort personalization — recommendations must still work if AI is
    // unavailable or the call fails, so any error here just keeps the
    // rule-based reason text instead of failing the whole request.
    try {
      const raw = await callClaude(
        PERSONALIZE_PROMPT,
        JSON.stringify({
          target_band: target,
          skills: base.map((b) => ({ skill: b.skill, current_score: b.score, default_reason: b.reason })),
        }),
        800,
      );
      const personalized = parseJsonLoose(raw) as Record<string, string>;
      for (const item of base) {
        if (personalized[item.skill]) item.reason = personalized[item.skill];
      }
    } catch {
      // AI not configured or request failed — rule-based reasons stand.
    }

    const items = base
      .map(({ score: _score, ...rest }) => ({
        user_id: user.id,
        ...rest,
        expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      }))
      .sort((a, b) => b.priority - a.priority);

    await admin(`/rest/v1/recommendations?user_id=eq.${user.id}&status=eq.active`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'superseded' }),
    });
    await admin('/rest/v1/recommendations', { method: 'POST', body: JSON.stringify(items) });

    return json({ recommendations: items });
  } catch (e) {
    return json({ error: e.message }, 400);
  }
});
