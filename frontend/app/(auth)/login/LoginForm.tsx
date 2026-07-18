'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthHeader } from '@/components/AuthHeader';
import { useSupabase } from '@/lib/supabase/useSupabase';

const PROVIDERS: Array<[string, string, string]> = [
  ['google', 'G', 'Google'],
  ['apple', '●', 'Apple ID'],
  ['azure', '⊞', 'Microsoft'],
  ['facebook', 'f', 'Facebook'],
];

export function LoginForm() {
  const supabase = useSupabase();
  const router = useRouter();
  const params = useSearchParams();
  const required = params.get('required') === '1';
  const returnTo = params.get('returnTo') || '/';

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const data = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(data.get('email')),
      password: String(data.get('password')),
    });
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    router.push(returnTo);
    router.refresh();
  }

  async function handleOAuth(provider: (typeof PROVIDERS)[number][0]) {
    await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'apple' | 'azure' | 'facebook',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <>
      <AuthHeader backHref="/" backLabel="← Back to site" showTopBar />
      <main className="auth-page">
        <aside className="auth-aside">
          <span className="eyebrow">Welcome back</span>
          <h1>Keep moving towards your target.</h1>
          <p>
            Sign in to see your personal recommendations, progress, enrolled courses and private
            links to upcoming Zoom and Google Meet lectures.
          </p>
          <ul className="benefits">
            <li>
              <b>01</b> Your personalised dashboard
            </li>
            <li>
              <b>02</b> Registered-student lecture access
            </li>
            <li>
              <b>03</b> Feedback and progress in one place
            </li>
          </ul>
        </aside>
        <section className="auth-main">
          <div className="form-wrap">
            <span className="eyebrow">Student access</span>
            <h2>Sign in to AcmeLearn</h2>
            <p className="form-sub">Use the same method you chose when registering.</p>
            {required && (
              <div className="auth-alert">
                <strong>Registration required.</strong> Sign in to access live lecture rooms.
              </div>
            )}
            <div className="social-row">
              {PROVIDERS.map(([id, icon, label]) => (
                <button key={id} type="button" className="btn btn-outline" onClick={() => handleOAuth(id)}>
                  <span className="provider-icon">{icon}</span> {label}
                </button>
              ))}
            </div>
            <div className="or">OR SIGN IN WITH EMAIL</div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field full">
                  <label htmlFor="email">EMAIL ADDRESS</label>
                  <input required id="email" name="email" type="email" placeholder="you@example.com" />
                </div>
                <div className="field full">
                  <label htmlFor="password">PASSWORD</label>
                  <input required id="password" name="password" type="password" placeholder="Your password" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 0' }}>
                <label className="check" style={{ margin: 0 }}>
                  <input type="checkbox" /> Keep me signed in
                </label>
                <Link href="/reset-password" style={{ fontSize: 12, color: 'var(--coral)', fontWeight: 700 }}>
                  Forgot password?
                </Link>
              </div>
              {error && (
                <p style={{ color: 'var(--coral)', fontSize: 13, marginBottom: 12 }}>{error}</p>
              )}
              <button className="btn btn-coral submit" type="submit" disabled={submitting}>
                {submitting ? 'Signing you in…' : 'Sign in →'}
              </button>
            </form>
            <p className="login-note">
              New to AcmeLearn? <Link href="/signup">Create a free account</Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
