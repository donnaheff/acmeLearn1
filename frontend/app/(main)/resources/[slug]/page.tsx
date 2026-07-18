import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { renderArticleBody } from '@/lib/renderArticleBody';

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, body, category, read_minutes, published_at, created_at')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!article) notFound();

  const dateLabel = new Date(article.published_at ?? article.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <div className="crumb">
            <Link href="/resources">Home / Resources</Link> / {article.title}
          </div>
          <span className="eyebrow">
            {article.category} · {article.read_minutes} min read · {dateLabel}
          </span>
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
        </div>
      </header>
      <main className="section">
        <div className="shell legal">
          {renderArticleBody(article.body)}
          <div className="auth-alert" style={{ marginTop: 40 }}>
            <strong>Want a plan built around this?</strong> A tutor can turn this guide into a
            personalised study plan and mark your next practice test against these exact
            criteria.
            <div style={{ marginTop: 14 }}>
              <Link href="/signup" className="btn btn-coral">
                Get started →
              </Link>
            </div>
          </div>
          <p style={{ marginTop: 40 }}>
            <Link href="/resources">← Back to Resources</Link>
          </p>
        </div>
      </main>
    </>
  );
}
