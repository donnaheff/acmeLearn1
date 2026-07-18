import Link from 'next/link';
import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';

type AssignmentRow = {
  id: string;
  title: string;
  instructions: string | null;
  due_at: string | null;
  status: string | null;
  course_id: string | null;
  courses: { title: string } | null;
};

const ICONS: Record<number, string> = { 0: '✎', 1: '◎', 2: '▤' };

function formatDue(due: string | null) {
  if (!due) return 'No due date';
  const d = new Date(due);
  const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
  if (days < 0) return `Overdue · ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`;
}

export default async function AssignmentsPage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from('assignments')
    .select('id,title,instructions,due_at,status,course_id,courses(title)')
    .eq('student_id', profile!.id)
    .order('due_at', { ascending: true });

  const assignments = (data || []) as unknown as AssignmentRow[];
  const dueSoon = assignments.filter((a) => a.status === 'assigned' || a.status === 'late' || a.status === 'submitted');
  const returned = assignments.find((a) => a.status === 'graded' || a.status === 'returned');
  const doneCount = assignments.filter((a) => a.status && !['assigned'].includes(a.status)).length;

  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <span className="eyebrow">Your coursework</span>
          <h1 style={{ fontSize: 52 }}>Assignments and feedback.</h1>
          <p>Keep deadlines, submissions, tutor comments and resubmissions in one place.</p>
        </div>
      </header>
      <main className="section section-soft">
        <div className="shell admin-grid">
          <section className="panel">
            <div className="section-head" style={{ marginBottom: 8 }}>
              <h3>Due soon</h3>
              <span className="eyebrow">{dueSoon.length} active</span>
            </div>
            {dueSoon.length === 0 && <p style={{ color: 'var(--muted)' }}>No assignments due right now.</p>}
            {dueSoon.map((a, i) => (
              <div className="recommendation" key={a.id}>
                <div className="rec-icon">{ICONS[i % 3]}</div>
                <div>
                  <span className="rec-tag">
                    {formatDue(a.due_at)} · {a.status}
                  </span>
                  <strong>{a.title}</strong>
                  <p>{a.courses?.title || 'AcmeLearn'}</p>
                </div>
                <Link className="btn btn-outline" href="/writing">
                  Continue
                </Link>
              </div>
            ))}
          </section>
          <aside>
            {returned ? (
              <div className="panel">
                <span className="eyebrow">Recently returned</span>
                <h3 style={{ margin: '10px 0' }}>{returned.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>{returned.instructions}</p>
                <Link className="btn btn-dark" href="/writing" style={{ width: '100%' }}>
                  Review feedback →
                </Link>
              </div>
            ) : (
              <div className="panel">
                <span className="eyebrow">Recently returned</span>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>No graded work yet.</p>
              </div>
            )}
            <div className="streak">
              <b>{assignments.length ? Math.round((doneCount / assignments.length) * 100) : 0}%</b>
              <span>
                <strong>Completed</strong>
                <small style={{ display: 'block' }}>
                  {doneCount} of {assignments.length} assignments
                </small>
              </span>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
