import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { LaunchGatesPanel, FeatureFlagsPanel } from './LaunchControlClient';
import { ReleaseControlPanel, type ReleaseRecord } from './ReleaseControlPanel';

const FLAG_ORDER = [
  'core_learning',
  'live_classes',
  'payments',
  'subscriptions',
  'referrals',
  'scholarships',
  'whatsapp',
  'readiness_forecast',
  'multi_organization',
];

export default async function LaunchControlPage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();

  const [{ data: launchChecks }, { data: featureFlags }, { data: releases }] = await Promise.all([
    supabase.from('launch_checks').select('*').order('check_key'),
    supabase.from('feature_flags').select('*').order('flag'),
    supabase
      .from('release_records')
      .select('id,version,environment,status,migration_check,tests_passed,accessibility_passed,backup_verified,rollback_plan')
      .order('created_at', { ascending: false })
      .limit(1),
  ]);
  const latestRelease = (releases?.[0] as ReleaseRecord | undefined) ?? null;

  const orderedFlags = (featureFlags ?? [])
    .filter((f) => FLAG_ORDER.includes(f.flag))
    .sort((a, b) => FLAG_ORDER.indexOf(a.flag) - FLAG_ORDER.indexOf(b.flag));

  return (
    <>
      <header className="page-hero" style={{ padding: '45px 0' }}>
        <div className="shell">
          <span className="eyebrow">Controlled pilot</span>
          <h1 style={{ fontSize: 48 }}>Launch configuration and gates.</h1>
          <p>AcmeLearn cannot be approved for production until every required check has evidence.</p>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell admin-grid">
          <section>
            {profile && <LaunchGatesPanel profile={profile} launchChecks={launchChecks ?? []} />}
            <div className="panel" style={{ marginTop: 20 }}>
              <span className="eyebrow">Data quality</span>
              <h3 style={{ margin: '8px 0' }}>Automated reconciliation</h3>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                Illustrative — the reconciliation view is service-role only and not exposed to staff sessions.
              </p>
              <table className="data-table">
                <tbody>
                  <tr>
                    <td>Paid without enrolment</td>
                    <td>
                      <span className="status">0</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Access without payment</td>
                    <td>
                      <span className="status warn">2 review</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Expired recording published</td>
                    <td>
                      <span className="status">0</span>
                    </td>
                  </tr>
                  <tr>
                    <td>WhatsApp without consent</td>
                    <td>
                      <span className="status">0</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Booking outside availability</td>
                    <td>
                      <span className="status">0</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <aside>
            {profile && <FeatureFlagsPanel profile={profile} featureFlags={orderedFlags} />}
            <ReleaseControlPanel release={latestRelease} />
          </aside>
        </div>
      </div>
    </>
  );
}
