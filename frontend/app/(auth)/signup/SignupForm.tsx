'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthHeader } from '@/components/AuthHeader';
import { useSupabase } from '@/lib/supabase/useSupabase';

const PROVIDERS: Array<[string, string]> = [
  ['google', 'G  Continue with Google'],
  ['apple', '  Continue with Apple ID'],
  ['azure', '⊞  Continue with Microsoft'],
  ['facebook', 'f  Continue with Facebook'],
];

export function SignupForm({ whatsappEnabled }: { whatsappEnabled: boolean }) {
  const supabase = useSupabase();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const data = new FormData(e.currentTarget);
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: String(data.get('email')),
      password: String(data.get('password')),
      options: {
        data: {
          first_name: data.get('firstName'),
          last_name: data.get('lastName'),
          target_band: data.get('target') === '8.0+' ? 8 : Number(data.get('target')),
          phone: data.get('phone') || null,
          whatsapp_opt_in: data.get('whatsapp_opt_in') === 'on',
        },
      },
    });
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    if (signUpData.session) {
      router.push('/');
      router.refresh();
      return;
    }
    setCheckEmail(true);
    setSubmitting(false);
  }

  async function handleOAuth(provider: string) {
    await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'apple' | 'azure' | 'facebook',
      options: { redirectTo: `${window.location.origin}/` },
    });
  }

  return (
    <>
      <AuthHeader backHref="/" backLabel="← Back to site" showTopBar />
      <main className="auth-page">
        <aside className="auth-aside">
          <span className="eyebrow">Start moving forward</span>
          <h1>A clear path to your target band.</h1>
          <p>
            Create your free account and we’ll turn your exam date, current level and target into a
            focused weekly plan.
          </p>
          <ul className="benefits">
            <li>
              <b>01</b> Personal skill diagnostic
            </li>
            <li>
              <b>02</b> Adaptive daily recommendations
            </li>
            <li>
              <b>03</b> One free full-length mock test
            </li>
          </ul>
        </aside>
        <section className="auth-main">
          <div className="form-wrap">
            <span className="eyebrow">Free learner account</span>
            <h2>Create your study plan</h2>
            <p className="form-sub">It takes about two minutes. No card required.</p>
            {checkEmail ? (
              <div className="auth-alert">
                <strong>Check your email to continue.</strong> We sent you a secure confirmation
                link.
              </div>
            ) : (
              <>
                <div className="social-row">
                  {PROVIDERS.map(([id, label]) => (
                    <button key={id} type="button" className="btn btn-outline" onClick={() => handleOAuth(id)}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="or">OR USE YOUR EMAIL</div>
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="firstName">FIRST NAME</label>
                      <input required id="firstName" name="firstName" placeholder="e.g. Amara" />
                    </div>
                    <div className="field">
                      <label htmlFor="lastName">LAST NAME</label>
                      <input required id="lastName" name="lastName" placeholder="e.g. Okafor" />
                    </div>
                    <div className="field full">
                      <label htmlFor="email">EMAIL ADDRESS</label>
                      <input required id="email" name="email" type="email" placeholder="you@example.com" />
                    </div>
                    <div className="field">
                      <label htmlFor="target">TARGET BAND</label>
                      <select name="target" id="target" defaultValue="7.0">
                        <option>6.5</option>
                        <option>7.0</option>
                        <option>7.5</option>
                        <option>8.0+</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="date">EXAM DATE</label>
                      <input name="date" id="date" type="date" />
                    </div>
                    <div className="field full">
                      <label htmlFor="phone">
                        WHATSAPP NUMBER <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(OPTIONAL)</span>
                      </label>
                      <input id="phone" name="phone" type="tel" placeholder="+234 801 234 5678" />
                    </div>
                    <div className="field full">
                      <label htmlFor="password">CREATE PASSWORD</label>
                      <input
                        required
                        minLength={8}
                        id="password"
                        name="password"
                        type="password"
                        placeholder="At least 8 characters"
                      />
                    </div>
                  </div>
                  {whatsappEnabled && (
                    <label className="check">
                      <input type="checkbox" name="whatsapp_opt_in" />{' '}
                      <span>
                        Send me class reminders on WhatsApp. Standard messaging charges may apply; I
                        can opt out anytime.
                      </span>
                    </label>
                  )}
                  <label className="check">
                    <input required type="checkbox" />{' '}
                    <span>
                      I agree to the Terms and Privacy Notice and would like AcmeLearn to
                      personalise my learning experience.
                    </span>
                  </label>
                  {error && <p style={{ color: 'var(--coral)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
                  <button className="btn btn-coral submit" type="submit" disabled={submitting}>
                    {submitting ? 'Creating your plan…' : 'Create my free plan →'}
                  </button>
                </form>
                <p className="login-note">
                  Already learning with us? <Link href="/login">Sign in</Link>
                </p>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
