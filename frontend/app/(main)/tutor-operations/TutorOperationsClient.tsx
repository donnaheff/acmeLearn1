'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import type { Profile } from '@/lib/session';

export function BlockTimeForm({ profile }: { profile: Profile }) {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const payload = {
      tutor_id: profile.id,
      starts_at: new Date(String(data.get('starts_at'))).toISOString(),
      ends_at: new Date(String(data.get('ends_at'))).toISOString(),
      reason: String(data.get('reason') || ''),
    };
    const { error } = await supabase.from('tutor_blocks').insert(payload);
    if (error) {
      toast(error.message);
    } else {
      toast('Calendar block added and booking availability updated.');
      formRef.current?.reset();
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <form ref={formRef} id="blockTimeForm" className="staff-form" onSubmit={handleSubmit}>
      <div>
        <label>START</label>
        <input required type="datetime-local" name="starts_at" />
      </div>
      <div>
        <label>END</label>
        <input required type="datetime-local" name="ends_at" />
      </div>
      <div>
        <label>REASON</label>
        <input name="reason" placeholder="Private or internal note" />
      </div>
      <button className="btn btn-dark" type="submit" disabled={submitting}>
        {submitting ? 'Blocking…' : 'Block calendar'}
      </button>
    </form>
  );
}

export function ClassChangeButton() {
  const toast = useToast();
  return (
    <button
      className="btn btn-coral"
      id="classChange"
      onClick={() => toast('Class-change workflow opened: choose reschedule, self-study replacement or service credit.')}
    >
      Manage class change
    </button>
  );
}
