import { getMeetYourTutorContent } from '@/lib/siteContent';
import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { getDisplayCurrency, convertFromNgnMinor, formatMoney, COACHING_SESSION_MINOR_NGN } from '@/lib/currency';
import { BookCoachingForm } from './BookCoachingForm';

function upcomingSlots() {
  const now = new Date();
  const offsets = [2, 4, 7];
  return offsets.map((days) => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() + days);
    d.setUTCHours(16, 0, 0, 0); // 5:00 PM WAT (UTC+1)
    return d.toISOString();
  });
}

export default async function MeetYourTutorPage() {
  const content = await getMeetYourTutorContent();
  const profile = await getSessionProfile();
  const supabase = await createClient();
  const { data: setting } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'launch_tutor_id')
    .maybeSingle();
  const tutorId = (setting?.value as { id?: string } | null)?.id ?? null;
  const slots = upcomingSlots();
  const displayCurrency = await getDisplayCurrency();
  const sessionPrice = formatMoney(await convertFromNgnMinor(COACHING_SESSION_MINOR_NGN, displayCurrency), displayCurrency);

  return (
    <>
      <header className="page-hero">
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
                alt="Portrait of Paulyn Moneke"
              />
            </picture>
            <div className="single-tutor-copy">
              <span className="verified">{content.badge}</span>
              <h1 style={{ fontSize: 52, margin: '15px 0' }}>{content.name}</h1>
              <p>{content.tagline}</p>
              <p>{content.note}</p>
              <a className="btn btn-coral" href="#availability">
                View availability →
              </a>
            </div>
          </div>
        </div>
      </header>
      <main className="section">
        <div className="shell admin-grid">
          <section>
            <span className="eyebrow">About Paulyn</span>
            <h2 style={{ fontSize: 38, margin: '10px 0 20px' }}>
              Clear feedback, focused preparation.
            </h2>
            <p style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--muted)' }}>
              This section is reserved for the tutor’s verified biography, teaching history and
              approach. Publish only after identity, qualifications and experience are
              independently checked.
            </p>
            <div className="image-feature" style={{ marginTop: 30, minHeight: 350 }}>
              <picture>
                <source media="(max-width:700px)" srcSet="/assets/essay-feedback-640.avif" type="image/avif" />
                <source media="(max-width:700px)" srcSet="/assets/essay-feedback-640.webp" type="image/webp" />
                <source srcSet="/assets/essay-feedback-960.avif" type="image/avif" />
                <source srcSet="/assets/essay-feedback-960.webp" type="image/webp" />
                <img
                  src="/assets/essay-feedback.jpg"
                  width={1200}
                  height={896}
                  loading="lazy"
                  alt="Paulyn reviewing an IELTS writing response"
                />
              </picture>
              <div className="image-feature-copy" style={{ padding: 35 }}>
                <span className="eyebrow">Feedback approach</span>
                <h3>Every comment should lead to an action.</h3>
                <p>
                  Writing reviews identify the criterion, explain the issue and give a practical
                  revision step.
                </p>
              </div>
            </div>
            <div className="panel" style={{ marginTop: 25 }}>
              <span className="eyebrow">Qualifications</span>
              <div className="phase-step">
                <b>✓</b>
                <span>
                  <strong>Doctorate in Applied Linguistics</strong>
                  <small style={{ display: 'block' }}>Publish after independent credential check</small>
                </span>
              </div>
              <div className="phase-step">
                <b>✓</b>
                <span>
                  <strong>DELTA-qualified English teacher</strong>
                  <small style={{ display: 'block' }}>Advanced teaching qualification</small>
                </span>
              </div>
              <div className="phase-step">
                <b>✓</b>
                <span>
                  <strong>11 years’ academic-English experience</strong>
                  <small style={{ display: 'block' }}>Higher education and private coaching</small>
                </span>
              </div>
            </div>
          </section>
          <aside id="availability">
            <BookCoachingForm slots={slots} tutorId={tutorId} profileId={profile?.id ?? null} sessionPrice={sessionPrice} />
            <div className="panel" style={{ marginTop: 20 }}>
              <span className="eyebrow">Specialisms</span>
              <p>Academic Writing Task 1 &amp; 2</p>
              <p>Speaking fluency and structure</p>
              <p>Band 7+ score planning</p>
              <p>Graduate admissions preparation</p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
