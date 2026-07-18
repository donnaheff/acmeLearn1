'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

const QUESTION =
  'Some people believe university education should be free for everyone. To what extent do you agree or disagree?';
const DRAFT_KEY = 'acmeWritingDraft';

function wordCount(text: string) {
  return (text.trim().match(/\S+/g) || []).length;
}

export function WritingClient({ profileId }: { profileId: string }) {
  const supabase = useSupabase();
  const toast = useToast();

  const [draft, setDraft] = useState('');
  const [saveState, setSaveState] = useState('Saved locally');
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(2400);

  useEffect(() => {
    setDraft(localStorage.getItem(DRAFT_KEY) || '');
  }, []);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  function handleChange(value: string) {
    setDraft(value);
    localStorage.setItem(DRAFT_KEY, value);
    setSaveState(`Saved locally · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  }

  async function submitWriting() {
    const count = wordCount(draft);
    if (count < 150) {
      toast('Write at least 150 words before submitting.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('writing_submissions').insert({
      user_id: profileId,
      task_type: 'task_2',
      question: QUESTION,
      response: draft,
      word_count: count,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    });
    setSubmitting(false);
    if (error) {
      toast(error.message);
      return;
    }
    toast('Submitted to your tutor for rubric feedback.');
  }

  return (
    <>
      <div className="shell studio-tabs">
        <Link href="/learning">Diagnostic</Link>
        <Link className="active" href="/writing">
          Writing workspace
        </Link>
        <Link href="/speaking">Speaking simulator</Link>
        <Link href="/mock">Mock exam</Link>
      </div>
      <main className="section section-soft" style={{ paddingTop: 36 }}>
        <div className="shell workspace">
          <section className="question-box">
            <span className="eyebrow">Academic Writing Task 2</span>
            <h2 style={{ fontSize: 30, margin: '10px 0' }} id="writingQuestion">
              {QUESTION}
            </h2>
            <p style={{ color: 'var(--muted)' }}>
              Give reasons for your answer and include relevant examples. Write at least 250 words.
            </p>
            <div className="editor-tools">
              <span id="saveState">{saveState}</span>
              <span id="wordCount">{wordCount(draft)} words</span>
            </div>
            <textarea
              id="writingEditor"
              className="editor"
              aria-label="IELTS writing response"
              placeholder="Plan briefly, then begin your essay here…"
              value={draft}
              onChange={(e) => handleChange(e.target.value)}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--line)',
                paddingTop: 15,
              }}
            >
              <span className="timer">
                {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
              </span>
              <button className="btn btn-coral" id="submitWriting" onClick={submitWriting} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit for feedback →'}
              </button>
            </div>
          </section>
          <aside>
            <div className="panel">
              <span className="eyebrow">Examiner criteria</span>
              <h3 style={{ margin: '10px 0 18px' }}>Your feedback will cover</h3>
              <div className="rubric">
                <div className="rubric-row">
                  <span>Task response</span>
                  <b>25%</b>
                </div>
                <div className="rubric-row">
                  <span>Coherence &amp; cohesion</span>
                  <b>25%</b>
                </div>
                <div className="rubric-row">
                  <span>Lexical resource</span>
                  <b>25%</b>
                </div>
                <div className="rubric-row">
                  <span>Grammar range</span>
                  <b>25%</b>
                </div>
              </div>
            </div>
            <div className="lecture-note" style={{ marginTop: 18 }}>
              <span className="eyebrow">Autosave enabled</span>
              <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                Your draft is stored on this device as you type, so a connection interruption will not erase it.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
