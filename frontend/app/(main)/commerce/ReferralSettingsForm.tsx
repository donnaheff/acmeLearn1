'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export function ReferralSettingsForm({ rewardPercent }: { rewardPercent: number }) {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const [value, setValue] = useState(String(rewardPercent));
  const [saving, setSaving] = useState(false);

  async function save() {
    const percent = Number(value);
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
      toast('Enter a percentage between 1 and 100.');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('platform_settings')
      .update({ value: percent })
      .eq('key', 'referral_reward_percent');
    setSaving(false);
    if (error) {
      toast(error.message);
      return;
    }
    toast('Referral reward updated — applies to the next verified referred payment.');
    router.refresh();
  }

  return (
    <div className="panel" style={{ marginTop: 20 }}>
      <span className="eyebrow">Referral programme</span>
      <h3 style={{ margin: '8px 0' }}>Reward percentage</h3>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        Credited to the referrer as a percentage of the referred learner&apos;s first verified payment.
      </p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="number"
          min={1}
          max={100}
          style={{ width: 80 }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <span>%</span>
        <button type="button" className="btn btn-outline" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
