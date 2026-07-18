'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import type { Profile } from '@/lib/session';

type LaunchCheck = {
  check_key: string;
  label: string;
  required: boolean;
  status: string;
};

type FeatureFlag = {
  flag: string;
  enabled: boolean;
  description: string | null;
};

const FLAG_LABELS: Record<string, string> = {
  core_learning: 'Core learning',
  live_classes: 'Live classes',
  payments: 'One-time payments',
  subscriptions: 'Subscriptions',
  referrals: 'Referrals',
  scholarships: 'Scholarships',
  whatsapp: 'WhatsApp',
  readiness_forecast: 'Readiness forecast',
  multi_organization: 'Multi-organization',
  tutor_marketplace: 'Tutor marketplace',
  ai_recommendations: 'AI recommendations',
};

export function LaunchGatesPanel({ profile, launchChecks }: { profile: Profile; launchChecks: LaunchCheck[] }) {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const [checks, setChecks] = useState(() =>
    Object.fromEntries(launchChecks.map((c) => [c.check_key, c.status === 'passed'])),
  );
  const [saving, setSaving] = useState(false);
  const doneCount = useMemo(() => Object.values(checks).filter(Boolean).length, [checks]);

  async function saveGates() {
    setSaving(true);
    try {
      await Promise.all(
        launchChecks.map((c) => {
          const nowChecked = checks[c.check_key];
          return supabase
            .from('launch_checks')
            .update({
              status: nowChecked ? 'passed' : 'pending',
              checked_by: profile.id,
              checked_at: new Date().toISOString(),
            })
            .eq('check_key', c.check_key);
        }),
      );
      toast(
        Object.values(checks).every(Boolean)
          ? 'All required gates passed. Production approval may proceed.'
          : 'Launch remains blocked until every required gate has evidence.',
      );
      router.refresh();
    } catch (e: any) {
      toast(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel">
      <div className="section-head" style={{ marginBottom: 10 }}>
        <h3>Production launch gates</h3>
        <span className={`status${doneCount !== launchChecks.length ? ' warn' : ''}`} id="gateSummary">
          {doneCount} of {launchChecks.length} complete
        </span>
      </div>
      <div id="launchGates">
        {launchChecks.map((c) => (
          <label className="launch-gate" key={c.check_key}>
            <span>
              <b>{c.label}</b>
            </span>
            <input
              type="checkbox"
              checked={!!checks[c.check_key]}
              onChange={(e) => setChecks((prev) => ({ ...prev, [c.check_key]: e.target.checked }))}
            />
          </label>
        ))}
      </div>
      <button className="btn btn-coral" id="saveGates" style={{ marginTop: 18 }} onClick={saveGates} disabled={saving}>
        {saving ? 'Saving…' : 'Save gate evidence'}
      </button>
    </div>
  );
}

export function FeatureFlagsPanel({ profile, featureFlags }: { profile: Profile; featureFlags: FeatureFlag[] }) {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const [flags, setFlags] = useState(() => Object.fromEntries(featureFlags.map((f) => [f.flag, f.enabled])));
  const [saving, setSaving] = useState(false);

  async function saveFlags() {
    setSaving(true);
    try {
      for (const f of featureFlags) {
        const enabled = flags[f.flag];
        if (enabled === f.enabled) continue;
        const { error } = await supabase
          .from('feature_flags')
          .update({ enabled, updated_at: new Date().toISOString(), updated_by: profile.id })
          .eq('flag', f.flag);
        if (error) throw error;
      }
      toast('Feature flags saved. Changes apply on the next page load.');
      router.refresh();
    } catch (e: any) {
      toast(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel">
      <span className="eyebrow">Feature flags</span>
      <h3 style={{ margin: '8px 0' }}>Pilot scope</h3>
      <div id="featureControls">
        {featureFlags.map((f) => (
          <label className="check" key={f.flag}>
            <input
              type="checkbox"
              data-flag={f.flag}
              checked={!!flags[f.flag]}
              onChange={(e) => setFlags((prev) => ({ ...prev, [f.flag]: e.target.checked }))}
            />{' '}
            {FLAG_LABELS[f.flag] || f.flag}
          </label>
        ))}
      </div>
      <button className="btn btn-dark" id="saveFlags" style={{ width: '100%' }} onClick={saveFlags} disabled={saving}>
        {saving ? 'Saving…' : 'Save pilot flags'}
      </button>
    </div>
  );
}
