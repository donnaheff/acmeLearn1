'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

const QUESTION = 'Describe a skill you would like to learn.';

type Attempt = {
  id: string;
  question: string;
  status: string;
  transcript: string | null;
  ai_overall_band: number | null;
  ai_criterion_scores: Record<string, number> | null;
  ai_feedback: string | null;
};

export function SpeakingClient({ profileId }: { profileId: string }) {
  const supabase = useSupabase();
  const toast = useToast();

  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('Your microphone is only used after you press record.');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [prepSeconds, setPrepSeconds] = useState(60);
  const [transcript, setTranscript] = useState('');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [transcriptDrafts, setTranscriptDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const id = setInterval(() => setPrepSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const blobRef = useRef<Blob | null>(null);

  async function loadAttempts() {
    const { data } = await supabase
      .from('speaking_attempts')
      .select('id, question, status, transcript, ai_overall_band, ai_criterion_scores, ai_feedback')
      .eq('user_id', profileId)
      .order('created_at', { ascending: false })
      .limit(10);
    setAttempts((data as Attempt[]) ?? []);
  }

  useEffect(() => {
    loadAttempts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      const { data: inserted, error: insertError } = await supabase
        .from('speaking_attempts')
        .insert({
          user_id: profileId,
          part: 2,
          question: QUESTION,
          audio_path: path,
          transcript: transcript.trim() || null,
          status: 'submitted',
        })
        .select('id')
        .single();
      if (insertError) throw insertError;
      toast('Speaking response submitted privately to your tutor.');
      setTranscript('');
      setAudioUrl(null);
      blobRef.current = null;
      loadAttempts();
      if (!transcript.trim() && inserted) {
        transcribeAutomatically(inserted.id, true);
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function saveTranscript(id: string) {
    const value = transcriptDrafts[id];
    if (!value?.trim()) {
      toast('Type what was said first.');
      return;
    }
    const { error } = await supabase.from('speaking_attempts').update({ transcript: value.trim() }).eq('id', id);
    if (error) {
      toast(error.message);
      return;
    }
    toast('Transcript saved.');
    loadAttempts();
  }

  async function transcribeAutomatically(id: string, silent = false) {
    if (!silent) setAnalyzingId(id);
    const { error } = await supabase.functions.invoke('transcribe-speaking-attempt', { body: { attempt_id: id } });
    if (!silent) setAnalyzingId(null);
    if (error) {
      if (!silent) toast('Automatic transcription unavailable — type a transcript instead, or check OPENAI_API_KEY is configured.');
      return;
    }
    if (!silent) toast('Transcribed — ready for instant AI feedback.');
    loadAttempts();
  }

  async function getAiFeedback(id: string) {
    setAnalyzingId(id);
    const { error } = await supabase.functions.invoke('analyze-speaking-attempt', {
      body: { attempt_id: id },
    });
    setAnalyzingId(null);
    if (error) {
      toast('Could not generate feedback — add a transcript, or check ANTHROPIC_API_KEY is configured.');
      return;
    }
    toast('Instant AI feedback ready below.');
    loadAttempts();
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
            {audioUrl && (
              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700 }}>
                  TYPE A TRANSCRIPT (optional — leave blank and we&apos;ll transcribe it automatically after
                  submission)
                </label>
                <textarea
                  rows={3}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Type roughly what you said, or leave blank for automatic transcription…"
                />
              </div>
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
        {attempts.length > 0 && (
          <div className="shell" style={{ marginTop: 30 }}>
            <div className="panel">
              <div className="section-head" style={{ marginBottom: 12 }}>
                <h3>Your attempts</h3>
              </div>
              {attempts.map((a) => (
                <div key={a.id} className="panel" style={{ marginBottom: 14, background: 'var(--paper)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div>
                      <strong>{a.question}</strong>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        <span className={`status${a.status !== 'marked' ? ' warn' : ''}`}>{a.status}</span>
                      </div>
                    </div>
                    {a.ai_overall_band == null && a.transcript && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={analyzingId === a.id}
                        onClick={() => getAiFeedback(a.id)}
                      >
                        {analyzingId === a.id ? 'Analysing…' : 'Get instant AI feedback'}
                      </button>
                    )}
                  </div>
                  {!a.transcript && a.ai_overall_band == null && (
                    <div style={{ marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                      <label style={{ fontSize: 12, fontWeight: 700 }}>
                        TRANSCRIBE TO UNLOCK INSTANT AI FEEDBACK
                      </label>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ marginBottom: 10 }}
                        disabled={analyzingId === a.id}
                        onClick={() => transcribeAutomatically(a.id)}
                      >
                        {analyzingId === a.id ? 'Transcribing…' : 'Transcribe automatically'}
                      </button>
                      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 8px' }}>Or type it yourself:</p>
                      <textarea
                        rows={2}
                        value={transcriptDrafts[a.id] ?? ''}
                        onChange={(e) => setTranscriptDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
                        placeholder="Type roughly what you said…"
                      />
                      <button type="button" className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => saveTranscript(a.id)}>
                        Save transcript
                      </button>
                    </div>
                  )}
                  {a.ai_overall_band != null && (
                    <div style={{ marginTop: 14, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
                      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 10 }}>
                        <span>
                          <b>AI estimated band: {a.ai_overall_band}</b>
                        </span>
                        {a.ai_criterion_scores &&
                          Object.entries(a.ai_criterion_scores).map(([k, v]) => (
                            <span key={k} style={{ fontSize: 12, color: 'var(--muted)' }}>
                              {k.replace(/_/g, ' ')}: {v}
                            </span>
                          ))}
                      </div>
                      <p style={{ whiteSpace: 'pre-line', fontSize: 14 }}>{a.ai_feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
