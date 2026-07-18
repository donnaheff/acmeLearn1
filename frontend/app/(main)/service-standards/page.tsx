import { createClient } from '@/lib/supabase/server';

type ServiceLevel = {
  service_key: string;
  label: string;
  target_hours: number;
  policy_text: string | null;
};

const DISPLAY_ORDER = [
  'writing_feedback',
  'speaking_feedback',
  'support_standard',
  'refund_processing',
  'lecture_access',
];

// service_levels stores a raw target_hours figure; the presentation unit (minutes,
// hours, or business days) depends on what each service measures, not the number alone.
const UNIT: Record<string, 'minutes' | 'hours' | 'days'> = {
  lecture_access: 'minutes',
  writing_feedback: 'hours',
  speaking_feedback: 'hours',
  support_standard: 'days',
  refund_processing: 'days',
};

function formatTarget(row: ServiceLevel) {
  const hours = Number(row.target_hours);
  const unit = UNIT[row.service_key] ?? (hours < 1 ? 'minutes' : hours % 24 === 0 ? 'days' : 'hours');
  if (unit === 'minutes') return `Within ${Math.round(hours * 60)} minutes`;
  if (unit === 'days') {
    const days = hours / 24;
    return `Within ${days} business day${days === 1 ? '' : 's'}`;
  }
  return `Within ${hours} hours`;
}

export default async function ServiceStandardsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('service_levels')
    .select('service_key,label,target_hours,policy_text')
    .eq('active', true);

  const rows = (data ?? []) as ServiceLevel[];
  rows.sort((a, b) => DISPLAY_ORDER.indexOf(a.service_key) - DISPLAY_ORDER.indexOf(b.service_key));

  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <span className="eyebrow">What learners can expect</span>
          <h1 style={{ fontSize: 52 }}>Clear service standards.</h1>
          <p>
            Targets are measured and published honestly. Capacity warnings appear before payment
            when demand is high.
          </p>
        </div>
      </header>
      <main className="section">
        <div className="shell">
          <div className="trust-grid">
            {rows.map((row) => (
              <div className="trust-item" key={row.service_key}>
                <span className="eyebrow">{row.label}</span>
                <strong>{formatTarget(row)}</strong>
                <small>{row.policy_text}</small>
              </div>
            ))}
          </div>
          <div className="legal">
            <h2>Rescheduling</h2>
            <p>
              Private coaching may be rescheduled without charge with at least 24 hours’ notice.
              Late cancellations and missed sessions are handled under the published terms, except
              documented emergencies.
            </p>
            <h2>Lecture disruption</h2>
            <p>
              If AcmeLearn cancels a live class, learners receive a rescheduled time, an equivalent
              recorded clinic, service credit or an applicable partial refund. Notices are sent
              through enabled academic channels.
            </p>
            <h2>Recording availability</h2>
            <p>
              Published cohort recordings are normally available within 24 hours and retained for
              60 days. Access remains restricted to active enrolments.
            </p>
            <h2>Capacity protection</h2>
            <p>
              New sales pause before the single tutor reaches the configured teaching and feedback
              limit. Learners may join a dated waitlist without payment.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
