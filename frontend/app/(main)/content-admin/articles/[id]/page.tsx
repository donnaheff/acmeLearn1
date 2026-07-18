import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { ArticleEditor } from './ArticleEditor';

export default async function ArticleEditorPage({ params }: { params: { id: string } }) {
  const profile = await getSessionProfile();
  if (!profile) return null;

  const isNew = params.id === 'new';
  let article = null;

  if (!isNew) {
    const supabase = await createClient();
    const { data } = await supabase.from('articles').select('*').eq('id', params.id).maybeSingle();
    if (!data) notFound();
    article = data;
  }

  return (
    <>
      <header className="page-hero" style={{ padding: '48px 0' }}>
        <div className="shell">
          <div className="crumb">
            <Link href="/content-admin/articles">Content admin / Articles</Link> /{' '}
            {isNew ? 'New article' : article!.title}
          </div>
          <span className="eyebrow">Resources CMS</span>
          <h1 style={{ fontSize: 40 }}>{isNew ? 'Write a new guide.' : 'Edit guide.'}</h1>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell admin-grid">
          <ArticleEditor profile={profile} article={article} />
        </div>
      </div>
    </>
  );
}
