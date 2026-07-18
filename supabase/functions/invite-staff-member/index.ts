import { cors, json, admin, authUser, profile } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const user = await authUser(req);
    const callerProfile = await profile(user.id);
    if (callerProfile.role !== 'admin') {
      return json({ error: 'Only admins can invite staff members' }, 403);
    }

    const { email, role } = await req.json();
    if (!email || typeof email !== 'string') return json({ error: 'email is required' }, 400);
    if (!['admin', 'tutor'].includes(role)) return json({ error: 'role must be admin or tutor' }, 400);

    const siteUrl = Deno.env.get('NEXT_PUBLIC_SITE_URL') || Deno.env.get('SITE_URL');
    const redirect = siteUrl ? `?redirect_to=${encodeURIComponent(`${siteUrl}/auth/callback`)}` : '';

    const invited = await admin(`/auth/v1/invite${redirect}`, {
      method: 'POST',
      body: JSON.stringify({ email, data: { invited_role: role } }),
    });

    if (!invited?.id) {
      return json({ error: 'Invite did not return a user id' }, 502);
    }

    // handle_new_user's trigger inserts the profiles row synchronously on the
    // auth.users insert above, so it already exists — this just sets the
    // role the invite was for (new accounts always default to 'student').
    await admin(`/rest/v1/profiles?id=eq.${invited.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });

    return json({ invited: true, user_id: invited.id, email, role });
  } catch (e) {
    return json({ error: e.message }, 400);
  }
});
