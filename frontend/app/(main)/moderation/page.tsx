import { createClient } from '@/lib/supabase/server';

export default async function ModerationPage() {
  const supabase = await createClient();

  const [{ data: moderations }, { data: reviewRequests }] = await Promise.all([
    supabase
      .from('marking_moderations')
      .select('*, writing_submissions(question)')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('score_review_requests')
      .select('*, writing_submissions(question)')
      .eq('status', 'requested'),
  ]);

  const diffs = (moderations ?? [])
    .map((m) => (m.original_score != null && m.moderated_score != null ? Math.abs(m.original_score - m.moderated_score) : null))
    .filter((d): d is number => d !== null);
  const meanDiff = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : null;

  return (
    <>
      <header className="page-hero" style={{ padding: '45px 0' }}>
        <div className="shell">
          <span className="eyebrow">Scoring quality</span>
          <h1 style={{ fontSize: 48 }}>Marking moderation and reviews.</h1>
          <p>Re-mark sampled work, compare criterion scores and preserve an audit trail for every change.</p>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell admin-grid">
          <section>
            <div className="panel">
              <h3>Moderation sample</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Submission</th>
                    <th>Original</th>
                    <th>Moderated</th>
                    <th>Difference</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {moderations?.length ? (
                    moderations.map((m) => {
                      const diff =
                        m.original_score != null && m.moderated_score != null
                          ? (m.moderated_score - m.original_score).toFixed(1)
                          : '—';
                      return (
                        <tr key={m.id}>
                          <td>{m.writing_submissions?.question || m.submission_id}</td>
                          <td>{m.original_score ?? '—'}</td>
                          <td>{m.moderated_score ?? '—'}</td>
                          <td>{diff}</td>
                          <td>
                            <span className={`status${m.status !== 'consistent' && m.status !== 'resolved' ? ' warn' : ''}`}>
                              {m.status === 'pending' ? 'Discuss' : m.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                        No moderation records yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="panel" style={{ marginTop: 20 }}>
              <h3>Student score-review requests</h3>
              {reviewRequests?.length ? (
                reviewRequests.map((r) => (
                  <div className="recommendation" key={r.id}>
                    <div className="rec-icon">
                      {(r.writing_submissions?.question || 'SR').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong>{r.writing_submissions?.question || 'Submission'}</strong>
                      <p>“{r.reason}” · one review permitted</p>
                    </div>
                    <button className="btn btn-dark">Review</button>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>No open score-review requests.</p>
              )}
            </div>
          </section>
          <aside>
            <div className="panel">
              <span className="eyebrow">Consistency standard</span>
              <div className="big-band" style={{ fontSize: 55, color: 'var(--aqua)' }}>
                {meanDiff !== null ? meanDiff.toFixed(2) : '—'}
              </div>
              <p style={{ color: 'var(--muted)' }}>
                Mean absolute band difference in the current sample. Escalation threshold: 0.35.
              </p>
            </div>
            <div className="lecture-note" style={{ marginTop: 20 }}>
              <b>Change control</b>
              <p style={{ fontSize: 13 }}>
                Original scores are never overwritten silently. The learner sees the resolution and reason when a
                moderated score changes.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
