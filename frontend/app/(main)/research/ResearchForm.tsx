'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export function ResearchForm({ userId }: { userId: string | null }) {
  const supabase = useSupabase();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const { error } = await supabase.from('usability_feedback').insert({
      journey: String(data.get('journey') || ''),
      rating: Number(data.get('rating')),
      difficulty: String(data.get('difficulty') || '') || null,
      comments: String(data.get('comments') || '') || null,
      consent_followup: data.get('consent_followup') === 'on',
      user_id: userId,
    });
    setSubmitting(false);
    if (error) {
      toast(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="panel staff-form" style={{ maxWidth: 700, margin: 'auto' }}>
        <span className="eyebrow">Thank you</span>
        <h2>Your feedback was recorded.</h2>
        <p>It will be reviewed with other journey results before the next product release.</p>
        <Link className="btn btn-dark" href="/">
          Return home
        </Link>
      </div>
    );
  }

  return (
    <form
      className="panel staff-form"
      style={{ maxWidth: 700, margin: 'auto' }}
      onSubmit={handleSubmit}
    >
      <div>
        <label>JOURNEY TESTED</label>
        <select name="journey" defaultValue="Homepage to diagnostic">
          <option>Homepage to diagnostic</option>
          <option>Registration and sign-in</option>
          <option>Course comparison and payment</option>
          <option>Lecture access</option>
          <option>Assignment submission</option>
        </select>
      </div>
      <div>
        <label>HOW EASY WAS IT?</label>
        <select name="rating" defaultValue="5">
          <option value="5">5 — Very easy</option>
          <option value="4">4 — Easy</option>
          <option value="3">3 — Neither easy nor difficult</option>
          <option value="2">2 — Difficult</option>
          <option value="1">1 — Very difficult</option>
        </select>
      </div>
      <div>
        <label>WHERE DID YOU HESITATE OR GET STUCK?</label>
        <input name="difficulty" placeholder="Page, button or step" />
      </div>
      <div>
        <label>WHAT SHOULD WE CHANGE?</label>
        <textarea name="comments" rows={6} />
      </div>
      <label className="check">
        <input type="checkbox" name="consent_followup" /> AcmeLearn may contact me for a 20-minute
        follow-up interview.
      </label>
      <button className="btn btn-coral" disabled={submitting}>
        {submitting ? 'Sending…' : 'Submit feedback →'}
      </button>
    </form>
  );
}
