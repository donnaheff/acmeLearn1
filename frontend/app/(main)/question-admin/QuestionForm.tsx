'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import type { Profile } from '@/lib/session';

export function QuestionForm({ profile }: { profile: Profile }) {
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
      skill: String(data.get('skill')),
      question_type: String(data.get('question_type')),
      prompt: { text: String(data.get('prompt')) },
      answer: { text: String(data.get('answer')) },
      difficulty: Number(data.get('difficulty')),
      license_source: String(data.get('license_source')),
      created_by: profile.id,
      status: 'draft',
    };
    const { error } = await supabase.from('question_items').insert(payload);
    if (error) {
      toast(error.message);
    } else {
      toast('Question saved as a draft for independent review.');
      formRef.current?.reset();
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <form ref={formRef} id="questionForm" className="panel staff-form" onSubmit={handleSubmit}>
      <span className="eyebrow">New item</span>
      <h3>Add a reviewed question</h3>
      <div>
        <label>SKILL</label>
        <select name="skill" defaultValue="reading">
          <option value="reading">reading</option>
          <option value="listening">listening</option>
          <option value="writing">writing</option>
          <option value="speaking">speaking</option>
        </select>
      </div>
      <div>
        <label>QUESTION TYPE</label>
        <input required name="question_type" />
      </div>
      <div>
        <label>PROMPT</label>
        <textarea required name="prompt" rows={5} />
      </div>
      <div>
        <label>ANSWER / RUBRIC</label>
        <textarea required name="answer" rows={3} />
      </div>
      <div>
        <label>DIFFICULTY (0–1)</label>
        <input name="difficulty" type="number" min={0} max={1} step={0.01} defaultValue={0.5} />
      </div>
      <div>
        <label>LICENSE SOURCE</label>
        <input required name="license_source" placeholder="Original / commissioned / licensed source" />
      </div>
      <button className="btn btn-coral" type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save for review →'}
      </button>
    </form>
  );
}
