'use client';

import Link from 'next/link';
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

type HeroValue = {
  eyebrow: string;
  heading: string;
  body: string;
};

type TutorValue = {
  badge: string;
  name: string;
  tagline: string;
  note: string;
};

type AnyValue = HomeValue | HeroValue | TutorValue;

function HeroSectionForm({
  sectionKey,
  label,
  ctaLabel,
  initialValue,
  busy,
  onSave,
}: {
  sectionKey: string;
  label: string;
  ctaLabel: string;
  initialValue: HeroValue;
  busy: boolean;
  onSave: (key: string, value: HeroValue, published: boolean) => Promise<void>;
}) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const action = submitter?.value === 'publish' ? 'publish' : 'draft';
    const data = new FormData(e.currentTarget);
    const value: HeroValue = {
      eyebrow: String(data.get('eyebrow') || ''),
      heading: String(data.get('heading') || ''),
      body: String(data.get('body') || ''),
    };
    await onSave(sectionKey, value, action === 'publish');
  }

  return (
    <form className="panel staff-form" style={{ marginTop: 20 }} onSubmit={handleSubmit}>
      <span className="eyebrow">{label}</span>
      <div>
        <label>EYEBROW LABEL</label>
        <input name="eyebrow" defaultValue={initialValue.eyebrow} />
      </div>
      <div>
        <label>HEADING</label>
        <input name="heading" defaultValue={initialValue.heading} />
      </div>
      <div>
        <label>BODY</label>
        <textarea name="body" rows={3} defaultValue={initialValue.body} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-outline" name="action" value="draft" disabled={busy}>
          Save draft
        </button>
        <button className="btn btn-coral" name="action" value="publish" disabled={busy}>
          {ctaLabel}
        </button>
      </div>
    </form>
  );
}

function TutorProfileForm({
  initialValue,
  busy,
  onSave,
}: {
  initialValue: TutorValue;
  busy: boolean;
  onSave: (key: string, value: TutorValue, published: boolean) => Promise<void>;
}) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const action = submitter?.value === 'publish' ? 'publish' : 'draft';
    const data = new FormData(e.currentTarget);
    const value: TutorValue = {
      badge: String(data.get('badge') || ''),
      name: String(data.get('name') || ''),
      tagline: String(data.get('tagline') || ''),
      note: String(data.get('note') || ''),
    };
    await onSave('meet_your_tutor', value, action === 'publish');
  }

  return (
    <form className="panel staff-form" style={{ marginTop: 20 }} onSubmit={handleSubmit}>
      <span className="eyebrow">Meet your tutor profile</span>
      <div>
        <label>BADGE</label>
        <input name="badge" defaultValue={initialValue.badge} />
      </div>
      <div>
        <label>TUTOR NAME</label>
        <input name="name" defaultValue={initialValue.name} />
      </div>
      <div>
        <label>TAGLINE</label>
        <input name="tagline" defaultValue={initialValue.tagline} />
      </div>
      <div>
        <label>NOTE</label>
        <input name="note" defaultValue={initialValue.note} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-outline" name="action" value="draft" disabled={busy}>
          Save draft
        </button>
        <button className="btn btn-coral" name="action" value="publish" disabled={busy}>
          Publish tutor profile
        </button>
      </div>
    </form>
  );
}

export function ContentForm({
  profile,
  initialHome,
  initialResources,
  initialCompare,
  initialPilot,
  initialTutor,
}: {
  profile: Profile;
  initialHome: HomeValue;
  initialResources: HeroValue;
  initialCompare: HeroValue;
  initialPilot: HeroValue;
  initialTutor: TutorValue;
}) {
  const supabase = useSupabase();
  const toast = useToast();
  const [home, setHome] = useState<HomeValue>(initialHome);
  const [submitting, setSubmitting] = useState<string | null>(null);

  async function publishSection(contentKey: string, value: AnyValue, published: boolean) {
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

  function handleExport() {
    const blob = new Blob([JSON.stringify({ home, initialResources, initialCompare, initialPilot, initialTutor }, null, 2)], {
      type: 'application/json',
    });
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

        <HeroSectionForm
          sectionKey="resources"
          label="Resources page hero"
          ctaLabel="Publish resources page"
          initialValue={initialResources}
          busy={submitting === 'resources'}
          onSave={publishSection}
        />
        <HeroSectionForm
          sectionKey="compare"
          label="Compare page hero"
          ctaLabel="Publish compare page"
          initialValue={initialCompare}
          busy={submitting === 'compare'}
          onSave={publishSection}
        />
        <HeroSectionForm
          sectionKey="pilot"
          label="Pilot page hero"
          ctaLabel="Publish pilot page"
          initialValue={initialPilot}
          busy={submitting === 'pilot'}
          onSave={publishSection}
        />
        <TutorProfileForm initialValue={initialTutor} busy={submitting === 'meet_your_tutor'} onSave={publishSection} />
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
          <Link href="/content-admin/history" className="btn btn-dark" style={{ width: '100%', marginTop: 20, display: 'block', textAlign: 'center' }}>
            View revision history →
          </Link>
          <button
            id="exportContent"
            className="btn btn-outline"
            style={{ width: '100%', marginTop: 10 }}
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
