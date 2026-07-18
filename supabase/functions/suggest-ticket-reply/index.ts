import { cors, json, admin, authUser, profile, rateLimit, callClaude } from '../_shared/utils.ts';

const SYSTEM_PROMPT = `You are a warm, precise support agent for AcmeLearn, an IELTS coaching platform.
Draft a reply to the student's support ticket below. Be concise, address their specific question, and offer a clear next step.
Do not invent policies, refund amounts, or dates you were not given — if the ticket needs a human decision (e.g. a refund), say the team will confirm shortly instead of promising an outcome.
Reply with plain text only — no markdown, no subject line, just the message body.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const user = await authUser(req);
    const callerProfile = await profile(user.id);
    if (!['admin', 'tutor'].includes(callerProfile.role)) {
      return json({ error: 'Only staff can generate suggested replies' }, 403);
    }

    const { ticket_id } = await req.json();
    if (!ticket_id) return json({ error: 'ticket_id is required' }, 400);

    const rows = await admin(`/rest/v1/support_tickets?id=eq.${ticket_id}&select=*`);
    const ticket = rows[0];
    if (!ticket) return json({ error: 'Ticket not found' }, 404);

    await rateLimit(`ai-ticket:${user.id}`, 30, 3600);

    const reply = await callClaude(
      SYSTEM_PROMPT,
      `Category: ${ticket.category ?? 'general'}\nSubject: ${ticket.subject}\n\nMessage:\n${ticket.body ?? ''}`,
      700,
    );

    await admin(`/rest/v1/support_tickets?id=eq.${ticket_id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ai_suggested_reply: reply.trim(), updated_at: new Date().toISOString() }),
    });

    return json({ reply: reply.trim() });
  } catch (e) {
    return json({ error: e.message }, 400);
  }
});
