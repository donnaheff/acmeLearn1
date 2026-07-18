'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export function SecurityClient() {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const factorId = useRef<string | null>(null);
  const challengeId = useRef<string | null>(null);

  async function enrolMfa() {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      factorId.current = data.id;
      setQr(data.totp?.qr_code || null);
      setSecret(data.totp?.secret || null);

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: data.id,
      });
      if (challengeError) throw challengeError;
      challengeId.current = challenge.id;
      setSetupOpen(true);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not start MFA enrolment');
    } finally {
      setEnrolling(false);
    }
  }

  async function verifyMfa() {
    if (code.length !== 6) {
      toast('Enter the six-digit authenticator code.');
      return;
    }
    if (!factorId.current || !challengeId.current) {
      toast('Start enrolment first.');
      return;
    }
    setVerifying(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: factorId.current,
        challengeId: challengeId.current,
        code,
      });
      if (error) throw error;
      setMfaEnabled(true);
      setSetupOpen(false);
      toast('Multi-factor authentication enabled. Store recovery codes safely.');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not verify code');
    } finally {
      setVerifying(false);
    }
  }

  async function signOutAll() {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      router.push('/login');
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not sign out other devices');
      setSigningOut(false);
    }
  }

  return (
    <>
      <header className="page-hero" style={{ padding: '45px 0' }}>
        <div className="shell">
          <span className="eyebrow">Account protection</span>
          <h1 style={{ fontSize: 48 }}>Security and active sessions.</h1>
        </div>
      </header>
      <main className="section section-soft">
        <div className="shell admin-grid">
          <section>
            <div className="panel">
              <div className="section-head" style={{ marginBottom: 10 }}>
                <div>
                  <span className="eyebrow">Multi-factor authentication</span>
                  <h3>Authenticator app</h3>
                </div>
                <span className={`status${mfaEnabled ? '' : ' warn'}`} id="mfaStatus">
                  {mfaEnabled ? 'Enabled' : 'Not enabled'}
                </span>
              </div>
              <p style={{ color: 'var(--muted)' }}>
                Required for tutors and administrators. Students are strongly encouraged to enable it.
              </p>
              {!mfaEnabled && (
                <button className="btn btn-coral" id="enrolMfa" onClick={enrolMfa} disabled={enrolling}>
                  {enrolling ? 'Preparing…' : 'Set up authenticator →'}
                </button>
              )}
              <div id="mfaSetup" className={setupOpen ? '' : 'hidden'} style={{ marginTop: 20 }}>
                <div id="mfaQr" style={{ padding: 15, background: '#fff', overflow: 'auto' }}>
                  {qr ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qr} alt="Authenticator QR code" />
                  ) : (
                    secret && `Secret: ${secret}`
                  )}
                </div>
                <div className="field" style={{ marginTop: 12 }}>
                  <label>6-DIGIT CODE</label>
                  <input
                    id="mfaCode"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <button className="btn btn-dark" id="verifyMfa" style={{ marginTop: 10 }} onClick={verifyMfa} disabled={verifying}>
                  {verifying ? 'Verifying…' : 'Verify and enable'}
                </button>
              </div>
            </div>
            <div className="panel" style={{ marginTop: 20 }}>
              <h3>Active sessions</h3>
              <table className="data-table">
                <tbody>
                  <tr>
                    <td>
                      <b>This browser</b>
                      <br />
                      <small>Current session</small>
                    </td>
                    <td>
                      <span className="status">Active</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button className="btn btn-outline" id="signOutAll" style={{ marginTop: 18 }} onClick={signOutAll} disabled={signingOut}>
                {signingOut ? 'Signing out…' : 'Sign out all other devices'}
              </button>
            </div>
          </section>
          <aside>
            <div className="panel">
              <span className="eyebrow">Security checklist</span>
              <div className="phase-step">
                <b>✓</b>
                <span>
                  <strong>Email verified</strong>
                  <small style={{ display: 'block' }}>Required before enrolment</small>
                </span>
              </div>
              <div className="phase-step">
                <b>{mfaEnabled ? '✓' : '2'}</b>
                <span>
                  <strong>Enable MFA</strong>
                  <small style={{ display: 'block' }}>Protects account changes</small>
                </span>
              </div>
              <div className="phase-step">
                <b>✓</b>
                <span>
                  <strong>Private lecture links</strong>
                  <small style={{ display: 'block' }}>Unique and expiring</small>
                </span>
              </div>
            </div>
            <div className="auth-alert" style={{ marginTop: 18 }}>
              <strong>Unexpected activity?</strong> Sign out all devices, reset your password and contact support.
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
