'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import { functionErrorMessage } from '@/lib/functionError';

type Course = { id: string; title: string };

export function AdminClient({ courses }: { courses: Course[] }) {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const courseSelectRef = useRef<HTMLSelectElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const body = {
      course_id: String(data.get('course_id')),
      title: String(data.get('title')),
      description: String(data.get('description') || ''),
      starts_at: new Date(String(data.get('starts_at'))).toISOString(),
      duration_minutes: Number(data.get('duration_minutes')),
    };
    const { error } = await supabase.functions.invoke('create-zoom-meeting', { body });
    if (error) {
      toast(await functionErrorMessage(error));
    } else {
      toast('Zoom lecture created and reminders queued.');
      formRef.current?.reset();
      router.refresh();
    }
    setSubmitting(false);
  }

  async function handleEnrol() {
    const email = prompt('Registered student email');
    if (!email) return;
    const course_id = courseSelectRef.current?.value;
    if (!course_id) {
      toast('Create or select a course first.');
      return;
    }
    setEnrolling(true);
    const { error } = await supabase.functions.invoke('manage-enrollment', {
      body: { email, course_id, status: 'active' },
    });
    if (error) {
      toast(await functionErrorMessage(error));
    } else {
      toast(`${email} is now enrolled.`);
      router.refresh();
    }
    setEnrolling(false);
  }

  return (
    <>
      <div className="panel" style={{ marginTop: 22 }}>
        <div className="section-head" style={{ marginBottom: 12 }}>
          <h3>Student access</h3>
          <button className="btn btn-dark" id="enrolButton" onClick={handleEnrol} disabled={enrolling} type="button">
            {enrolling ? 'Enrolling…' : 'Enrol student'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>Real recent enrolments are listed below.</p>
      </div>
      <form ref={formRef} id="lectureForm" className="staff-form" onSubmit={handleSubmit}>
        <span className="eyebrow">Zoom integration</span>
        <h3 style={{ margin: '9px 0 20px' }}>Schedule a secure lecture</h3>
        <div>
          <label>COURSE</label>
          <select required name="course_id" id="courseSelect" ref={courseSelectRef}>
            {courses.length ? (
              courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))
            ) : (
              <option value="">No active courses</option>
            )}
          </select>
        </div>
        <div>
          <label>LECTURE TITLE</label>
          <input required name="title" placeholder="e.g. Writing Task 2 clinic" />
        </div>
        <div>
          <label>START DATE &amp; TIME</label>
          <input required name="starts_at" type="datetime-local" />
        </div>
        <div>
          <label>DURATION</label>
          <select name="duration_minutes" defaultValue="60">
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="75">75 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </div>
        <div>
          <label>DESCRIPTION</label>
          <textarea name="description" rows={3} placeholder="What students will learn" />
        </div>
        <button className="btn btn-coral" type="submit" disabled={submitting}>
          {submitting ? 'Creating secure Zoom room…' : 'Create Zoom lecture →'}
        </button>
      </form>
      <p style={{ fontSize: 11, color: 'var(--muted)' }}>
        Waiting room, registration, cloud recording and reminders are configured automatically.
      </p>
    </>
  );
}
