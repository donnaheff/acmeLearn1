'use client';

import { useState } from 'react';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import { functionErrorMessage } from '@/lib/functionError';

export type Lecture = {
  id: string;
  title: string;
  starts_at: string;
  duration_minutes: number;
  platform: string;
  access_opens_at: string;
  access_closes_at: string;
  courses: { title: string } | null;
  profiles: { first_name: string; last_name: string } | null;
};

function isOpen(l: Lecture) {
  return new Date(l.access_opens_at).getTime() <= Date.now();
}

function JoinButton({ lecture, wide }: { lecture: Lecture; wide?: boolean }) {
  const supabase = useSupabase();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function join() {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-lecture-access', {
        body: { lecture_id: lecture.id },
      });
      if (error) throw error;
      if (data?.join_url) {
        location.href = data.join_url;
      } else {
        throw new Error(data?.message || 'Access unavailable');
      }
    } catch (e) {
      toast(await functionErrorMessage(e));
      setBusy(false);
    }
  }

  return (
    <button
      className="btn btn-coral"
      style={wide ? { width: '100%' } : undefined}
      onClick={join}
      disabled={busy}
    >
      {busy ? 'Verifying enrolment…' : wide ? 'Join registered class →' : 'Join lecture →'}
    </button>
  );
}

function CalendarButton() {
  function addToCalendar() {
    const start = new Date();
    start.setHours(18, 30, 0, 0);
    const end = new Date(start.getTime() + 75 * 60000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const body = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nDTSTART:${fmt(start)}\r\nDTEND:${fmt(end)}\r\nSUMMARY:AcmeLearn IELTS lecture\r\nDESCRIPTION:Sign in to AcmeLearn for your secure link.\r\nEND:VEVENT\r\nEND:VCALENDAR`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
    a.download = 'acmelearn-lecture.ics';
    a.click();
  }

  return (
    <button className="btn btn-outline" id="calendarButton" style={{ width: '100%', marginTop: 9 }} onClick={addToCalendar}>
      Add to calendar
    </button>
  );
}

export function LecturesClient({ lectures }: { lectures: Lecture[] }) {
  const next = lectures[0];

  return (
    <>
      <header className="lecture-hero">
        <div className="shell">
          <span className="eyebrow">Registered student area</span>
          <h1 style={{ fontSize: 54, margin: '12px 0 18px' }}>Live lecture room.</h1>
          <p>
            Your private schedule for tutor-led classes. Meeting details are released only to signed-in, enrolled
            students and should not be shared.
          </p>
        </div>
      </header>
      <main className="section section-soft">
        <div className="shell">
          <div className="lecture-grid">
            <section>
              <div className="section-head" style={{ marginBottom: 25 }}>
                <div>
                  <span className="eyebrow">Your schedule</span>
                  <h2 style={{ fontSize: 36 }}>Upcoming lectures</h2>
                </div>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>Times shown locally</span>
              </div>
              <div id="lectureList">
                {lectures.length === 0 && <p style={{ color: 'var(--muted)' }}>No upcoming lectures scheduled.</p>}
                {lectures.map((l) => {
                  const d = new Date(l.starts_at);
                  const open = isOpen(l);
                  return (
                    <article className="session-card" key={l.id}>
                      <div className="session-date">
                        {d.toLocaleDateString([], { weekday: 'short' })}
                        <strong>{d.getDate()}</strong>
                        {d.toLocaleDateString([], { month: 'short' })} ·{' '}
                        {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div>
                        <span className="platform">
                          {l.platform} · {open ? 'Access open' : 'Upcoming'}
                        </span>
                        <h3>{l.title}</h3>
                        <p>
                          {l.profiles?.first_name} {l.profiles?.last_name} · {l.courses?.title} ·{' '}
                          {l.duration_minutes} minutes
                        </p>
                      </div>
                      {open ? (
                        <JoinButton lecture={l} />
                      ) : (
                        <div className="locked-meeting">Link available 15 min before class</div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
            <aside>
              <div className="lecture-note">
                <span className="eyebrow">Secure attendance</span>
                <h3 style={{ marginTop: 10 }}>How access works</h3>
                <ul>
                  <li>Use your registered AcmeLearn account.</li>
                  <li>Join links appear shortly before class.</li>
                  <li>Your display name must match your profile.</li>
                  <li>The tutor admits enrolled students only.</li>
                  <li>Do not forward private meeting links.</li>
                </ul>
              </div>
              {next && (
                <div className="panel" style={{ marginTop: 20 }}>
                  <span className="eyebrow">Next lecture</span>
                  <h3 style={{ margin: '10px 0' }}>{next.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {new Date(next.starts_at).toLocaleString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' })} ·{' '}
                    {next.platform}
                  </p>
                  {isOpen(next) && <JoinButton lecture={next} wide />}
                  <CalendarButton />
                </div>
              )}
              <div className="panel" style={{ marginTop: 20 }}>
                <h3>Need help joining?</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                  Contact student support at least 20 minutes before class.
                </p>
                <a href="mailto:support@acmelearn.example" className="eyebrow">
                  Contact support →
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
