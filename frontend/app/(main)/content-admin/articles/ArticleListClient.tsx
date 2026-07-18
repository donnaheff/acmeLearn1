'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import type { Profile } from '@/lib/session';

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: 'draft' | 'submitted' | 'scheduled' | 'published';
  featured: boolean;
  author_id: string | null;
  updated_at: string;
  scheduled_publish_at: string | null;
};

export function ArticleListClient({
  profile,
  initialArticles,
}: {
  profile: Profile;
  initialArticles: ArticleRow[];
}) {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const isAdmin = profile.role === 'admin';

  async function setStatus(id: string, status: 'draft' | 'published') {
    setBusyId(id);
    const { error } = await supabase
      .from('articles')
      .update({
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    setBusyId(null);
    if (error) {
      toast(error.message);
    } else {
      toast(status === 'published' ? 'Article published.' : 'Article unpublished.');
      router.refresh();
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this article permanently?')) return;
    setBusyId(id);
    const { error } = await supabase.from('articles').delete().eq('id', id);
    setBusyId(null);
    if (error) {
      toast(error.message);
    } else {
      toast('Article deleted.');
      router.refresh();
    }
  }

  return (
    <div className="panel">
      <div className="section-head" style={{ marginBottom: 16 }}>
        <h3>{isAdmin ? 'All articles' : 'Your articles'}</h3>
        <Link href="/content-admin/articles/new" className="btn btn-coral">
          + New article
        </Link>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Featured</th>
            <th>Updated</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {initialArticles.length ? (
            initialArticles.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.category}</td>
                <td>
                  <span className={`status${a.status !== 'published' ? ' warn' : ''}`}>{a.status}</span>
                  {a.status === 'scheduled' && a.scheduled_publish_at && (
                    <small style={{ display: 'block', color: 'var(--muted)' }}>
                      {new Date(a.scheduled_publish_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </small>
                  )}
                </td>
                <td>{a.featured ? 'Yes' : '—'}</td>
                <td>
                  {new Date(a.updated_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link href={`/content-admin/articles/${a.id}`}>Edit</Link>
                  {isAdmin && a.status !== 'published' && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={busyId === a.id}
                      onClick={() => setStatus(a.id, 'published')}
                    >
                      Publish
                    </button>
                  )}
                  {isAdmin && a.status === 'published' && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={busyId === a.id}
                      onClick={() => setStatus(a.id, 'draft')}
                    >
                      Unpublish
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={busyId === a.id}
                      onClick={() => remove(a.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                No articles yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
