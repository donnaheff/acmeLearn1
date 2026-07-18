'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export function SupportForm({ signedIn, userId }: { signedIn: boolean; userId: string | null }) {
  const supabase = useSupabase();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const { error } = await supabase.from('support_tickets').insert({
      user_id: userId,
      category: String(data.get('category') || ''),
      subject: String(data.get('subject') || ''),
      body: String(data.get('body') || ''),
    });
    setSubmitting(false);
    if (error) {
      toast(error.message);
      return;
    }
    toast('Ticket created. Support will reply by email.');
    e.currentTarget.reset();
  }

  if (!signedIn) {
    return (
      <div className="auth-alert">
        <strong>Sign in to open a ticket.</strong> Create a free account or sign in so we can track
        your ticket and reply securely.{' '}
        <Link href="/login?required=1&returnTo=/support">Sign in →</Link>
      </div>
    );
  }

  return (
    <form className="staff-form" onSubmit={handleSubmit}>
      <div>
        <label>CATEGORY</label>
        <select name="category" defaultValue="Lecture access">
          <option>Lecture access</option>
          <option>Payment and billing</option>
          <option>Coursework or feedback</option>
          <option>Account and privacy</option>
          <option>Technical problem</option>
        </select>
      </div>
      <div>
        <label>SUBJECT</label>
        <input required name="subject" placeholder="Briefly describe the issue" />
      </div>
      <div>
        <label>DETAILS</label>
        <textarea
          required
          name="body"
          rows={7}
          placeholder="Include what happened and what you expected."
        />
      </div>
      <button className="btn btn-coral" type="submit" disabled={submitting}>
        {submitting ? 'Sending…' : 'Send support ticket →'}
      </button>
    </form>
  );
}
