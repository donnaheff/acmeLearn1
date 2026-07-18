'use client';

import { useState } from 'react';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export type Recording = {
  id: string;
  title: string;
  duration_seconds: number | null;
  available_until: string | null;
  lectures: { courses: { title: string } | null } | null;
};

function WatchButton({ recording }: { recording: Recording }) {
  const supabase = useSupabase();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function watch() {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-recording-url', {
        body: { recording_id: recording.id },
      });
      if (error) throw error;
      if (!data?.url) throw new Error(data?.message || 'Recording unavailable');
      location.href = data.url;
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Recording unavailable');
      setBusy(false);
    }
  }

  return (
    <button className="btn btn-dark cloud-play" onClick={watch} disabled={busy}>
      {busy ? 'Authorising…' : 'Watch securely →'}
    </button>
  );
}

export function RecordingsClient({ recordings }: { recordings: Recording[] }) {
  return (
    <>
      <div className="topbar">
        <div className="shell">
          <span>Private recordings · Enrolled students only</span>
        </div>
      </div>
      <header className="page-hero">
        <div className="shell">
          <span className="eyebrow">Your enrolled courses</span>
          <h1 style={{ fontSize: 52 }}>Lecture recordings.</h1>
          <p>
            Review recent classes securely. Playback links expire after 15 minutes and access ends with your course
            enrolment.
          </p>
        </div>
      </header>
      <main className="section section-soft">
        <div className="shell">
          <div className="panel">
            <div className="section-head" style={{ marginBottom: 8 }}>
              <div>
                <span className="eyebrow">Recent classes</span>
                <h2 style={{ fontSize: 34 }}>Available to watch</h2>
              </div>
              <p>Recordings expire according to each class&apos;s retention window.</p>
            </div>
            <div id="recordingList">
              {recordings.length === 0 && (
                <p>No recordings are available for your enrolled courses yet.</p>
              )}
              {recordings.map((r) => (
                <div className="recording-card" key={r.id}>
                  <div className="recording-thumb">▶</div>
                  <div>
                    <span className="eyebrow">{r.lectures?.courses?.title}</span>
                    <h3>{r.title}</h3>
                    <p>
                      {Math.round((r.duration_seconds || 0) / 60)} minutes · Available until{' '}
                      {r.available_until ? new Date(r.available_until).toLocaleDateString() : 'course end'}
                    </p>
                  </div>
                  <WatchButton recording={r} />
                </div>
              ))}
            </div>
          </div>
          <div className="auth-alert" style={{ marginTop: 22 }}>
            <strong>Private course material.</strong> Recordings are streamed through expiring URLs and must not be
            downloaded, copied or shared.
          </div>
        </div>
      </main>
    </>
  );
}
