'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import { functionErrorMessage } from '@/lib/functionError';

const ANSWER_KEY: Record<string, string> = { q1: 'B', q2: 'C', q3: 'A', q4: 'B' };

export function LearningClient({ signedIn, profileId }: { signedIn: boolean; profileId: string | null }) {
  const supabase = useSupabase();
  const toast = useToast();
  const [result, setResult] = useState<{ band: string; correct: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const responses = Object.fromEntries(form.entries()) as Record<string, string>;
    const correct = Object.entries(ANSWER_KEY).filter(([k, v]) => responses[k] === v).length;
    const band = (5.5 + correct * 0.5).toFixed(1);
    setResult({ band, correct });

    if (signedIn && profileId) {
      try {
        const { error } = await supabase.from('diagnostic_attempts').insert({
          user_id: profileId,
          completed_at: new Date().toISOString(),
          responses,
          scores: { reading: Number(band) },
        });
        if (error) throw error;
        const { error: recError } = await supabase.functions.invoke('generate-recommendations', { body: {} });
        if (recError) throw recError;
      } catch (err) {
        toast(await functionErrorMessage(err));
      }
    }
    setSubmitting(false);
  }

  return (
    <>
      <header className="page-hero" style={{ padding: '52px 0' }}>
        <div className="shell">
          <span className="eyebrow">Adaptive onboarding</span>
          <h1 style={{ fontSize: 50 }}>Find your study starting point.</h1>
          <p>
            Complete this short diagnostic, then add writing and speaking samples for a criterion-level study plan.
            This short activity is not an official IELTS score prediction.
          </p>
        </div>
      </header>
      <div className="shell studio-tabs">
        <Link className="active" href="/learning">
          Diagnostic
        </Link>
        <Link href="/writing">Writing workspace</Link>
        <Link href="/speaking">Speaking simulator</Link>
        <Link href="/mock">Mock exam</Link>
      </div>
      <main className="section section-soft">
        <div className="shell workspace">
          <form id="diagnosticForm" className="question-box" onSubmit={handleSubmit}>
            <span className="eyebrow">Reading &amp; language · 4 questions</span>
            <h2 style={{ fontSize: 32, margin: '10px 0 25px' }}>Quick diagnostic</h2>

            <h3>1. The report was praised for being both concise and ___.</h3>
            <label className="option">
              <input required type="radio" name="q1" value="A" /> lengthened
            </label>
            <label className="option">
              <input type="radio" name="q1" value="B" /> comprehensive
            </label>
            <label className="option">
              <input type="radio" name="q1" value="C" /> doubtful
            </label>

            <h3 style={{ marginTop: 28 }}>2. &ldquo;The results were inconclusive.&rdquo; This means they…</h3>
            <label className="option">
              <input required type="radio" name="q2" value="A" /> proved the hypothesis
            </label>
            <label className="option">
              <input type="radio" name="q2" value="B" /> were incorrectly measured
            </label>
            <label className="option">
              <input type="radio" name="q2" value="C" /> did not support a firm conclusion
            </label>

            <h3 style={{ marginTop: 28 }}>3. Choose the grammatically correct sentence.</h3>
            <label className="option">
              <input required type="radio" name="q3" value="A" /> The number of applicants has increased.
            </label>
            <label className="option">
              <input type="radio" name="q3" value="B" /> The number of applicants have increased.
            </label>

            <h3 style={{ marginTop: 28 }}>4. The best formal alternative to &ldquo;a lot of&rdquo; is…</h3>
            <label className="option">
              <input required type="radio" name="q4" value="A" /> heaps of
            </label>
            <label className="option">
              <input type="radio" name="q4" value="B" /> a substantial amount of
            </label>

            <button className="btn btn-coral" type="submit" style={{ marginTop: 24 }} disabled={submitting}>
              {submitting ? 'Scoring…' : 'Show my study-level indication →'}
            </button>
          </form>
          <aside>
            <div id="diagnosticResult" className={`panel${result ? '' : ' hidden'}`}>
              {result && (
                <>
                  <span className="eyebrow">Practice-level indication</span>
                  <h2>Around Band {result.band}</h2>
                  <p>
                    This is not an official IELTS prediction. Your first plan prioritises writing structure and
                    reading pace. Complete the speaking and writing samples for a four-skill estimate.
                  </p>
                  <Link className="btn btn-coral" href={signedIn ? '/writing' : '/signup'}>
                    {signedIn ? 'Continue to writing' : 'Save my result and continue'} →
                  </Link>
                </>
              )}
            </div>
            <div className="panel">
              <span className="eyebrow">Your full baseline</span>
              <div className="phase-step">
                <b>1</b>
                <span>
                  <strong>Reading diagnostic</strong>
                  <small style={{ display: 'block', color: 'var(--muted)' }}>About 5 minutes</small>
                </span>
              </div>
              <div className="phase-step">
                <b>2</b>
                <span>
                  <strong>Writing sample</strong>
                  <small style={{ display: 'block', color: 'var(--muted)' }}>40 minutes</small>
                </span>
              </div>
              <div className="phase-step">
                <b>3</b>
                <span>
                  <strong>Speaking sample</strong>
                  <small style={{ display: 'block', color: 'var(--muted)' }}>2 minutes</small>
                </span>
              </div>
              <div className="phase-step">
                <b>4</b>
                <span>
                  <strong>Personal study plan</strong>
                  <small style={{ display: 'block', color: 'var(--muted)' }}>Generated instantly</small>
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
