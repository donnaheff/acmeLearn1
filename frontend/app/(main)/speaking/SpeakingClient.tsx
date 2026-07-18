'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

const QUESTION = 'Describe a skill you would like to learn.';

export function SpeakingClient({ profileId }: { profileId: string }) {
  const supabase = useSupabase();
  const toast = useToast();

  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('Your microphone is only used after you press record.');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [prepSeconds, setPrepSeconds] = useState(60);

  useEffect(() => {
    const id = setInterval(() => setPrepSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const blobRef = useRef<Blob | null>(null);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        blobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
        setStatus(`Recorded · ${Math.round(blob.size / 1024)} KB · private until submitted`);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setStatus('Recording… Speak naturally.');
    } catch {
      toast('Microphone permission is required.');
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  async function submitSpeech() {
    if (!blobRef.current) {
      toast('Record and preview a response first.');
      return;
    }
    if (!consent) {
      toast('Recording consent is required before upload.');
      return;
    }
    setSubmitting(true);
    try {
      const path = `${profileId}/${crypto.randomUUID()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('speaking-attempts')
        .upload(path, blobRef.current, { contentType: 'audio/webm' });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('speaking_attempts').insert({
        user_id: profileId,
        part: 2,
        question: QUESTION,
        audio_path: path,
        status: 'submitted',
      });
      if (insertError) throw insertError;
      toast('Speaking response submitted privately to your tutor.');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="shell studio-tabs">
        <Link href="/learning">Diagnostic</Link>
        <Link href="/writing">Writing workspace</Link>
        <Link className="active" href="/speaking">
          Speaking simulator
        </Link>
        <Link href="/mock">Mock exam</Link>
      </div>
      <main className="section section-soft">
        <div className="shell workspace">
          <section className="question-box">
            <span className="eyebrow">Speaking Part 2 · Cue card</span>
            <h1 style={{ fontSize: 42, margin: '15px 0' }}>{QUESTION}</h1>
            <p>You should say:</p>
            <ul style={{ lineHeight: 2, color: 'var(--muted)' }}>
              <li>what the skill is</li>
              <li>why you want to learn it</li>
              <li>how you would learn it</li>
              <li>and explain how it would help you</li>
            </ul>
            <div style={{ background: 'var(--paper)', padding: 22, margin: '25px 0' }}>
              <small>PREPARATION TIME</small>
              <div className="timer">
                {String(Math.floor(prepSeconds / 60)).padStart(2, '0')}:{String(prepSeconds % 60).padStart(2, '0')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-coral" id="recordSpeech" onClick={startRecording} disabled={recording}>
                ● Start recording
              </button>
              <button className="btn btn-outline" id="stopSpeech" onClick={stopRecording} disabled={!recording}>
                ■ Stop
              </button>
            </div>
            <p id="speechStatus" style={{ color: 'var(--muted)', fontSize: 13 }}>
              {status}
            </p>
            {audioUrl && (
              <audio id="speechPlayback" controls style={{ width: '100%' }} src={audioUrl} />
            )}
          </section>
          <aside>
            <div className="panel">
              <span className="eyebrow">Private by default</span>
              <h3 style={{ margin: '10px 0' }}>Recording controls</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                Preview your response before submission. Submitted audio is stored privately and available only to
                you and your assigned tutor.
              </p>
              <label className="check">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> I
                consent to this speaking recording being stored for feedback.
              </label>
              <button className="btn btn-dark" id="submitSpeech" style={{ width: '100%' }} onClick={submitSpeech} disabled={submitting}>
                {submitting ? 'Uploading privately…' : 'Submit to tutor →'}
              </button>
            </div>
            <div className="panel" style={{ marginTop: 18 }}>
              <h3>Feedback areas</h3>
              <div className="rubric">
                <div className="rubric-row">
                  <span>Fluency</span>
                  <b>—</b>
                </div>
                <div className="rubric-row">
                  <span>Vocabulary</span>
                  <b>—</b>
                </div>
                <div className="rubric-row">
                  <span>Grammar</span>
                  <b>—</b>
                </div>
                <div className="rubric-row">
                  <span>Pronunciation</span>
                  <b>—</b>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
