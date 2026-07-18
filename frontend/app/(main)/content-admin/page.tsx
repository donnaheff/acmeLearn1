import Link from 'next/link';
import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import defaults from '@/lib/site-content.default.json';
import { ContentForm } from './ContentForm';

export default async function ContentAdminPage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();
  const { data } = await supabase.from('site_content').select('content_key, value').in('content_key', ['home', 'resources']);

  const byKey = new Map((data ?? []).map((row) => [row.content_key, row.value]));
  const initialHome = { ...defaults.home, ...(byKey.get('home') as Partial<typeof defaults.home> | undefined) };
  const initialResources = {
    ...defaults.resources,
    ...(byKey.get('resources') as Partial<typeof defaults.resources> | undefined),
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
            <ContentForm profile={profile} initialHome={initialHome} initialResources={initialResources} />
          )}
        </div>
      </div>
    </>
  );
}
