'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import { functionErrorMessage } from '@/lib/functionError';
import type { Profile } from '@/lib/session';

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  read_minutes: number;
  featured: boolean;
  status: 'draft' | 'submitted' | 'scheduled' | 'published';
  cover_image_url: string | null;
  meta_description: string | null;
  scheduled_publish_at: string | null;
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toDatetimeLocal(value: string | null) {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ArticleEditor({ profile, article }: { profile: Profile; article: Article | null }) {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const isAdmin = profile.role === 'admin';

  const [title, setTitle] = useState(article?.title ?? '');
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');
  const [body, setBody] = useState(article?.body ?? '');
  const [category, setCategory] = useState(article?.category ?? 'Writing');
  const [readMinutes, setReadMinutes] = useState(article?.read_minutes ?? 5);
  const [featured, setFeatured] = useState(article?.featured ?? false);
  const [coverImageUrl, setCoverImageUrl] = useState(article?.cover_image_url ?? '');
  const [metaDescription, setMetaDescription] = useState(article?.meta_description ?? '');
  const [scheduledAt, setScheduledAt] = useState(toDatetimeLocal(article?.scheduled_publish_at ?? null));
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiBusy, setAiBusy] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleImageSelect(file: File) {
    setUploadingImage(true);
    const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ''))}${file.name.match(/\.[^.]+$/)?.[0] ?? ''}`;
    const { error } = await supabase.storage.from('article-images').upload(path, file, { upsert: true });
    setUploadingImage(false);
    if (error) {
      toast(error.message);
      return;
    }
    const { data } = supabase.storage.from('article-images').getPublicUrl(path);
    setCoverImageUrl(data.publicUrl);
    toast('Cover image uploaded.');
  }

  async function save(status: 'draft' | 'submitted' | 'scheduled' | 'published') {
    if (!title.trim() || !slug.trim()) {
      toast('Title and slug are required.');
      return;
    }
    if (status === 'scheduled' && !scheduledAt) {
      toast('Pick a publish date/time first.');
      return;
    }
    setSubmitting(true);
    const payload = {
      title,
      slug,
      excerpt,
      body,
      category,
      read_minutes: readMinutes,
      featured: isAdmin ? featured : false,
      cover_image_url: coverImageUrl || null,
      meta_description: metaDescription || null,
      status,
      scheduled_publish_at: status === 'scheduled' ? new Date(scheduledAt).toISOString() : null,
      published_at: status === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = article
      ? await supabase.from('articles').update(payload).eq('id', article.id)
      : await supabase.from('articles').insert({ ...payload, author_id: profile.id });

    setSubmitting(false);
    if (error) {
      toast(error.message);
      return;
    }
    toast(
      status === 'published'
        ? 'Published to Resources.'
        : status === 'scheduled'
          ? 'Scheduled — it will publish itself automatically.'
          : status === 'submitted'
            ? 'Submitted for review.'
            : 'Draft saved.',
    );
    router.push('/content-admin/articles');
    router.refresh();
  }

  async function generateWithAI() {
    if (!aiTopic.trim()) {
      toast('Describe what the article should cover first.');
      return;
    }
    setAiBusy(true);
    const { data, error } = await supabase.functions.invoke('generate-article-draft', {
      body: { topic: aiTopic },
    });
    setAiBusy(false);
    if (error) {
      toast(await functionErrorMessage(error));
      return;
    }
    if (data?.title) handleTitleChange(data.title);
    if (data?.excerpt) setExcerpt(data.excerpt);
    if (data?.body) setBody(data.body);
    if (data?.category) setCategory(data.category);
    if (data?.read_minutes) setReadMinutes(data.read_minutes);
    if (data?.meta_description) setMetaDescription(data.meta_description);
    toast('AI draft inserted below — review before publishing.');
  }

  return (
    <>
      <section className="panel staff-form">
        <div>
          <label>TITLE</label>
          <input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. Understanding IELTS Band 7" />
        </div>
        <div>
          <label>SLUG (URL: /resources/…)</label>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
          />
        </div>
        <div>
          <label>EXCERPT</label>
          <textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>
        <div className="form-grid">
          <div className="field">
            <label>CATEGORY</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="field">
            <label>READ MINUTES</label>
            <input
              type="number"
              min={1}
              value={readMinutes}
              onChange={(e) => setReadMinutes(Number(e.target.value) || 1)}
            />
          </div>
        </div>
        <div>
          <label>COVER IMAGE</label>
          {coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImageUrl} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', marginBottom: 8 }} />
          )}
          <input
            type="file"
            accept="image/*"
            disabled={uploadingImage}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file);
            }}
          />
        </div>
        <div>
          <label>SEO META DESCRIPTION</label>
          <textarea
            rows={2}
            maxLength={200}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Shown in search results and social previews (max ~160 characters)."
          />
        </div>
        {isAdmin && (
          <label className="check">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />{' '}
            <span>Feature this article at the top of Resources</span>
          </label>
        )}
        <div>
          <label>BODY (blank line between paragraphs, start a line with &quot;## &quot; for a heading)</label>
          <textarea
            className="editor"
            style={{ minHeight: 320, font: '15px/1.7 inherit' }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" disabled={submitting} onClick={() => save('draft')}>
            Save draft
          </button>
          <button type="button" className="btn btn-dark" disabled={submitting} onClick={() => save('submitted')}>
            Submit for review
          </button>
          {isAdmin && (
            <button type="button" className="btn btn-coral" disabled={submitting} onClick={() => save('published')}>
              Publish now
            </button>
          )}
        </div>
      </section>
      <aside>
        {isAdmin && (
          <div className="panel" style={{ marginBottom: 20 }}>
            <span className="eyebrow">Schedule</span>
            <h3 style={{ margin: '10px 0' }}>Publish later</h3>
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            <button
              type="button"
              className="btn btn-dark"
              style={{ width: '100%', marginTop: 10 }}
              disabled={submitting}
              onClick={() => save('scheduled')}
            >
              Schedule publish
            </button>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
              A background job checks every few minutes and publishes automatically once the time arrives.
            </p>
          </div>
        )}
        <div className="panel">
          <span className="eyebrow">AI draft assist</span>
          <h3 style={{ margin: '10px 0' }}>Start from a topic</h3>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>
            Describe what the guide should cover — AI fills in a first draft below for you to fact-check
            and edit before submitting.
          </p>
          <textarea
            rows={3}
            placeholder="e.g. Common mistakes in IELTS Speaking Part 2"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-dark"
            style={{ width: '100%', marginTop: 10 }}
            disabled={aiBusy}
            onClick={generateWithAI}
          >
            {aiBusy ? 'Drafting…' : 'Generate draft with AI'}
          </button>
        </div>
        <div className="panel" style={{ marginTop: 20 }}>
          <span className="eyebrow">Workflow</span>
          <div className="phase-step">
            <b>1</b>
            <span>Save a draft, come back anytime</span>
          </div>
          <div className="phase-step">
            <b>2</b>
            <span>Submit for review once ready</span>
          </div>
          <div className="phase-step">
            <b>3</b>
            <span>{isAdmin ? 'Publish now, or schedule it' : 'An admin reviews and publishes it'}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
