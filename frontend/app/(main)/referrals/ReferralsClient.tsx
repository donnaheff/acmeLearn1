'use client';

import { useState } from 'react';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export type Referral = {
  id: string;
  code: string;
  status: string;
  reward_minor: number | null;
  created_at: string;
};

export function ReferralsClient({
  profileId,
  referrals: initial,
  courses,
}: {
  profileId: string;
  referrals: Referral[];
  courses: Array<{ id: string; title: string }>;
}) {
  const supabase = useSupabase();
  const toast = useToast();
  const [referrals, setReferrals] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [statement, setStatement] = useState('');
  const [submittingScholarship, setSubmittingScholarship] = useState(false);

  const referral = referrals[0];

  async function generateCode() {
    setCreating(true);
    const code = crypto.randomUUID().slice(0, 8).toUpperCase();
    const { data, error } = await supabase
      .from('referrals')
      .insert({ referrer_id: profileId, code })
      .select('*')
      .single();
    setCreating(false);
    if (error) {
      toast(error.message);
      return;
    }
    setReferrals([data as Referral, ...referrals]);
    toast('Referral code generated.');
  }

  function copyCode() {
    if (referral) navigator.clipboard?.writeText(referral.code);
    toast('Referral code copied.');
  }

  async function submitScholarship(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmittingScholarship(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.from('scholarship_applications').insert({
      user_id: profileId,
      course_id: form.get('course_id'),
      statement: form.get('statement'),
      status: 'pending',
    });
    setSubmittingScholarship(false);
    if (error) {
      toast(error.message);
      return;
    }
    toast('Scholarship application submitted for review.');
    setStatement('');
    e.currentTarget.reset();
  }

  return (
    <>
      <header className="page-hero" style={{ padding: '45px 0' }}>
        <div className="shell">
          <span className="eyebrow">Access and rewards</span>
          <h1 style={{ fontSize: 48 }}>Refer a learner or request support.</h1>
        </div>
      </header>
      <main className="section section-soft">
        <div className="shell promo-grid">
          <section className="promo-main">
            <span className="eyebrow">Your referral code</span>
            {referral ? (
              <>
                <h2>{referral.code}</h2>
                <p>
                  Share your code. A reward becomes eligible only after your friend completes a verified payment
                  and the refund period ends. Status: <b>{referral.status}</b>
                </p>
                <button className="btn btn-coral" onClick={copyCode}>
                  Copy referral code
                </button>
              </>
            ) : (
              <>
                <h2>You don&apos;t have a referral code yet.</h2>
                <p>Generate your own code to start sharing AcmeLearn with friends.</p>
                <button className="btn btn-coral" onClick={generateCode} disabled={creating}>
                  {creating ? 'Generating…' : 'Generate my referral link'}
                </button>
              </>
            )}
            <p style={{ fontSize: 11 }}>
              Self-referrals, duplicate payment instruments and misleading promotions are prohibited.
            </p>
          </section>
          <aside className="panel">
            <span className="eyebrow">Scholarship support</span>
            <h3 style={{ margin: '8px 0' }}>Apply for reduced fees</h3>
            <form id="scholarshipForm" className="staff-form" onSubmit={submitScholarship}>
              <div>
                <label>COURSE</label>
                <select name="course_id">
                  {courses.length === 0 && <option value="">Select a course</option>}
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>YOUR CIRCUMSTANCES AND GOAL</label>
                <textarea
                  required
                  name="statement"
                  rows={7}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                />
              </div>
              <button className="btn btn-dark" type="submit" disabled={submittingScholarship}>
                {submittingScholarship ? 'Submitting…' : 'Submit application →'}
              </button>
            </form>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>
              Applications are assessed consistently. A scholarship does not affect academic evaluation.
            </p>
          </aside>
        </div>
      </main>
    </>
  );
}
