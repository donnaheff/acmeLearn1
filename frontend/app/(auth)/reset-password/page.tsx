'use client';

import { useState } from 'react';
import { AuthHeader } from '@/components/AuthHeader';
import { useSupabase } from '@/lib/supabase/useSupabase';

export default function ResetPasswordPage() {
  const supabase = useSupabase();
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [resetComplete, setResetComplete] = useState(false);
  const [resetError, setResetError] = useState('');

  async function handleRecovery(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRecoveryError('');
    const email = String(new FormData(e.currentTarget).get('email'));
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    if (error) {
      setRecoveryError(error.message);
      return;
    }
    setRecoverySent(true);
  }

  async function handleNewPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResetError('');
    const password = String(new FormData(e.currentTarget).get('password'));
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setResetError(error.message);
      return;
    }
    e.currentTarget.reset();
    setResetComplete(true);
  }

  return (
    <>
      <AuthHeader backHref="/login" backLabel="Back to sign in" />
      <main className="auth-page">
        <aside className="auth-aside">
          <span className="eyebrow">Account recovery</span>
          <h1>Reset securely.</h1>
          <p>
            Recovery links expire and can only be used once. AcmeLearn staff will never ask for
            your password or authenticator code.
          </p>
        </aside>
        <section className="auth-main">
          <div className="form-wrap">
            <span className="eyebrow">Password reset</span>
            <h2>Recover your account</h2>
            <form className="staff-form" onSubmit={handleRecovery}>
              <div>
                <label>EMAIL ADDRESS</label>
                <input required type="email" name="email" />
              </div>
              {recoveryError && <p style={{ color: 'var(--coral)', fontSize: 13 }}>{recoveryError}</p>}
              {recoverySent && (
                <p style={{ fontSize: 13 }}>If that account exists, a reset link has been sent.</p>
              )}
              <button className="btn btn-coral">Send secure reset link →</button>
            </form>
            <div className="or">AFTER OPENING YOUR LINK</div>
            <form className="staff-form" onSubmit={handleNewPassword}>
              <div>
                <label>NEW PASSWORD</label>
                <input required minLength={10} type="password" name="password" />
              </div>
              {resetError && <p style={{ color: 'var(--coral)', fontSize: 13 }}>{resetError}</p>}
              <button className="btn btn-dark">Set new password</button>
            </form>
            {resetComplete && (
              <div className="auth-alert">
                <strong>Password updated.</strong> Your other sessions were closed. You can sign in
                with the new password.
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
