import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [
    { data: definitions },
    { count: studentCount },
    { count: paidOrders },
    { count: checkoutStarts },
    { count: activeEnrollments },
    { count: completedEnrollments },
  ] = await Promise.all([
    supabase.from('analytics_definitions').select('metric_key,label,decision_supported,definition').eq('enabled', true),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
  ]);

  // registration_completion has no feasible direct query: profiles are only created once a
  // signup is confirmed, so there is no "started but not completed" registration state to
  // divide against — shown as a definition-only row rather than a fabricated ratio.
  const paymentConversion = checkoutStarts ? (((paidOrders ?? 0) / checkoutStarts) * 100).toFixed(1) : null;
  const courseCompletion =
    activeEnrollments || completedEnrollments
      ? Math.round(((completedEnrollments ?? 0) / ((activeEnrollments ?? 0) + (completedEnrollments ?? 0))) * 100)
      : null;

  const COMPUTED: Record<string, string | null> = {
    payment_conversion: paymentConversion !== null ? `${paymentConversion}%` : null,
    course_completion: courseCompletion !== null ? `${courseCompletion}%` : null,
  };

  return (
    <>
      <header className="page-hero" style={{ padding: '48px 0' }}>
        <div className="shell">
          <span className="eyebrow">Learning and business intelligence</span>
          <h1 style={{ fontSize: 50 }}>Performance analytics.</h1>
          <p>
            Aggregated outcomes, engagement and commercial health. Learner-level access remains restricted to
            assigned staff.
          </p>
        </div>
      </header>
      <div className="section section-soft" style={{ paddingTop: 35 }}>
        <div className="shell">
          <div className="staff-metrics">
            <div className="metric">
              <span className="eyebrow">Paid conversion</span>
              <strong>{paymentConversion !== null ? `${paymentConversion}%` : '—'}</strong>
              <small>Paid orders ÷ all orders</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Course completion</span>
              <strong>{courseCompletion !== null ? `${courseCompletion}%` : '—'}</strong>
              <small>Completed ÷ (active + completed) enrolments</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Registered students</span>
              <strong>{studentCount ?? 0}</strong>
              <small>Total profiles with the student role</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Active enrolments</span>
              <strong>{activeEnrollments ?? 0}</strong>
              <small>Currently active</small>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 22 }}>
            <span className="eyebrow">Metric catalogue</span>
            <h3 style={{ marginTop: 8 }}>Definitions and decisions supported</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Definition</th>
                  <th>Decision supported</th>
                  <th>Current value</th>
                </tr>
              </thead>
              <tbody>
                {definitions?.length ? (
                  definitions.map((d) => (
                    <tr key={d.metric_key}>
                      <td>
                        <b>{d.label}</b>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--muted)' }}>{d.definition}</td>
                      <td>{d.decision_supported}</td>
                      <td>
                        {COMPUTED[d.metric_key] !== undefined && COMPUTED[d.metric_key] !== null ? (
                          <span className="status">{COMPUTED[d.metric_key]}</span>
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: 12 }}>No direct query available</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                      No enabled metric definitions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="analytics-grid" style={{ marginTop: 22 }}>
            <div className="panel">
              <span className="eyebrow">Tutor service</span>
              <h3 style={{ marginTop: 8 }}>Marking queue</h3>
              <p style={{ color: 'var(--muted)' }}>
                Feedback turnaround has no ready-made aggregate query in this schema — see the moderation page for
                submission-level detail.
              </p>
              <Link href="/moderation" className="btn btn-outline">
                View moderation →
              </Link>
            </div>
            <div className="panel">
              <span className="eyebrow">Question quality</span>
              <h3 style={{ marginTop: 8 }}>Assessment bank</h3>
              <p style={{ color: 'var(--muted)' }}>Manage question versions and licensing in the question bank.</p>
              <Link href="/question-admin" className="btn btn-outline">
                View question bank →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
