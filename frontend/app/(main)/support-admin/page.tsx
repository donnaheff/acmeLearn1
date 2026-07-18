import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { SupportAdminClient } from './SupportAdminClient';

export default async function SupportAdminPage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from('support_tickets')
    .select('id, subject, body, category, status, priority, ai_suggested_reply, created_at, user_id, profiles(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <>
      <header className="page-hero" style={{ padding: '48px 0' }}>
        <div className="shell">
          <span className="eyebrow">Support queue</span>
          <h1 style={{ fontSize: 48 }}>Student support tickets.</h1>
          <p>Draft a reply with AI, then edit and send it through your usual channel.</p>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell">{profile && <SupportAdminClient tickets={data ?? []} />}</div>
      </div>
    </>
  );
}
