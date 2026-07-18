'use client';

import { useState } from 'react';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import type { Profile } from '@/lib/session';

type HomeValue = {
  hero_heading: string;
  hero_body: string;
  hero_cta: string;
  campaign_label: string;
};

type ResourcesValue = {
  eyebrow: string;
  heading: string;
  body: string;
};

export function ContentForm({
  profile,
  initialHome,
  initialResources,
}: {
  profile: Profile;
  initialHome: HomeValue;
  initialResources: ResourcesValue;
}) {
  const supabase = useSupabase();
  const toast = useToast();
  const [home, setHome] = useState<HomeValue>(initialHome);
  const [resources, setResources] = useState<ResourcesValue>(initialResources);
  const [submitting, setSubmitting] = useState<'home' | 'resources' | null>(null);

  async function publishSection(
    contentKey: 'home' | 'resources',
    value: HomeValue | ResourcesValue,
    published: boolean,
  ) {
    setSubmitting(contentKey);
    const { error } = await supabase.from('site_content').upsert(
      {
        content_key: contentKey,
        value,
        published,
        updated_by: profile.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'content_key' },
    );
    setSubmitting(null);
    toast(error ? error.message : published ? 'Published.' : 'Draft saved.');
  }

  async function handleHomeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const action = submitter?.value === 'publish' ? 'publish' : 'draft';
    const data = new FormData(e.currentTarget);
    const value: HomeValue = {
      hero_heading: String(data.get('hero_heading') || ''),
      hero_body: String(data.get('hero_body') || ''),
      hero_cta: String(data.get('hero_cta') || ''),
      campaign_label: String(data.get('campaign_label') || ''),
    };
    setHome(value);
    await publishSection('home', value, action === 'publish');
  }

  async function handleResourcesSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const action = submitter?.value === 'publish' ? 'publish' : 'draft';
    const data = new FormData(e.currentTarget);
    const value: ResourcesValue = {
      eyebrow: String(data.get('eyebrow') || ''),
      heading: String(data.get('heading') || ''),
      body: String(data.get('body') || ''),
    };
    setResources(value);
    await publishSection('resources', value, action === 'publish');
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify({ home, resources }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'site-content.json';
    a.click();
  }

  return (
    <>
      <section>
        <form className="panel staff-form" onSubmit={handleHomeSubmit}>
          <span className="eyebrow">Homepage hero</span>
          <div>
            <label>HERO HEADING</label>
            <input name="hero_heading" defaultValue={home.hero_heading} />
          </div>
          <div>
            <label>HERO BODY</label>
            <textarea name="hero_body" rows={4} defaultValue={home.hero_body} />
          </div>
          <div>
            <label>PRIMARY CTA</label>
            <input name="hero_cta" defaultValue={home.hero_cta} />
          </div>
          <div>
            <label>CAMPAIGN LABEL</label>
            <input name="campaign_label" defaultValue={home.campaign_label} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" name="action" value="draft" disabled={submitting === 'home'}>
              Save draft
            </button>
            <button className="btn btn-coral" name="action" value="publish" disabled={submitting === 'home'}>
              Publish homepage
            </button>
          </div>
        </form>

        <form className="panel staff-form" style={{ marginTop: 20 }} onSubmit={handleResourcesSubmit}>
          <span className="eyebrow">Resources page hero</span>
          <div>
            <label>EYEBROW LABEL</label>
            <input name="eyebrow" defaultValue={resources.eyebrow} />
          </div>
          <div>
            <label>HEADING</label>
            <input name="heading" defaultValue={resources.heading} />
          </div>
          <div>
            <label>BODY</label>
            <textarea name="body" rows={3} defaultValue={resources.body} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" name="action" value="draft" disabled={submitting === 'resources'}>
              Save draft
            </button>
            <button className="btn btn-coral" name="action" value="publish" disabled={submitting === 'resources'}>
              Publish resources page
            </button>
          </div>
        </form>
      </section>
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
          <button
            id="exportContent"
            className="btn btn-dark"
            style={{ width: '100%', marginTop: 20 }}
            onClick={handleExport}
            type="button"
          >
            Export JSON backup
          </button>
        </div>
      </aside>
    </>
  );
}
