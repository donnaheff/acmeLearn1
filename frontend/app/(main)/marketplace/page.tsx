import Link from 'next/link';
import { getSessionProfile } from '@/lib/session';
import { getFeatureFlags } from '@/lib/featureFlags';
import { getDisplayCurrency, convertFromNgnMinor, formatMoney, COACHING_SESSION_MINOR_NGN } from '@/lib/currency';

export default async function MarketplacePage() {
  const profile = await getSessionProfile();
  const flags = await getFeatureFlags(profile);

  if (!flags.tutor_marketplace) {
    return (
      <main className="page-hero">
        <div className="shell">
          <span className="eyebrow">Verified coaching</span>
          <h1>The tutor marketplace isn’t open yet.</h1>
          <p>
            AcmeLearn is starting with one dedicated tutor during the pilot. Marketplace browsing
            unlocks once additional tutors have been verified.
          </p>
          <Link className="btn btn-dark" href="/meet-your-tutor" style={{ marginTop: 16, display: 'inline-flex' }}>
            Meet our founding tutor →
          </Link>
        </div>
      </main>
    );
  }

  const displayCurrency = await getDisplayCurrency();
  const hourlyRate = formatMoney(await convertFromNgnMinor(COACHING_SESSION_MINOR_NGN, displayCurrency), displayCurrency);

  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <span className="eyebrow">Verified coaching</span>
          <h1 style={{ fontSize: 54 }}>Find the right IELTS tutor.</h1>
          <p>
            Book specialist support by skill, timezone and target band. Every tutor is
            identity-checked and quality-reviewed.
          </p>
        </div>
      </header>
      <main className="section section-soft">
        <div className="shell">
          <div className="single-tutor">
            <picture>
              <source media="(max-width:700px)" srcSet="/assets/tutor-sophie-640.avif" type="image/avif" />
              <source media="(max-width:700px)" srcSet="/assets/tutor-sophie-640.webp" type="image/webp" />
              <source srcSet="/assets/tutor-sophie-960.avif" type="image/avif" />
              <source srcSet="/assets/tutor-sophie-960.webp" type="image/webp" />
              <img
                src="/assets/tutor-sophie.jpg"
                width={1200}
                height={896}
                alt="Paulyn Moneke, AcmeLearn IELTS tutor"
              />
            </picture>
            <div className="single-tutor-copy">
              <span className="verified">Founding AcmeLearn tutor</span>
              <h2 style={{ margin: '15px 0' }}>Paulyn Moneke</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                Writing and speaking focus · experience details pending launch verification
              </p>
              <p>Launch profile · learner reviews begin after the pilot</p>
              <div className="course-foot">
                <strong>From {hourlyRate}/hr</strong>
                <Link className="btn btn-dark" href="/meet-your-tutor">
                  Profile &amp; times →
                </Link>
              </div>
            </div>
          </div>
          <div className="panel" style={{ marginTop: 24, textAlign: 'center' }}>
            <span className="eyebrow">Intentionally focused</span>
            <h3 style={{ margin: '10px 0' }}>One tutor at launch</h3>
            <p style={{ color: 'var(--muted)' }}>
              We are starting with one specialist to maintain teaching consistency. Additional
              tutors will only be added after verification, observation and quality review.
            </p>
          </div>
          <div className="auth-alert" style={{ marginTop: 30 }}>
            <strong>Quality and safety:</strong> sessions are booked and paid through AcmeLearn.
            Tutors cannot request off-platform payment or personal financial details.
          </div>
        </div>
      </main>
    </>
  );
}
