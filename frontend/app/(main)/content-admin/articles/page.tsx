import Link from 'next/link';
import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { ArticleListClient } from './ArticleListClient';

export default async function ArticlesAdminPage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select('id, slug, title, category, status, featured, author_id, updated_at, scheduled_publish_at')
    .order('updated_at', { ascending: false });

  return (
    <>
      <header className="page-hero" style={{ padding: '48px 0' }}>
        <div className="shell">
          <div className="crumb">
            <Link href="/content-admin">Content admin</Link> / Articles
          </div>
          <span className="eyebrow">Resources CMS</span>
          <h1 style={{ fontSize: 48 }}>Manage published guides.</h1>
          <p>Draft, submit and publish the articles shown on the public Resources page.</p>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell">
          {profile && <ArticleListClient profile={profile} initialArticles={data ?? []} />}
        </div>
      </div>
    </>
  );
}
