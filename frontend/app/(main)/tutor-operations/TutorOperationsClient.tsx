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

export function EditAvailabilityButton({
  id,
  startsAt,
  endsAt,
}: {
  id: string;
  startsAt: string;
  endsAt: string;
}) {
  const supabase = useSupabase();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function edit() {
    const newStart = prompt('New start time (HH:MM, 24-hour):', startsAt.slice(0, 5));
    if (newStart === null) return;
    const newEnd = prompt('New end time (HH:MM, 24-hour):', endsAt.slice(0, 5));
    if (newEnd === null) return;
    if (!/^\d{2}:\d{2}$/.test(newStart) || !/^\d{2}:\d{2}$/.test(newEnd)) {
      toast('Enter times as HH:MM, e.g. 14:30.');
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from('tutor_availability')
      .update({ starts_at: newStart, ends_at: newEnd })
      .eq('id', id);
    setBusy(false);
    if (error) {
      toast(error.message);
      return;
    }
    toast('Availability window updated.');
    router.refresh();
  }

  return (
    <button className="pill" disabled={busy} onClick={edit}>
      {busy ? 'Saving…' : 'Edit'}
    </button>
  );
}

export function CohortWaitlistButton({ cohortId, courseId }: { cohortId: string; courseId: string }) {
  const supabase = useSupabase();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function addToWaitlist() {
    const email = prompt('Student email to add to this cohort (waitlisted automatically if full):');
    if (!email) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('manage-enrollment', {
      body: { email, course_id: courseId, cohort_id: cohortId },
    });
    setBusy(false);
    if (error) {
      toast(error.message);
      return;
    }
    toast(data?.waitlisted ? `Waitlisted at position ${data.position}.` : 'Student enrolled directly — cohort had room.');
    router.refresh();
  }

  return (
    <button className="btn btn-outline" disabled={busy} onClick={addToWaitlist}>
      {busy ? 'Adding…' : '+ Waitlist'}
    </button>
  );
}
