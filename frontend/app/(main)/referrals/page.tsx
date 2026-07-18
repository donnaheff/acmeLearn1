import { getSessionProfile } from '@/lib/session';
import { getFeatureFlags } from '@/lib/featureFlags';
import { createClient } from '@/lib/supabase/server';
import { ReferralsClient, type Referral } from './ReferralsClient';

export default async function ReferralsPage() {
  const profile = await getSessionProfile();
  const flags = await getFeatureFlags(profile);

  if (!flags.referrals) {
    return (
      <main className="section section-soft">
        <div className="shell">
          <div className="panel" style={{ textAlign: 'center', maxWidth: 600, margin: 'auto' }}>
            <span className="eyebrow">Access and rewards</span>
            <h2 style={{ margin: '10px 0' }}>Referrals aren&apos;t available yet.</h2>
            <p style={{ color: 'var(--muted)' }}>This programme is being rolled out gradually to learners.</p>
          </div>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const [{ data }, { data: courses }] = await Promise.all([
    supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', profile!.id)
      .order('created_at', { ascending: false }),
    supabase.from('courses').select('id,title').eq('active', true),
  ]);

  return (
    <ReferralsClient
      profileId={profile!.id}
      referrals={(data || []) as Referral[]}
      courses={(courses || []) as Array<{ id: string; title: string }>}
    />
  );
}
