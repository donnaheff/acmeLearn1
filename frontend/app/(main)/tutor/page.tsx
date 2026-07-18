import Link from 'next/link';
import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { StartHostLectureButton, ExportAttendanceCsvButton } from './TutorClient';

export default async function TutorPage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();
  const isTutor = profile?.role === 'tutor';
  const now = new Date();

  let nextLectureQuery = supabase
    .from('lectures')
    .select('id,title,starts_at,duration_minutes,courses(title)')
    .in('status', ['scheduled', 'live'])
    .gte('starts_at', now.toISOString())
    .order('starts_at', { ascending: true })
    .limit(1);
  if (isTutor && profile) nextLectureQuery = nextLectureQuery.eq('tutor_id', profile.id);

  let attendanceQuery = supabase
    .from('attendance')
    .select('joined_at,duration_minutes,profiles(first_name,last_name),lectures!inner(tutor_id)')
    .order('joined_at', { ascending: false })
    .limit(20);
  if (isTutor && profile) attendanceQuery = attendanceQuery.eq('lectures.tutor_id', profile.id);

  let recordingsQuery = supabase
    .from('recordings')
    .select('id,title,duration_seconds,created_at,published,lectures!inner(tutor_id,courses(title))')
    .order('created_at', { ascending: false })
    .limit(5);
  if (isTutor && profile) recordingsQuery = recordingsQuery.eq('lectures.tutor_id', profile.id);

  let interventionsQuery = supabase
    .from('interventions')
    .select('id,reason,status,profiles!student_id(first_name,last_name)')
    .eq('status', 'open')
    .limit(5);
  if (isTutor && profile) interventionsQuery = interventionsQuery.eq('assigned_to', profile.id);

  const [
    { data: nextLectureRows },
    { data: attendanceRows },
    { data: recordings },
    { data: interventions },
    { count: feedbackQueue },
    { count: liveClassesCount },
  ] = await Promise.all([
    nextLectureQuery,
    attendanceQuery,
    recordingsQuery,
    interventionsQuery,
    supabase.from('writing_submissions').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
    (isTutor && profile
      ? supabase
          .from('lectures')
          .select('id', { count: 'exact', head: true })
          .eq('tutor_id', profile.id)
          .in('status', ['scheduled', 'live'])
          .gte('starts_at', now.toISOString())
          .lte('starts_at', new Date(now.getTime() + 7 * 86400000).toISOString())
      : supabase
          .from('lectures')
          .select('id', { count: 'exact', head: true })
          .in('status', ['scheduled', 'live'])
          .gte('starts_at', now.toISOString())
          .lte('starts_at', new Date(now.getTime() + 7 * 86400000).toISOString())),
  ]);

  const nextLecture = (nextLectureRows as any[])?.[0] ?? null;
  const attendancePct = attendanceRows?.length
    ? Math.round(
        (attendanceRows.filter((a) => (a.duration_minutes ?? 0) >= 30).length / attendanceRows.length) * 100,
      )
    : null;

  return (
    <>
      <header className="page-hero" style={{ padding: '48px 0', background: '#dcefeb' }}>
        <div className="shell">
          <span className="eyebrow">Teaching workspace</span>
          <h1 style={{ fontSize: 48 }}>Your classes and learners.</h1>
          <p>Launch lectures, review attendance and publish cohort recordings.</p>
        </div>
      </header>
      <div className="section section-soft" style={{ paddingTop: 35 }}>
        <div className="shell">
          <div className="staff-metrics">
            <div className="metric">
              <span className="eyebrow">Next class</span>
              <strong style={{ fontSize: 25 }}>
                {nextLecture ? new Date(nextLecture.starts_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—'}
              </strong>
              <small>{nextLecture ? nextLecture.title : 'No upcoming class scheduled'}</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Recent attendance</span>
              <strong>{attendancePct !== null ? `${attendancePct}%` : '—'}</strong>
              <small>Present share, last {attendanceRows?.length ?? 0} records</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Assignments</span>
              <strong>{feedbackQueue ?? 0}</strong>
              <small>Awaiting feedback</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Live classes</span>
              <strong>{liveClassesCount ?? 0}</strong>
              <small>Scheduled in next 7 days</small>
            </div>
          </div>
          <div className="admin-grid">
            <section>
              <div className="panel">
                <div className="section-head" style={{ marginBottom: 15 }}>
                  <div>
                    <span className="eyebrow">{nextLecture ? 'Next · ' + (nextLecture.courses?.title || '') : 'Today'}</span>
                    <h3>{nextLecture ? nextLecture.title : 'No lecture scheduled'}</h3>
                  </div>
                  <StartHostLectureButton lectureId={nextLecture?.id ?? null} />
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                  {nextLecture
                    ? `${new Date(nextLecture.starts_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} · ${nextLecture.duration_minutes} minutes · Waiting room enabled`
                    : 'Schedule a lecture from the admin area to see host controls here.'}
                </p>
              </div>
              <div className="panel" style={{ marginTop: 22 }}>
                <div className="section-head" style={{ marginBottom: 12 }}>
                  <h3>Recent attendance</h3>
                  <ExportAttendanceCsvButton
                    rows={(attendanceRows ?? []).map((a: any) => ({
                      student: `${a.profiles?.first_name || ''} ${a.profiles?.last_name || ''}`.trim(),
                      joined: a.joined_at ? new Date(a.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
                      duration: a.duration_minutes ?? 0,
                    }))}
                  />
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Joined</th>
                      <th>Duration</th>
                      <th>Attendance</th>
                    </tr>
                  </thead>
                  <tbody id="attendanceRows">
                    {attendanceRows?.length ? (
                      attendanceRows.map((a: any, i: number) => (
                        <tr key={i}>
                          <td>
                            {a.profiles?.first_name} {a.profiles?.last_name}
                          </td>
                          <td>
                            {a.joined_at
                              ? new Date(a.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : '—'}
                          </td>
                          <td>{a.duration_minutes ?? 0} min</td>
                          <td>
                            <span className={`status${(a.duration_minutes ?? 0) < 30 ? ' warn' : ''}`}>
                              {(a.duration_minutes ?? 0) >= 30 ? 'Present' : (a.duration_minutes ?? 0) > 0 ? 'Late' : 'Absent'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                          No attendance recorded yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="panel" style={{ marginTop: 22 }}>
                <div className="section-head" style={{ marginBottom: 8 }}>
                  <h3>Cohort recordings</h3>
                </div>
                {recordings?.length ? (
                  recordings.map((r: any) => (
                    <div className="recording-card" key={r.id}>
                      <div className="recording-thumb">▶</div>
                      <div>
                        <b>{r.title}</b>
                        <p style={{ margin: '4px 0', fontSize: 12, color: 'var(--muted)' }}>
                          {new Date(r.created_at).toLocaleDateString()} ·{' '}
                          {r.duration_seconds ? Math.round(r.duration_seconds / 60) : '—'} minutes ·{' '}
                          {r.lectures?.courses?.title}
                        </p>
                      </div>
                      <span className="status">{r.published ? 'Published' : 'Unpublished'}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--muted)', fontSize: 13 }}>No recordings uploaded yet.</p>
                )}
              </div>
            </section>
            <aside>
              <div className="panel">
                <span className="eyebrow">Today at a glance</span>
                <div className="phase-step">
                  <b>{liveClassesCount ?? 0}</b>
                  <span>
                    <strong>Live classes</strong>
                    <small style={{ display: 'block' }}>
                      {nextLecture ? `Next at ${new Date(nextLecture.starts_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'None scheduled'}
                    </small>
                  </span>
                </div>
                <div className="phase-step">
                  <b>{feedbackQueue ?? 0}</b>
                  <span>
                    <strong>Feedback queue</strong>
                    <small style={{ display: 'block' }}>Writing submissions awaiting marking</small>
                  </span>
                </div>
                <Link className="btn btn-dark" href="/tutor-operations" style={{ width: '100%', marginTop: 15 }}>
                  Manage workload →
                </Link>
              </div>
              <div className="panel" style={{ marginTop: 22 }}>
                <span className="eyebrow">At-risk learners</span>
                <h3 style={{ margin: '9px 0 18px' }}>Needs your attention</h3>
                {interventions?.length ? (
                  interventions.map((i: any) => (
                    <div className="recommendation" key={i.id}>
                      <div className="rec-icon">
                        {`${i.profiles?.first_name?.[0] || ''}${i.profiles?.last_name?.[0] || ''}`.toUpperCase()}
                      </div>
                      <div>
                        <strong>
                          {i.profiles?.first_name} {i.profiles?.last_name}
                        </strong>
                        <p>{i.reason}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--muted)', fontSize: 13 }}>No open interventions.</p>
                )}
              </div>
              <div className="lecture-note" style={{ marginTop: 22 }}>
                <span className="eyebrow">Privacy reminder</span>
                <h3 style={{ marginTop: 9 }}>Record responsibly</h3>
                <ul>
                  <li>Announce recording at the start.</li>
                  <li>Do not download student data locally.</li>
                  <li>Publish only to enrolled cohorts.</li>
                  <li>Set a recording expiry date.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
