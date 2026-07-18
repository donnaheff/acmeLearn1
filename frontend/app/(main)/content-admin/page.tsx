import Link from 'next/link';
import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import defaults from '@/lib/site-content.default.json';
import { ContentForm } from './ContentForm';

const KEYS = ['home', 'resources', 'compare', 'pilot', 'meet_your_tutor'] as const;

export default async function ContentAdminPage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();
  const { data } = await supabase.from('site_content').select('content_key, value').in('content_key', KEYS);

  const byKey = new Map((data ?? []).map((row) => [row.content_key, row.value]));
  const initialHome = { ...defaults.home, ...(byKey.get('home') as Partial<typeof defaults.home> | undefined) };
  const initialResources = {
    ...defaults.resources,
    ...(byKey.get('resources') as Partial<typeof defaults.resources> | undefined),
  };
  const initialCompare = {
    ...defaults.compare,
    ...(byKey.get('compare') as Partial<typeof defaults.compare> | undefined),
  };
  const initialPilot = { ...defaults.pilot, ...(byKey.get('pilot') as Partial<typeof defaults.pilot> | undefined) };
  const initialTutor = {
    ...defaults.meet_your_tutor,
    ...(byKey.get('meet_your_tutor') as Partial<typeof defaults.meet_your_tutor> | undefined),
  };

  return (
    <>
      <header className="page-hero" style={{ padding: '48px 0' }}>
        <div className="shell">
          <span className="eyebrow">Site CMS</span>
          <h1 style={{ fontSize: 48 }}>Manage site content.</h1>
          <p>Update campaign copy without editing code. Draft locally, preview, then publish through Supabase.</p>
          <p style={{ marginTop: 10 }}>
            <Link href="/content-admin/articles" className="btn btn-dark">
              Manage Resources articles →
            </Link>
          </p>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell admin-grid">
          {profile && (
            <ContentForm
              profile={profile}
              initialHome={initialHome}
              initialResources={initialResources}
              initialCompare={initialCompare}
              initialPilot={initialPilot}
              initialTutor={initialTutor}
            />
          )}
        </div>
      </div>
    </>
  );
}
