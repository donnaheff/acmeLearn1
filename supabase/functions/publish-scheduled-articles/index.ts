import { json, admin } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  try {
    if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const now = new Date().toISOString();
    const due = await admin(
      `/rest/v1/articles?status=in.(draft,submitted,scheduled)&scheduled_publish_at=lte.${encodeURIComponent(now)}&select=id`,
    );
    for (const row of due) {
      await admin(`/rest/v1/articles?id=eq.${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'published', published_at: now, scheduled_publish_at: null }),
      });
    }
    return json({ published: due.length });
  } catch (e) {
    return json({ error: e.message }, 400);
  }
});
