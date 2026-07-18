import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { QuestionForm } from './QuestionForm';

export default async function QuestionAdminPage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();
  const { data: questions } = await supabase
    .from('question_items')
    .select('id,skill,question_type,difficulty,version,license_source,status')
    .order('created_at', { ascending: false })
    .limit(25);

  return (
    <>
      <header className="page-hero" style={{ padding: '45px 0' }}>
        <div className="shell">
          <span className="eyebrow">Assessment quality</span>
          <h1 style={{ fontSize: 48 }}>Question bank and versions.</h1>
          <p>Separate licensed assessment content from presentation code, review quality and prevent repeated mocks.</p>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell admin-grid">
          <section>
            <div className="panel">
              <div className="section-head" style={{ marginBottom: 10 }}>
                <h3>Question inventory</h3>
                <button className="btn btn-outline">Import reviewed CSV</button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Skill / type</th>
                    <th>Difficulty</th>
                    <th>Version</th>
                    <th>License</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {questions?.length ? (
                    questions.map((q) => (
                      <tr key={q.id}>
                        <td>{q.id.slice(0, 8)}</td>
                        <td>
                          {q.skill} · {q.question_type || '—'}
                        </td>
                        <td>{q.difficulty ?? '—'}</td>
                        <td>{q.version}</td>
                        <td>{q.license_source || '—'}</td>
                        <td>
                          <span className={`status${q.status !== 'published' ? ' warn' : ''}`}>
                            {q.status === 'published' ? 'Published' : q.status === 'draft' ? 'Review' : q.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                        No question items yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="panel" style={{ marginTop: 20 }}>
              <span className="eyebrow">Mock versions</span>
              <h3 style={{ margin: '8px 0' }}>Academic Mock A</h3>
              <p style={{ color: 'var(--muted)' }}>40 listening · 40 reading · 2 writing · speaking set 04</p>
              <div className="course-foot">
                <span className="status">Version 4 published</span>
                <button className="btn btn-dark">Create version 5</button>
              </div>
            </div>
          </section>
          <aside>{profile && <QuestionForm profile={profile} />}</aside>
        </div>
      </div>
    </>
  );
}
