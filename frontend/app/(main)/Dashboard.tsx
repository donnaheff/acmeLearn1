import Link from 'next/link';
import type { Profile } from '@/lib/session';
import type { Flags } from '@/lib/featureFlags';

type SkillScore = { skill: string; score: number; recorded_at: string };
type Recommendation = {
  skill: string;
  title: string;
  reason: string;
  activity_url: string;
  priority: number;
};
export type DashboardLecture = {
  id: string;
  title: string;
  starts_at: string;
  platform: string;
  courses: { title: string } | null;
};
type Diagnostic = { exam_date: string | null };
type Assignment = { status: string };

const SKILLS = ['listening', 'reading', 'writing', 'speaking'] as const;
const REC_ICON: Record<string, string> = { writing: '✎', speaking: '◎', reading: '▤', listening: '◖))' };

function latestBySkill(scores: SkillScore[]) {
  const latest: Record<string, number> = {};
  for (const s of scores) if (!(s.skill in latest)) latest[s.skill] = Number(s.score);
  return latest;
}

function weekDays() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label: d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 3).toUpperCase(), date: d.getDate(), isToday: d.toDateString() === today.toDateString() };
  });
}

export function Dashboard({
  profile,
  diagnostic,
  scores,
  recommendations,
  nextLecture,
  hasCompletedCourse,
  classesAttended,
  assignments,
  flags,
}: {
  profile: Profile;
  diagnostic: Diagnostic | null;
  scores: SkillScore[];
  recommendations: Recommendation[];
  nextLecture: DashboardLecture | null;
  hasCompletedCourse: boolean;
  classesAttended: number;
  assignments: Assignment[];
  flags: Flags;
}) {
  const today = new Date();
  const dashDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(today);

  const latest = latestBySkill(scores);
  const target = Number(profile.target_band || 7);
  const values = SKILLS.map((s) => latest[s]).filter((v) => v !== undefined) as number[];
  const overallBand = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

  const examDays = diagnostic?.exam_date
    ? Math.ceil((new Date(diagnostic.exam_date).getTime() - today.getTime()) / 86400000)
    : null;

  let banner: { title: string; body: string; href: string; label: string };
  if (hasCompletedCourse) {
    banner = {
      title: 'Course completed—keep your skills active.',
      body: 'Review recordings or download your completion certificate.',
      href: '/certificate',
      label: 'View certificate →',
    };
  } else if (!diagnostic) {
    banner = {
      title: 'Welcome to AcmeLearn.',
      body: 'Complete the short diagnostic to personalize your dashboard.',
      href: '/learning',
      label: 'Start diagnostic →',
    };
  } else if (examDays !== null && examDays <= 14) {
    banner = {
      title: `${Math.max(0, examDays)} days until your exam.`,
      body: 'Switch to final-review mode with timed mocks and focused correction.',
      href: '/mock',
      label: 'Start timed mock →',
    };
  } else {
    banner = {
      title: 'Your plan is on track.',
      body: "Today's highest-impact activity is ready.",
      href: '/writing',
      label: 'Continue plan →',
    };
  }

  const assignmentsDone = assignments.filter((a) => a.status !== 'assigned').length;

  return (
    <>
      <Link className="diagnostic-float hidden" id="diagnosticFloat" href="/learning">
        Find my estimated band →
      </Link>
      <section className="dashboard" style={{ display: 'block' }}>
        <div className="shell">
          <div className="dash-welcome">
            <div>
              <span className="eyebrow">My learning dashboard</span>
              <h1>
                Good morning, <span>{profile.first_name || 'Learner'}</span>.
              </h1>
            </div>
            <div className="dash-date">{dashDate}</div>
          </div>

          <div className="state-banner">
            <span>
              <strong>{banner.title}</strong>
              <small style={{ display: 'block', color: 'var(--muted)' }}>{banner.body}</small>
            </span>
            <Link className="btn btn-dark" href={banner.href}>
              {banner.label}
            </Link>
          </div>

          <div className="dash-grid">
            <div>
              <div className="band-overview">
                <div>
                  <span className="eyebrow" style={{ color: '#8bd8cd' }}>
                    Estimated overall band
                  </span>
                  <h2>{overallBand ? 'Your progress is on track.' : 'Complete an assessment to see your estimate.'}</h2>
                  <p style={{ color: '#bdcbd6' }}>
                    {overallBand
                      ? `${Math.max(0, target - overallBand).toFixed(1)} bands to your target`
                      : `Target band ${target.toFixed(1)}`}
                    {examDays !== null && ` · Exam in ${Math.max(0, examDays)} days`}
                  </p>
                </div>
                <div className="big-band">{overallBand ? overallBand.toFixed(1) : '—'}</div>
              </div>

              <div className="panel" style={{ marginTop: 22 }}>
                <div className="section-head" style={{ marginBottom: 15 }}>
                  <h3>Skill progress</h3>
                  <Link className="eyebrow" href="/practice">
                    View analytics →
                  </Link>
                </div>
                <div className="progress-list">
                  {SKILLS.map((skill) => {
                    const score = latest[skill];
                    const pct = score ? Math.min(100, (score / 9) * 100) : 0;
                    return (
                      <div className="progress-row" key={skill}>
                        <b style={{ textTransform: 'capitalize' }}>{skill}</b>
                        <div className="bar">
                          <span style={{ width: `${pct}%` }} />
                        </div>
                        <strong>{score ? score.toFixed(1) : '—'}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              {flags.ai_recommendations && (
                <div className="panel" style={{ marginTop: 22 }}>
                  <div className="section-head" style={{ marginBottom: 14 }}>
                    <h3>Recommended for you</h3>
                    <Link className="eyebrow" href="/practice">
                      See all →
                    </Link>
                  </div>
                  {recommendations.length ? (
                    recommendations.map((rec, i) => (
                      <div className="recommendation" key={i}>
                        <div className="rec-icon">{REC_ICON[rec.skill] || '★'}</div>
                        <div>
                          <span className="rec-tag">Priority {rec.priority}</span>
                          <strong>{rec.title}</strong>
                          <p>{rec.reason}</p>
                        </div>
                        <Link className="arrow" href={rec.activity_url}>
                          →
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                      Complete a diagnostic or submission for personalised recommendations.
                    </p>
                  )}
                </div>
              )}
            </div>

            <aside>
              <div className="panel">
                <h3>Study this week</h3>
                <div className="calendar-row">
                  {weekDays().map((d) => (
                    <div className={`day${d.isToday ? ' today' : ''}`} key={d.label}>
                      {d.label}
                      <strong>{d.date}</strong>
                    </div>
                  ))}
                </div>
                <span className="eyebrow">Next live class</span>
                {nextLecture ? (
                  <div className="next-class">
                    <small>
                      {new Date(nextLecture.starts_at).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}{' '}
                      · {nextLecture.platform}
                    </small>
                    <strong>{nextLecture.title}</strong>
                    <span style={{ fontSize: 12 }}>{nextLecture.courses?.title}</span>
                    <Link className="btn btn-coral" href="/lectures" style={{ width: '100%', marginTop: 14 }}>
                      Go to lecture room →
                    </Link>
                  </div>
                ) : (
                  <div className="next-class">
                    <small>No upcoming class scheduled</small>
                    <Link className="btn btn-coral" href="/lectures" style={{ width: '100%', marginTop: 14 }}>
                      View lecture schedule →
                    </Link>
                  </div>
                )}
                <div className="streak">
                  <b>🎓 {classesAttended}</b>
                  <span>
                    <strong>classes attended</strong>
                    <small style={{ display: 'block', color: '#796a4e' }}>Total live sessions so far</small>
                  </span>
                </div>
              </div>
              <div className="panel" style={{ marginTop: 22 }}>
                <h3>Today’s plan</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                  {assignmentsDone} of {assignments.length || 0} assignments complete
                </p>
                <div className="bar" style={{ height: 9 }}>
                  <span
                    style={{ width: assignments.length ? `${(assignmentsDone / assignments.length) * 100}%` : '0%' }}
                  />
                </div>
                <Link className="btn btn-dark" style={{ width: '100%', marginTop: 22 }} href="/practice">
                  Continue learning →
                </Link>
                {flags.readiness_forecast && (
                  <Link className="btn btn-outline" style={{ width: '100%', marginTop: 9 }} href="/readiness">
                    Exam readiness →
                  </Link>
                )}
                <Link className="btn btn-outline" style={{ width: '100%', marginTop: 9 }} href="/recordings">
                  Lecture recordings →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
