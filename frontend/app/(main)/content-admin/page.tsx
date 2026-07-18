import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import defaults from '@/lib/site-content.default.json';
import { ContentForm } from './ContentForm';

export default async function ContentAdminPage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('content_key', 'home')
    .maybeSingle();

  const initialValue = { ...defaults.home, ...(data?.value as Partial<typeof defaults.home> | undefined) };

  return (
    <>
      <header className="page-hero" style={{ padding: '48px 0' }}>
        <div className="shell">
          <span className="eyebrow">Homepage CMS</span>
          <h1 style={{ fontSize: 48 }}>Manage site content.</h1>
          <p>Update campaign copy without editing HTML. Draft locally, preview, then publish through Supabase.</p>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell admin-grid">
          {profile && <ContentForm profile={profile} initialValue={initialValue} />}
        </div>
      </div>
    </>
  );
}
