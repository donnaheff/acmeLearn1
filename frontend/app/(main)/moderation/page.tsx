import { createClient } from '@/lib/supabase/server';
import { ScoreReviewList } from './ScoreReviewList';

const AI_REVIEW_THRESHOLD = 0.5;

export default async function ModerationPage() {
  const supabase = await createClient();

  const [{ data: moderations }, { data: reviewRequests }, { data: aiComparisons }] = await Promise.all([
    supabase
      .from('marking_moderations')
      .select('*, writing_submissions(question)')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('score_review_requests')
      .select('*, writing_submissions(question)')
      .eq('status', 'requested'),
    supabase
      .from('writing_submissions')
      .select('id, question, overall_band, ai_overall_band, marked_by')
      .eq('status', 'marked')
      .not('overall_band', 'is', null)
      .not('ai_overall_band', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(30),
  ]);

  const diffs = (moderations ?? [])
    .map((m) => (m.original_score != null && m.moderated_score != null ? Math.abs(m.original_score - m.moderated_score) : null))
    .filter((d): d is number => d !== null);
  const meanDiff = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : null;

  const flagged = (aiComparisons ?? [])
    .map((s) => ({ ...s, diff: Math.abs((s.overall_band ?? 0) - (s.ai_overall_band ?? 0)) }))
    .filter((s) => s.diff >= AI_REVIEW_THRESHOLD)
    .sort((a, b) => b.diff - a.diff);

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
              <ScoreReviewList requests={reviewRequests ?? []} />
            </div>
            <div className="panel" style={{ marginTop: 20 }}>
              <div className="section-head" style={{ marginBottom: 12 }}>
                <h3>AI vs tutor consistency</h3>
                <span className="eyebrow">Flagged at ≥{AI_REVIEW_THRESHOLD} band difference</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Submission</th>
                    <th>Tutor band</th>
                    <th>AI estimate</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {flagged.length ? (
                    flagged.map((s) => (
                      <tr key={s.id}>
                        <td>{s.question}</td>
                        <td>{s.overall_band}</td>
                        <td>{s.ai_overall_band}</td>
                        <td>
                          <span className="status warn">{s.diff.toFixed(1)}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                        No large AI/tutor disagreements in recently marked work
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
                AI estimates are generated when a student requests instant feedback — not a substitute for human
                marking, just an independent second read to catch potential grading drift.
              </p>
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
