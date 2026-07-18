'use client';

import { useState } from 'react';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import type { Profile } from '@/lib/session';

type ContentValue = {
  hero_heading: string;
  hero_body: string;
  hero_cta: string;
  campaign_label: string;
};

export function ContentForm({
  profile,
  initialValue,
}: {
  profile: Profile;
  initialValue: ContentValue;
}) {
  const supabase = useSupabase();
  const toast = useToast();
  const [draft, setDraft] = useState<ContentValue>(initialValue);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const action = submitter?.value === 'publish' ? 'publish' : 'draft';
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const value: ContentValue = {
      hero_heading: String(data.get('hero_heading') || ''),
      hero_body: String(data.get('hero_body') || ''),
      hero_cta: String(data.get('hero_cta') || ''),
      campaign_label: String(data.get('campaign_label') || ''),
    };
    setDraft(value);
    const { error } = await supabase.from('site_content').upsert(
      {
        content_key: 'home',
        value,
        published: action === 'publish',
        updated_by: profile.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'content_key' },
    );
    if (error) {
      toast(error.message);
    } else {
      toast(action === 'publish' ? 'Homepage published.' : 'Draft saved.');
    }
    setSubmitting(false);
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify({ home: draft }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'site-content.json';
    a.click();
  }

  return (
    <>
      <form id="contentForm" className="panel staff-form" onSubmit={handleSubmit}>
        <div>
          <label>HERO HEADING</label>
          <input name="hero_heading" defaultValue={draft.hero_heading} />
        </div>
        <div>
          <label>HERO BODY</label>
          <textarea name="hero_body" rows={4} defaultValue={draft.hero_body} />
        </div>
        <div>
          <label>PRIMARY CTA</label>
          <input name="hero_cta" defaultValue={draft.hero_cta} />
        </div>
        <div>
          <label>CAMPAIGN LABEL</label>
          <input name="campaign_label" defaultValue={draft.campaign_label} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" name="action" value="draft" disabled={submitting}>
            Save draft
          </button>
          <button className="btn btn-coral" name="action" value="publish" disabled={submitting}>
            Publish homepage
          </button>
        </div>
      </form>
      <aside>
        <div className="panel">
          <span className="eyebrow">Publishing workflow</span>
          <h3 style={{ margin: '10px 0' }}>Safe content updates</h3>
          <div className="phase-step">
            <b>1</b>
            <span>Save a draft</span>
          </div>
          <div className="phase-step">
            <b>2</b>
            <span>Preview on staging</span>
          </div>
          <div className="phase-step">
            <b>3</b>
            <span>Publish to students</span>
          </div>
          <button id="exportContent" className="btn btn-dark" style={{ width: '100%', marginTop: 20 }} onClick={handleExport} type="button">
            Export JSON backup
          </button>
        </div>
      </aside>
    </>
  );
}
