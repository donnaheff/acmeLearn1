import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { BlockTimeForm, ClassChangeButton, EditAvailabilityButton, CohortWaitlistButton } from './TutorOperationsClient';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export default async function TutorOperationsPage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();
  const isTutor = profile?.role === 'tutor';

  let availabilityQuery = supabase
    .from('tutor_availability')
    .select('id,weekday,starts_at,ends_at,timezone')
    .order('weekday', { ascending: true });
  if (isTutor && profile) availabilityQuery = availabilityQuery.eq('tutor_id', profile.id);

  let cohortsQuery = supabase.from('cohorts').select('id,name,max_students,course_id').eq('status', 'open');
  if (isTutor && profile) cohortsQuery = cohortsQuery.eq('tutor_id', profile.id);

  const [{ data: availability }, { data: cohorts }] = await Promise.all([availabilityQuery, cohortsQuery]);

  const cohortCapacity = await Promise.all(
    (cohorts ?? []).map(async (c) => {
      const { count } = await supabase
        .from('cohort_members')
        .select('id', { count: 'exact', head: true })
        .eq('cohort_id', c.id)
        .eq('status', 'active');
      return { ...c, members: count ?? 0 };
    }),
  );

  return (
    <>
      <header className="page-hero" style={{ padding: '45px 0' }}>
        <div className="shell">
          <span className="eyebrow">Single-tutor capacity control</span>
          <h1 style={{ fontSize: 48 }}>{profile?.first_name ? `${profile.first_name}’s` : 'Your'} schedule and workload.</h1>
          <p>Prevent double-booking, protect feedback time and pause enrolment before capacity is exceeded.</p>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell">
          <div className="staff-metrics">
            <div className="metric">
              <span className="eyebrow">Weekly availability blocks</span>
              <strong>{availability?.length ?? 0}</strong>
              <small>Recurring windows configured</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Open cohorts</span>
              <strong>{cohorts?.length ?? 0}</strong>
              <small>Currently accepting students</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Capacity</span>
              <strong>—</strong>
              <small>Illustrative — no workload aggregate table</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Private sessions</span>
              <strong>—</strong>
              <small>Illustrative — no bookings aggregate wired here</small>
            </div>
          </div>
          <div className="admin-grid">
            <section>
              <div className="panel">
                <div className="section-head" style={{ marginBottom: 12 }}>
                  <h3>Weekly availability</h3>
                  <span className="status">Africa/Lagos</span>
                </div>
                <table className="data-table">
                  <tbody>
                    {availability?.length ? (
                      availability.map((a) => (
                        <tr key={a.id}>
                          <td>{WEEKDAYS[a.weekday]}</td>
                          <td>
                            {formatTime(a.starts_at)}–{formatTime(a.ends_at)}
                          </td>
                          <td>
                            <EditAvailabilityButton id={a.id} startsAt={a.starts_at} endsAt={a.ends_at} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                          No availability windows configured
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="panel" style={{ marginTop: 20 }}>
                <h3>Upcoming workload</h3>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Illustrative — teaching and marking hours have no ready-made aggregate query in this schema.
                </p>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Live teaching</th>
                      <th>Marking</th>
                      <th>Total load</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Today</td>
                      <td>2h 15m</td>
                      <td>2h</td>
                      <td>
                        <span className="status">4h 15m</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Friday</td>
                      <td>2h</td>
                      <td>3h 30m</td>
                      <td>
                        <span className="status warn">5h 30m</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Saturday</td>
                      <td>4h</td>
                      <td>1h</td>
                      <td>
                        <span className="status warn">5h</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="panel" style={{ marginTop: 20 }}>
                <div className="section-head">
                  <h3>Cohort capacity</h3>
                </div>
                <div className="progress-list">
                  {cohortCapacity.length ? (
                    cohortCapacity.map((c) => (
                      <div className="progress-row" key={c.id} style={{ gridTemplateColumns: '90px 1fr 60px auto' }}>
                        <b>{c.name}</b>
                        <div className="bar">
                          <span style={{ width: `${c.max_students ? Math.min(100, (c.members / c.max_students) * 100) : 0}%` }} />
                        </div>
                        <strong>
                          {c.members}/{c.max_students ?? '—'}
                        </strong>
                        <CohortWaitlistButton cohortId={c.id} courseId={c.course_id} />
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--muted)', fontSize: 13 }}>No open cohorts.</p>
                  )}
                </div>
              </div>
            </section>
            <aside>
              <div className="panel">
                <span className="eyebrow">Block time</span>
                <h3 style={{ margin: '8px 0 17px' }}>Add unavailability</h3>
                {profile && <BlockTimeForm profile={profile} />}
              </div>
              <div className="panel" style={{ marginTop: 20 }}>
                <span className="eyebrow">Class continuity</span>
                <h3 style={{ margin: '8px 0' }}>Cancel or reschedule</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                  Students receive email, WhatsApp and in-app updates. Choose a new time, self-study replacement or
                  service credit.
                </p>
                <ClassChangeButton />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
