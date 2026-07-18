import Link from 'next/link';
import { getSessionProfile } from '@/lib/session';
import { SupportForm } from './SupportForm';

export default async function SupportPage() {
  const profile = await getSessionProfile();

  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <span className="eyebrow">We’re here to help</span>
          <h1 style={{ fontSize: 52 }}>Student support.</h1>
          <p>
            Find an answer or send a ticket to the right team. Urgent lecture-access requests are
            prioritised automatically.
          </p>
        </div>
      </header>
      <main className="section section-soft">
        <div className="shell admin-grid">
          <section className="panel">
            <span className="eyebrow">Create a ticket</span>
            <h2 style={{ fontSize: 34, margin: '10px 0 25px' }}>How can we help?</h2>
            <SupportForm signedIn={!!profile} userId={profile?.id ?? null} />
          </section>
          <aside>
            <div className="panel">
              <span className="eyebrow">Popular help</span>
              <div className="recommendation">
                <div>
                  <strong>How lecture links work</strong>
                  <p>Access, waiting rooms and display names</p>
                </div>
              </div>
              <div className="recommendation">
                <div>
                  <strong>Reset your password</strong>
                  <p>Recover email and social accounts</p>
                </div>
              </div>
              <Link className="recommendation" href="/service-standards">
                <div>
                  <strong>Service standards</strong>
                  <p>Feedback, support and refund targets</p>
                </div>
              </Link>
              <div className="recommendation">
                <div>
                  <strong>Recording privacy</strong>
                  <p>Consent, storage and deletion</p>
                </div>
              </div>
            </div>
            <div className="lecture-note" style={{ marginTop: 20 }}>
              <b>Lecture starting soon?</b>
              <p style={{ fontSize: 13 }}>
                Select “Lecture access.” We target a response within 10 minutes during scheduled
                class windows.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
