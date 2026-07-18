'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

const TOTAL_QUESTIONS = 10;
const OPTIONS = [
  'Urban trees are primarily valuable for visual appeal.',
  'Every study proves that trees directly improve health.',
  'Evidence supports health benefits, although interpretation requires care.',
  'Low-income areas have more mature trees.',
];

export function MockClient({ profileId }: { profileId: string }) {
  const supabase = useSupabase();
  const toast = useToast();

  const [startedAt] = useState(() => new Date().toISOString());
  const [seconds, setSeconds] = useState(3505);
  const [current, setCurrent] = useState(1);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  function selectOption(option: string) {
    setResponses((prev) => ({ ...prev, [current]: option }));
  }

  function toggleFlag() {
    setFlagged((prev) => ({ ...prev, [current]: !prev[current] }));
  }

  async function nextOrSubmit() {
    if (current < TOTAL_QUESTIONS) {
      toast('Response saved. Moving to the next question…');
      setCurrent((c) => c + 1);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('mock_attempts').insert({
      user_id: profileId,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      current_section: 'reading',
      responses,
      scores: {},
    });
    setSubmitting(false);
    if (error) {
      toast(error.message);
      return;
    }
    setSubmitted(true);
    toast('Mock exam submitted. Your tutor will review your responses.');
  }

  if (submitted) {
    return (
      <main className="section section-soft">
        <div className="shell">
          <div className="panel" style={{ textAlign: 'center', maxWidth: 600, margin: 'auto' }}>
            <span className="eyebrow">Academic reading mock</span>
            <h2 style={{ margin: '10px 0' }}>Your mock exam has been submitted.</h2>
            <p style={{ color: 'var(--muted)' }}>
              Responses for all {TOTAL_QUESTIONS} questions were recorded. Feedback will appear in your assignments
              once marked.
            </p>
            <Link className="btn btn-dark" href="/assignments">
              View assignments →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="shell studio-tabs">
        <Link href="/learning">Diagnostic</Link>
        <Link href="/writing">Writing workspace</Link>
        <Link href="/speaking">Speaking simulator</Link>
        <Link className="active" href="/mock">
          Mock exam
        </Link>
      </div>
      <main className="section section-soft">
        <div className="shell">
          <div
            className="panel"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}
          >
            <div>
              <span className="eyebrow">Academic reading mock</span>
              <b style={{ display: 'block', marginTop: 4 }}>
                Passage 1 · Question {current} of {TOTAL_QUESTIONS}
              </b>
            </div>
            <div className="timer">
              {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
            </div>
          </div>
          <div className="workspace">
            <section className="question-box">
              <span className="eyebrow">Passage excerpt</span>
              <h2 style={{ fontSize: 30, margin: '10px 0' }}>Urban trees and public health</h2>
              <p style={{ font: '17px/1.8 Georgia,serif' }}>
                Recent research has shifted the discussion of urban trees beyond aesthetics. Studies suggest that
                access to mature tree cover may reduce heat exposure, encourage physical activity and contribute to
                improved psychological wellbeing. However, the distribution of these benefits is often unequal.
                Neighbourhoods with lower household incomes frequently have fewer established trees and less public
                green space.
              </p>
              <p style={{ font: '17px/1.8 Georgia,serif' }}>
                Researchers caution that correlation does not always demonstrate causation. Even so, a growing body
                of longitudinal evidence has persuaded several city authorities to treat urban forestry as part of
                public-health infrastructure.
              </p>
              <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '30px 0' }} />
              <h3>Which statement best reflects the writer&apos;s view?</h3>
              {OPTIONS.map((option) => (
                <label className="option mock-option" key={option}>
                  <input
                    type="radio"
                    name="mock"
                    checked={responses[current] === option}
                    onChange={() => selectOption(option)}
                  />{' '}
                  {option}
                </label>
              ))}
              <button className="btn btn-coral" id="nextMock" onClick={nextOrSubmit} disabled={submitting}>
                {submitting
                  ? 'Submitting…'
                  : current < TOTAL_QUESTIONS
                    ? 'Save and continue →'
                    : 'Submit mock exam →'}
              </button>
            </section>
            <aside>
              <div className="panel">
                <span className="eyebrow">Question navigator</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 7, marginTop: 15 }}>
                  {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      className={`pill${n === current ? ' active' : ''}`}
                      onClick={() => setCurrent(n)}
                      type="button"
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <label className="check">
                  <input type="checkbox" checked={!!flagged[current]} onChange={toggleFlag} /> Flag this question for
                  review
                </label>
              </div>
              <div className="lecture-note" style={{ marginTop: 18 }}>
                <b>Reconnect protection</b>
                <p style={{ fontSize: 12 }}>
                  Every answer is saved locally before syncing. If your connection drops, your timer and responses
                  remain available.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
