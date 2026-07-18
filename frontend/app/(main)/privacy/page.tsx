import Link from 'next/link';
import { getSessionProfile } from '@/lib/session';
import { PrivacyControls } from './PrivacyControls';

export default async function PrivacyPage() {
  const profile = await getSessionProfile();

  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <span className="eyebrow">Effective 16 July 2026</span>
          <h1 style={{ fontSize: 52 }}>Privacy and your data.</h1>
          <p>Clear controls for accessing, correcting and deleting your personal information.</p>
        </div>
      </header>
      <main className="section">
        <div className="shell legal">
          {profile ? (
            <PrivacyControls profileId={profile.id} email={profile.email || ''} />
          ) : (
            <div className="promo-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="lecture-note">
                <h3>Download your data</h3>
                <p>Sign in to export your profile, enrolments, scores, submissions and order history as JSON.</p>
                <Link href="/login" className="btn btn-dark">
                  Sign in to manage your data
                </Link>
              </div>
              <div style={{ background: '#fff1ef', padding: 24 }}>
                <h3>Delete your account</h3>
                <p>Sign in to permanently remove your profile and associated learner records.</p>
                <Link href="/login" className="btn btn-coral">
                  Sign in to manage your data
                </Link>
              </div>
            </div>
          )}

          <h2>What AcmeLearn collects</h2>
          <p>
            We process account details, learning activity, assessment responses, tutor feedback, lecture
            attendance, payment references and communication preferences. Speaking audio and lecture recordings are
            treated as private learner media.
          </p>
          <h2>Why we process it</h2>
          <ul>
            <li>Deliver courses, assessments and tutoring.</li>
            <li>Authorize access to private lectures and recordings.</li>
            <li>Personalize study recommendations.</li>
            <li>Process payments and prevent fraud.</li>
            <li>Meet legal and safety obligations.</li>
          </ul>
          <h2>Recordings</h2>
          <p>
            Students are notified when a lecture is recorded. Recordings are stored privately, limited to the
            enrolled cohort and removed according to the published retention period. Speaking samples may be
            deleted separately through support.
          </p>
          <h2>Your choices</h2>
          <p>
            Academic notifications, WhatsApp reminders and marketing consent are controlled independently.
            Withdrawing marketing consent does not affect essential service messages.
          </p>
          <h2>International transfers</h2>
          <p>
            Our service providers may process data outside Nigeria. We use contractual and technical safeguards and
            assess providers under applicable Nigerian data-protection requirements.
          </p>
          <h2>Contact</h2>
          <p>
            Privacy enquiries: privacy@acmelearn.example. This implementation should receive a formal legal review
            before commercial launch.
          </p>
        </div>
      </main>
    </>
  );
}
