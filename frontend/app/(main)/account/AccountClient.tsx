'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import type { Profile } from '@/lib/session';

const TIMEZONES = ['Africa/Lagos', 'Africa/Accra', 'Europe/London', 'America/New_York'];
const TARGET_BANDS = ['6.0', '6.5', '7.0', '7.5', '8.0'];

export function AccountClient({ profile, referralsEnabled }: { profile: Profile; referralsEnabled: boolean }) {
  const supabase = useSupabase();
  const toast = useToast();
  const [firstName, setFirstName] = useState(profile.first_name || '');
  const [lastName, setLastName] = useState(profile.last_name || '');
  const [timezone, setTimezone] = useState(profile.timezone || 'Africa/Lagos');
  const [targetBand, setTargetBand] = useState(String(profile.target_band ?? '7.0'));
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        timezone,
        target_band: Number(targetBand),
      })
      .eq('id', profile.id);
    setSaving(false);
    toast(error ? error.message : 'Profile saved.');
  }

  const tzAbbrev = timezone.split('/').pop() || timezone;

  return (
    <>
      <header className="page-hero" style={{ padding: '48px 0' }}>
        <div className="shell">
          <span className="eyebrow">Account</span>
          <h1 style={{ fontSize: 50 }}>Your profile and settings.</h1>
          <p>Security, communication, billing and privacy controls in one place.</p>
        </div>
      </header>
      <main className="section section-soft">
        <div className="shell">
          <div className="staff-metrics">
            <Link className="metric" href="/security">
              <span className="eyebrow">Security</span>
              <strong style={{ fontSize: 24 }}>MFA &amp; devices</strong>
              <small>Password, sessions and authenticator</small>
            </Link>
            <Link className="metric" href="/notifications">
              <span className="eyebrow">Communication</span>
              <strong style={{ fontSize: 24 }}>Preferences</strong>
              <small>Email, WhatsApp and quiet hours</small>
            </Link>
            <Link className="metric" href="/receipts">
              <span className="eyebrow">Billing</span>
              <strong style={{ fontSize: 24 }}>Receipts</strong>
              <small>Invoices, plans and refunds</small>
            </Link>
            <Link className="metric" href="/privacy">
              <span className="eyebrow">Privacy</span>
              <strong style={{ fontSize: 24 }}>Your data</strong>
              <small>Export, consent and deletion</small>
            </Link>
          </div>
          <div className="admin-grid">
            <section className="panel">
              <span className="eyebrow">Profile</span>
              <h3 style={{ margin: '10px 0 20px' }}>Personal details</h3>
              <form className="staff-form" onSubmit={handleSave}>
                <div className="form-grid">
                  <div>
                    <label>FIRST NAME</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <label>LAST NAME</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                  <div>
                    <label>TIMEZONE</label>
                    <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>TARGET BAND</label>
                    <select value={targetBand} onChange={(e) => setTargetBand(e.target.value)}>
                      {TARGET_BANDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button className="btn btn-dark" style={{ marginTop: 20 }} disabled={saving} type="submit">
                  {saving ? 'Saving…' : 'Save profile'}
                </button>
              </form>
            </section>
            <aside>
              <div className="panel">
                <span className="eyebrow">Learning account</span>
                <div className="phase-step">
                  <b>✓</b>
                  <span>
                    <strong>Email verified</strong>
                    <small style={{ display: 'block' }}>{profile.email}</small>
                  </span>
                </div>
                <div className="phase-step">
                  <b>{profile.target_band ?? '—'}</b>
                  <span>
                    <strong>Target band</strong>
                    <small style={{ display: 'block' }}>Exam plan active</small>
                  </span>
                </div>
                <div className="phase-step">
                  <b>{tzAbbrev}</b>
                  <span>
                    <strong>{profile.timezone}</strong>
                    <small style={{ display: 'block' }}>Classes shown locally</small>
                  </span>
                </div>
              </div>
            </aside>
          </div>
          <div className="section-head" style={{ marginTop: 35, marginBottom: 15 }}>
            <h3>More account tools</h3>
          </div>
          <div className="cards-4">
            <Link className="skill-card" style={{ minHeight: 190 }} href="/support">
              <span className="card-num">HELP</span>
              <h3>Support tickets</h3>
              <p>Get help with access, learning or payments.</p>
              <span className="arrow">→</span>
            </Link>
            <Link className="skill-card" style={{ minHeight: 190 }} href="/recordings">
              <span className="card-num">LEARNING</span>
              <h3>Recordings</h3>
              <p>Review classes from your enrolled cohort.</p>
              <span className="arrow">→</span>
            </Link>
            {referralsEnabled && (
              <Link className="skill-card" style={{ minHeight: 190 }} href="/referrals">
                <span className="card-num">OPTIONAL</span>
                <h3>Referrals</h3>
                <p>View verified rewards and scholarship support.</p>
                <span className="arrow">→</span>
              </Link>
            )}
            <Link className="skill-card" style={{ minHeight: 190 }} href="/research">
              <span className="card-num">FEEDBACK</span>
              <h3>Improve AcmeLearn</h3>
              <p>Share feedback about a completed journey.</p>
              <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
