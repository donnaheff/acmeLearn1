'use client';

import { useState } from 'react';
import Link from 'next/link';

export function CompareForm() {
  const [result, setResult] = useState<{ plan: string; reason: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const gap = Number(data.get('target')) - Number(data.get('current'));
    const weeks = Number(data.get('weeks'));
    let plan = 'Practice Essentials';
    let reason = 'Your longer timeline and smaller score gap make a self-paced route practical.';
    if (gap >= 1 || weeks <= 8) {
      plan = 'Complete Accelerator';
      reason =
        'Your target-band gap and exam timeline benefit from structured live teaching and marked work.';
    }
    if (gap >= 1.5 || weeks <= 2) {
      plan = 'Pro Coaching';
      reason = 'Your short timeline or larger score gap needs personal tutor attention and rapid feedback.';
    }
    setResult({ plan, reason });
  }

  return (
    <>
      <form
        className="panel"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 15, alignItems: 'end' }}
        onSubmit={handleSubmit}
      >
        <div className="field">
          <label>CURRENT BAND</label>
          <select name="current" defaultValue="6.0">
            <option>5.0</option>
            <option>6.0</option>
            <option>6.5</option>
            <option>7.0</option>
          </select>
        </div>
        <div className="field">
          <label>TARGET BAND</label>
          <select name="target" defaultValue="7.0">
            <option>6.5</option>
            <option>7.0</option>
            <option>7.5</option>
            <option>8.0</option>
          </select>
        </div>
        <div className="field">
          <label>TIME UNTIL EXAM</label>
          <select name="weeks" defaultValue="6">
            <option value="2">Under 3 weeks</option>
            <option value="6">3–8 weeks</option>
            <option value="12">More than 8 weeks</option>
          </select>
        </div>
        <button className="btn btn-coral">Recommend a plan →</button>
      </form>
      <div className={`auth-alert${result ? '' : ' hidden'}`} style={{ marginTop: 18 }}>
        {result && (
          <>
            <strong>Recommended: {result.plan}.</strong> {result.reason}{' '}
            <Link href="/billing" style={{ float: 'right' }}>
              View plan →
            </Link>
          </>
        )}
      </div>
    </>
  );
}
