import { createClient } from '@/lib/supabase/server';
import { TeamAdminClient } from './TeamAdminClient';

export default async function TeamAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role')
    .in('role', ['admin', 'tutor'])
    .order('role', { ascending: true });

  return (
    <>
      <header className="page-hero" style={{ padding: '48px 0' }}>
        <div className="shell">
          <span className="eyebrow">Team access</span>
          <h1 style={{ fontSize: 48 }}>Onboard staff and manage privileges.</h1>
          <p>Invite a new admin or tutor by email, or change an existing staff member&apos;s role.</p>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell">
          <TeamAdminClient staff={data ?? []} />
        </div>
      </div>
    </>
  );
}
