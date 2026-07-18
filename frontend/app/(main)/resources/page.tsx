import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getResourcesContent } from '@/lib/siteContent';

type ArticleRow = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  read_minutes: number;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  cover_image_url: string | null;
};

function dateLabel(row: ArticleRow) {
  return new Date(row.published_at ?? row.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default async function ResourcesPage() {
  const content = await getResourcesContent();
  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select('slug, title, excerpt, category, read_minutes, featured, published_at, created_at, cover_image_url')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false });

  const articles = (data as ArticleRow[] | null) ?? [];
  const [featured, ...rest] = articles;

  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <div className="crumb">Home / Resources</div>
          <span className="eyebrow">{content.eyebrow}</span>
          <h1>{content.heading}</h1>
          <p>{content.body}</p>
        </div>
      </header>
      <main className="section">
        <div className="shell">
          <div className="promo-grid" style={{ marginBottom: 48 }}>
            {featured ? (
              <article className="promo-main" style={{ background: '#102c49' }}>
                <span className="eyebrow">
                  Featured guide · {featured.read_minutes} min read
                </span>
                <h2>{featured.title}</h2>
                <p>{featured.excerpt}</p>
                <Link href={`/resources/${featured.slug}`} className="btn btn-coral">
                  Read the guide →
                </Link>
              </article>
            ) : (
              <article className="promo-main" style={{ background: '#102c49' }}>
                <span className="eyebrow">More guides coming soon</span>
                <h2>New articles are on the way.</h2>
                <p>Check back shortly for the next teaching team guide.</p>
              </article>
            )}
            <aside className="promo-side" style={{ background: '#dcefeb', color: 'var(--navy)' }}>
              <span className="eyebrow">Free download</span>
              <h2 style={{ fontSize: 32 }}>The 30-day IELTS planner</h2>
              <p>Daily tasks, mock dates and progress checks in one printable plan.</p>
              <Link href="/signup" className="btn btn-dark">
                Send me the planner
              </Link>
            </aside>
          </div>
          <div id="articles" className="section-head">
            <div>
              <span className="eyebrow">Latest insight</span>
              <h2>Learn something useful.</h2>
            </div>
          </div>
          {rest.length > 0 ? (
            <div className="course-grid">
              {rest.map((article) => (
                <article className="course" key={article.slug}>
                  {article.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.cover_image_url}
                      alt=""
                      style={{ width: '100%', height: 160, objectFit: 'cover' }}
                    />
                  )}
                  <div className="course-top">
                    <span className="eyebrow">{article.category}</span>
                    <h3>{article.title}</h3>
                  </div>
                  <div className="course-body">
                    <p>{article.excerpt}</p>
                    <div className="meta">
                      <span>{article.read_minutes} min read</span>
                      <span>{dateLabel(article)}</span>
                    </div>
                    <Link href={`/resources/${article.slug}`}>Read article →</Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--muted)' }}>More articles are being written—check back soon.</p>
          )}
        </div>
      </main>
    </>
  );
}
