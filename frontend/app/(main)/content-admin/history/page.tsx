import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { HistoryClient } from './HistoryClient';

export default async function ContentHistoryPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .in('entity_type', ['site_content', 'articles'])
    .order('created_at', { ascending: false })
    .limit(50);

  const actorIds = Array.from(new Set((data ?? []).map((r) => r.actor_id).filter(Boolean)));
  const { data: actors } = actorIds.length
    ? await supabase.from('profiles').select('id, first_name, last_name').in('id', actorIds)
    : { data: [] };
  const actorNames = Object.fromEntries(
    (actors ?? []).map((a) => [a.id, `${a.first_name} ${a.last_name}`.trim()]),
  );

  return (
    <>
      <header className="page-hero" style={{ padding: '48px 0' }}>
        <div className="shell">
          <div className="crumb">
            <Link href="/content-admin">Content admin</Link> / History
          </div>
          <span className="eyebrow">Audit trail</span>
          <h1 style={{ fontSize: 48 }}>Content revision history.</h1>
          <p>Every change to site content and articles is recorded here and can be restored.</p>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell">
          <HistoryClient rows={data ?? []} actorNames={actorNames} />
        </div>
      </div>
    </>
  );
}
