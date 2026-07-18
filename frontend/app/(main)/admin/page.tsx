import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminClient } from './AdminClient';

const ADMIN_TOOLS = [
  {
    href: '/content-admin',
    eyebrow: 'CMS',
    title: 'Homepage & Resources copy',
    description: 'Edit hero copy and campaign text without a deploy.',
  },
  {
    href: '/content-admin/articles',
    eyebrow: 'CMS',
    title: 'Articles',
    description: 'Draft, submit and publish guides shown on /resources.',
  },
  {
    href: '/claims-admin',
    eyebrow: 'Compliance',
    title: 'Marketing claims',
    description: 'Track claim wording, evidence and expiry dates.',
  },
  {
    href: '/commerce',
    eyebrow: 'Billing',
    title: 'Payments & refunds',
    description: 'Review orders, discounts and refund requests.',
  },
  {
    href: '/launch-control',
    eyebrow: 'Release',
    title: 'Launch control',
    description: 'Track the checks blocking production launch.',
  },
  {
    href: '/monitoring',
    eyebrow: 'Ops',
    title: 'Platform health',
    description: 'Error rates, incident recovery and system status.',
  },
  {
    href: '/analytics',
    eyebrow: 'Insights',
    title: 'Performance analytics',
    description: 'Funnel, retention and cohort performance.',
  },
  {
    href: '/moderation',
    eyebrow: 'Quality',
    title: 'Marking moderation',
    description: 'Re-mark samples and audit scoring consistency.',
  },
  {
    href: '/question-admin',
    eyebrow: 'Content',
    title: 'Question bank',
    description: 'Manage assessment items and versions.',
  },
  {
    href: '/tutor-operations',
    eyebrow: 'Staffing',
    title: 'Tutor operations',
    description: 'Schedules, workload and capacity across tutors.',
  },
  {
    href: '/support-admin',
    eyebrow: 'Support',
    title: 'Support tickets',
    description: 'Draft AI-suggested replies and track resolution.',
  },
];

export default async function AdminPage() {
  const supabase = await createClient();

  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 86400000);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const [
    { count: studentCount },
    { count: openCohortCount },
    { count: lecturesWeekCount },
    { count: liveTodayCount },
    { data: attendanceSample },
    { data: notificationSample },
    { data: lectures },
    { data: enrollments },
    { data: courses },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('cohorts').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase
      .from('lectures')
      .select('id', { count: 'exact', head: true })
      .gte('starts_at', now.toISOString())
      .lte('starts_at', weekAhead.toISOString()),
    supabase
      .from('lectures')
      .select('id', { count: 'exact', head: true })
      .gte('starts_at', todayStart.toISOString())
      .lt('starts_at', todayEnd.toISOString()),
    supabase.from('attendance').select('duration_minutes').order('joined_at', { ascending: false }).limit(100),
    supabase.from('notifications').select('sent_at').order('scheduled_for', { ascending: false }).limit(200),
    supabase
      .from('lectures')
      .select('id,title,platform,starts_at,status,courses(title)')
      .order('starts_at', { ascending: true })
      .limit(10),
    supabase
      .from('enrollments')
      .select('id,status,enrolled_at,profiles(first_name,last_name),courses(title)')
      .order('enrolled_at', { ascending: false })
      .limit(10),
    supabase.from('courses').select('id,title').eq('active', true),
  ]);

  const attendancePct = attendanceSample?.length
    ? Math.round(
        (attendanceSample.filter((a) => (a.duration_minutes ?? 0) >= 30).length / attendanceSample.length) * 100,
      )
    : null;
  const reminderPct = notificationSample?.length
    ? Math.round((notificationSample.filter((n) => n.sent_at).length / notificationSample.length) * 100)
    : null;

  return (
    <>
      <header className="page-hero" style={{ padding: '48px 0' }}>
        <div className="shell">
          <span className="eyebrow">Role: Administrator</span>
          <h1 style={{ fontSize: 48 }}>Learning operations.</h1>
          <p>Manage live classes, enrolments, communications and platform access.</p>
        </div>
      </header>
      <div className="section section-soft" style={{ paddingTop: 35 }}>
        <div className="shell">
          <div className="staff-metrics">
            <div className="metric">
              <span className="eyebrow">Active students</span>
              <strong id="studentCount">{studentCount ?? '—'}</strong>
              <small>Across {openCohortCount ?? 0} open cohorts</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Lectures this week</span>
              <strong id="lectureCount">{lecturesWeekCount ?? 0}</strong>
              <small>{liveTodayCount ?? 0} today</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Attendance</span>
              <strong>{attendancePct !== null ? `${attendancePct}%` : '—'}</strong>
              <small>Present share, last 100 records</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Reminders</span>
              <strong>{reminderPct !== null ? `${reminderPct}%` : '—'}</strong>
              <small>Delivered successfully</small>
            </div>
          </div>
          <div className="panel" style={{ marginBottom: 22 }}>
            <div className="section-head" style={{ marginBottom: 12 }}>
              <h3>Administration tools</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {ADMIN_TOOLS.map((tool) => (
                <Link key={tool.href} href={tool.href} className="feature-card" style={{ display: 'block' }}>
                  <span className="eyebrow">{tool.eyebrow}</span>
                  <h4 style={{ margin: '8px 0 4px' }}>{tool.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>{tool.description}</p>
                </Link>
              ))}
            </div>
          </div>
          <div className="admin-grid">
            <section>
              <div className="panel">
                <div className="section-head" style={{ marginBottom: 12 }}>
                  <h3>Upcoming lectures</h3>
                  <Link href="/lectures" className="eyebrow">
                    Student view →
                  </Link>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Lecture</th>
                      <th>Platform</th>
                      <th>Start</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody id="lectureRows">
                    {lectures?.length ? (
                      lectures.map((l: any) => (
                        <tr key={l.id}>
                          <td>
                            <b>{l.title}</b>
                            <br />
                            <small>{l.courses?.title || ''}</small>
                          </td>
                          <td>{l.platform}</td>
                          <td>{new Date(l.starts_at).toLocaleString()}</td>
                          <td>
                            <span className={`status${l.status === 'draft' ? ' warn' : ''}`}>{l.status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                          No lectures scheduled
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="panel" style={{ marginTop: 22 }}>
                <div className="section-head" style={{ marginBottom: 12 }}>
                  <h3>Recent enrolments</h3>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments?.length ? (
                      enrollments.map((e: any) => (
                        <tr key={e.id}>
                          <td>
                            {e.profiles?.first_name} {e.profiles?.last_name}
                          </td>
                          <td>{e.courses?.title}</td>
                          <td>
                            <span className={`status${e.status !== 'active' ? ' warn' : ''}`}>{e.status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                          No enrolments yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            <aside>
              <div className="panel">
                <AdminClient courses={courses ?? []} />
              </div>
              <div className="panel" style={{ marginTop: 22 }}>
                <span className="eyebrow">Communication health</span>
                <h3 style={{ margin: '9px 0 17px' }}>Reminder delivery</h3>
                <p style={{ fontSize: 13 }}>
                  Overall <b style={{ float: 'right' }}>{reminderPct !== null ? `${reminderPct}%` : '—'}</b>
                </p>
                <div className="bar">
                  <span style={{ width: `${reminderPct ?? 0}%` }} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
