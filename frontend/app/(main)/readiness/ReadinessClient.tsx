'use client';

import { useState } from 'react';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import { functionErrorMessage } from '@/lib/functionError';

function UnavailableNotice() {
  return (
    <main className="section section-soft">
      <div className="shell">
        <div className="panel" style={{ textAlign: 'center', maxWidth: 600, margin: 'auto' }}>
          <span className="eyebrow">Evidence-based forecast</span>
          <h2 style={{ margin: '10px 0' }}>Readiness forecasting isn&apos;t available yet.</h2>
          <p style={{ color: 'var(--muted)' }}>
            This feature is being rolled out gradually. Check back soon, or ask your tutor when it will be enabled
            for your account.
          </p>
        </div>
      </div>
    </main>
  );
}

export function ReadinessClient({ enabled }: { enabled: boolean }) {
  const supabase = useSupabase();
  const toast = useToast();
  const [probability, setProbability] = useState(74);
  const [lowerBand, setLowerBand] = useState<number | null>(6.5);
  const [upperBand, setUpperBand] = useState<number | null>(7.5);
  const [disclaimer, setDisclaimer] = useState(
    'Likely range shown alongside the probability. Confidence improves as you complete more recent four-skill assessments.',
  );
  const [busy, setBusy] = useState(false);
  const [factors, setFactors] = useState<{ consistency: number; practice_factor: number; latest_skill_mean: number } | null>(
    null,
  );

  async function recalculate() {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-readiness', { body: {} });
      if (error) {
        const status = (error as { context?: { response?: { status?: number } } })?.context?.response?.status;
        if (status === 423) {
          toast('Readiness forecasting is not enabled for this pilot.');
        } else {
          toast(await functionErrorMessage(error));
        }
        return;
      }
      setProbability(Math.round(data.probability * 100));
      setLowerBand(data.lower_band);
      setUpperBand(data.upper_band);
      if (data.factors) setFactors(data.factors);
      if (data.disclaimer) setDisclaimer(data.disclaimer);
      toast('Forecast updated from your latest four-skill evidence.');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not refresh forecast');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <span className="eyebrow">Evidence-based forecast</span>
          <h1 style={{ fontSize: 52 }}>Are you ready for test day?</h1>
          <p>
            Forecasts use recent skill scores, consistency and practice evidence. They are guidance—not a guarantee
            of an official result.
          </p>
        </div>
      </header>
      {enabled ? (
        <main className="section section-soft">
          <div className="shell workspace">
            <section className="panel" style={{ textAlign: 'center' }}>
              <span className="eyebrow">Probability of reaching your target band</span>
              <div
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  border: '28px solid var(--aqua)',
                  borderRightColor: 'var(--coral)',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '28px auto',
                }}
              >
                <div>
                  <strong style={{ font: '500 56px Manrope', display: 'block' }} id="readinessProbability">
                    {probability}%
                  </strong>
                  <small style={{ display: 'block' }}>current forecast</small>
                </div>
              </div>
              <h2 style={{ fontSize: 32 }}>On track—with consistent practice still decisive.</h2>
              <p style={{ color: 'var(--muted)' }}>
                Likely range: <b>{lowerBand ?? '—'}–{upperBand ?? '—'}</b>. {disclaimer}
              </p>
              <button className="btn btn-coral" id="refreshReadiness" onClick={recalculate} disabled={busy}>
                {busy ? 'Calculating…' : 'Recalculate forecast →'}
              </button>
            </section>
            <aside>
              <div className="panel">
                <span className="eyebrow">Forecast factors</span>
                <div className="progress-list">
                  <div className="progress-row">
                    <b>Skill level</b>
                    <div className="bar">
                      <span style={{ width: `${Math.min(100, Math.round(((factors?.latest_skill_mean ?? 6.5) / 9) * 100))}%` }} />
                    </div>
                    <strong>{factors ? factors.latest_skill_mean.toFixed(1) : 'Good'}</strong>
                  </div>
                  <div className="progress-row">
                    <b>Consistency</b>
                    <div className="bar">
                      <span style={{ width: `${Math.round((factors?.consistency ?? 0.66) * 100)}%` }} />
                    </div>
                    <strong>{factors ? `${Math.round(factors.consistency * 100)}%` : 'Fair'}</strong>
                  </div>
                  <div className="progress-row">
                    <b>Practice</b>
                    <div className="bar">
                      <span style={{ width: `${Math.round((factors?.practice_factor ?? 0.81) * 100)}%` }} />
                    </div>
                    <strong>{factors ? `${Math.round(factors.practice_factor * 100)}%` : 'Strong'}</strong>
                  </div>
                </div>
              </div>
              <div className="lecture-note" style={{ marginTop: 18 }}>
                <b>Not an official prediction</b>
                <p style={{ fontSize: 12 }}>
                  Test-day conditions, question mix and human examiner judgement affect official scores. AcmeLearn
                  does not guarantee outcomes.
                </p>
              </div>
            </aside>
          </div>
        </main>
      ) : (
        <UnavailableNotice />
      )}
    </>
  );
}
