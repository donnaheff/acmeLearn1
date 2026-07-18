'use client';

import { useState } from 'react';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export function PilotForm() {
  const supabase = useSupabase();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const { error } = await supabase.from('pilot_applications').insert({
      email: String(data.get('email')),
      first_name: String(data.get('first_name') || ''),
      target_band: Number(data.get('target_band')),
      exam_date: data.get('exam_date') || null,
      device_type: String(data.get('device_type') || ''),
      accessibility_needs: String(data.get('accessibility_needs') || '') || null,
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
      <div className="panel staff-form">
        <span className="eyebrow">Application received</span>
        <h3>Thank you.</h3>
        <p>We will email selected learners with dates, pricing and consent information.</p>
      </div>
    );
  }

  return (
    <form className="panel staff-form" onSubmit={handleSubmit}>
      <span className="eyebrow">Pilot application</span>
      <div>
        <label>FIRST NAME</label>
        <input required name="first_name" />
      </div>
      <div>
        <label>EMAIL</label>
        <input required type="email" name="email" />
      </div>
      <div>
        <label>TARGET BAND</label>
        <select name="target_band" defaultValue="7.0">
          <option>6.5</option>
          <option>7.0</option>
          <option>7.5</option>
        </select>
      </div>
      <div>
        <label>EXAM DATE</label>
        <input type="date" name="exam_date" />
      </div>
      <div>
        <label>PRIMARY DEVICE</label>
        <select name="device_type" defaultValue="Android phone">
          <option>Android phone</option>
          <option>iPhone</option>
          <option>Windows laptop</option>
          <option>Mac</option>
        </select>
      </div>
      <div>
        <label>ACCESSIBILITY NEEDS (OPTIONAL)</label>
        <textarea name="accessibility_needs" rows={3} />
      </div>
      <button className="btn btn-coral" disabled={submitting}>
        {submitting ? 'Sending…' : 'Apply for the pilot →'}
      </button>
      <p style={{ fontSize: 11, color: 'var(--muted)' }}>
        Applications are reviewed for fit and cohort balance, not academic ability.
      </p>
    </form>
  );
}
