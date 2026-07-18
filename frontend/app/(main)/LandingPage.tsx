import Link from 'next/link';
import { AdSlot } from '@/components/AdSlot';

export function LandingPage({
  content,
}: {
  content: { hero_heading: string; hero_body: string; hero_cta: string; campaign_label: string };
}) {
  return (
    <main id="landing">
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{content.campaign_label}</span>
            <h1>{content.hero_heading}</h1>
            <p>{content.hero_body}</p>
            <div className="hero-actions">
              <Link className="btn btn-coral" href="/signup">
                <span>{content.hero_cta}</span> <span>→</span>
              </Link>
              <Link className="btn btn-outline" href="/practice">
                Try a free mock
              </Link>
            </div>
          </div>
          <figure className="hero-image">
            <picture className="hero-picture">
              <source media="(max-width:700px)" srcSet="/assets/hero-student-640.avif" type="image/avif" />
              <source media="(max-width:700px)" srcSet="/assets/hero-student-640.webp" type="image/webp" />
              <source media="(max-width:1100px)" srcSet="/assets/hero-student-960.avif" type="image/avif" />
              <source media="(max-width:1100px)" srcSet="/assets/hero-student-960.webp" type="image/webp" />
              <source srcSet="/assets/hero-student-1280.avif" type="image/avif" />
              <source srcSet="/assets/hero-student-1280.webp" type="image/webp" />
              <img
                src="/assets/hero-student.jpg"
                width={1312}
                height={816}
                alt="A Nigerian student preparing for her IELTS exam with a laptop, notebook and headphones in Lagos"
                fetchPriority="high"
              />
            </picture>
            <figcaption className="hidden">Focused IELTS preparation with AcmeLearn</figcaption>
            <div className="score-stamp" aria-label="Target band 7.5">
              <strong>7.5</strong>
              <span>YOUR NEXT BAND</span>
            </div>
          </figure>
        </div>
      </section>

      <section className="ticker">
        <div className="shell ticker-row">
          <span className="ticker-title">Learner outcomes</span>
          <span className="ticker-item">
            Pilot measurement <strong className="up">Begins at launch</strong>
          </span>
          <span className="ticker-item">
            Feedback target <strong>24 hrs</strong>
          </span>
          <span className="ticker-item">
            Pilot capacity <strong className="up">20 learners</strong>
          </span>
          <span className="ticker-item">
            Practice content <strong>Original &amp; reviewed</strong>
          </span>
          <span className="ticker-item">
            Dedicated tutor <strong>1</strong>
          </span>
        </div>
      </section>

      <section className="section" style={{ padding: '26px 0 6px' }} aria-label="Advertisement">
        <div className="shell">
          <div
            style={{
              textAlign: 'center',
              fontSize: 11,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 10,
            }}
          >
            Advertisement
          </div>
          <AdSlot />
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <span className="eyebrow">Master every paper</span>
              <h2>Four skills. One clear plan.</h2>
            </div>
            <p>
              Learn the method, practise under real conditions and get feedback that tells you
              exactly what to improve next.
            </p>
          </div>
          <div className="cards-4">
            {[
              ['01 / 04', '◖))', 'Listening', 'Train for accents, distractors and fast-moving conversations.'],
              ['02 / 04', '▤', 'Reading', 'Read strategically and answer with pace and precision.'],
              ['03 / 04', '✎', 'Writing', 'Build high-band responses with expert, line-by-line feedback.'],
              ['04 / 04', '◎', 'Speaking', 'Sound fluent, structured and confident on test day.'],
            ].map(([num, icon, title, body]) => (
              <Link key={title} className="skill-card" href="/practice">
                <span className="card-num">{num}</span>
                <span className="card-icon">{icon}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                <span className="arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft" id="coaching">
        <div className="shell">
          <div className="promo-grid">
            <div className="promo-main">
              <span className="eyebrow">Personalised coaching</span>
              <h2>
                Your score is personal.
                <br />
                Your plan should be too.
              </h2>
              <p>
                Start with a diagnostic, get a weekly roadmap and meet experienced IELTS tutors who
                focus on your specific band gaps.
              </p>
              <Link className="btn btn-coral" href="/signup">
                Take the 5-minute diagnostic →
              </Link>
            </div>
            <div className="promo-side">
              <span className="eyebrow" style={{ color: 'white' }}>
                Pro coaching
              </span>
              <div className="price">GH₵1,200</div>
              <p>per month · cancel anytime</p>
              <ul>
                <li>4 private tutor sessions</li>
                <li>Unlimited writing reviews</li>
                <li>Personal weekly plan</li>
              </ul>
              <Link className="btn" href="/signup">
                See what’s included
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="trust-grid">
            <div className="trust-item">
              <span className="eyebrow">Tutor response</span>
              <strong>24-hour target</strong>
              <small>Measured during the pilot</small>
            </div>
            <div className="trust-item">
              <span className="eyebrow">Outcome evidence</span>
              <strong>Pilot measured</strong>
              <small>Claims publish only after approval</small>
            </div>
            <div className="trust-item">
              <span className="eyebrow">Secure learning</span>
              <strong>Private access</strong>
              <small>Enrolment-gated classes</small>
            </div>
            <div className="trust-item">
              <span className="eyebrow">Payments</span>
              <strong>Paystack + Stripe</strong>
              <small>Verified checkout providers</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell">
          <div className="image-feature">
            <picture>
              <source media="(max-width:700px)" srcSet="/assets/live-zoom-class-640.avif" type="image/avif" />
              <source media="(max-width:700px)" srcSet="/assets/live-zoom-class-640.webp" type="image/webp" />
              <source media="(max-width:1100px)" srcSet="/assets/live-zoom-class-960.avif" type="image/avif" />
              <source media="(max-width:1100px)" srcSet="/assets/live-zoom-class-960.webp" type="image/webp" />
              <source srcSet="/assets/live-zoom-class-1280.avif" type="image/avif" />
              <source srcSet="/assets/live-zoom-class-1280.webp" type="image/webp" />
              <img
                src="/assets/live-zoom-class.jpg"
                width={1376}
                height={768}
                loading="lazy"
                alt="A student taking notes during a live online IELTS class"
              />
            </picture>
            <div className="image-feature-copy">
              <span className="eyebrow">Live teaching, built in</span>
              <h2>Join class. Ask questions. Improve together.</h2>
              <p>
                Small-group Zoom lectures combine clear strategy, guided practice and direct
                feedback. Your secure link appears only when your registered class is about to
                begin.
              </p>
              <Link className="btn btn-coral" href="/signup" style={{ alignSelf: 'flex-start' }}>
                See the learning experience →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <span className="eyebrow">One expert, consistent support</span>
              <h2>Meet your tutor.</h2>
            </div>
            <p>
              AcmeLearn begins with one dedicated IELTS specialist, so every learner receives a
              consistent standard of teaching and feedback.
            </p>
          </div>
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
                loading="lazy"
                alt="Paulyn Moneke, AcmeLearn's IELTS tutor"
              />
            </picture>
            <div className="single-tutor-copy">
              <span className="verified">Founding tutor profile · verification required before launch</span>
              <h2 style={{ margin: '15px 0' }}>Paulyn Moneke</h2>
              <p style={{ lineHeight: 1.7, color: 'var(--muted)' }}>
                Tutor biography and experience must be replaced with independently verified launch
                information. Paulyn leads every live course, reviews assessed work and oversees each
                learner’s study plan.
              </p>
              <p>
                <b>Writing · Speaking · Academic IELTS · Band 7+</b>
              </p>
              <Link className="btn btn-dark" href="/meet-your-tutor" style={{ display: 'inline-flex' }}>
                View profile and availability →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell">
          <div className="story-grid">
            <div className="story-image">
              <picture>
                <source media="(max-width:700px)" srcSet="/assets/student-success-640.avif" type="image/avif" />
                <source media="(max-width:700px)" srcSet="/assets/student-success-640.webp" type="image/webp" />
                <source media="(max-width:1100px)" srcSet="/assets/student-success-960.avif" type="image/avif" />
                <source media="(max-width:1100px)" srcSet="/assets/student-success-960.webp" type="image/webp" />
                <source srcSet="/assets/student-success-1280.avif" type="image/avif" />
                <source srcSet="/assets/student-success-1280.webp" type="image/webp" />
                <img
                  src="/assets/student-success.jpg"
                  width={1376}
                  height={768}
                  loading="lazy"
                  alt="An AcmeLearn student celebrating her university admission result"
                />
              </picture>
            </div>
            <div className="story-copy">
              <span className="eyebrow">Illustrative learner journey</span>
              <div className="quote-mark">“</div>
              <p className="quote" style={{ fontSize: 30 }}>
                My plan stopped me from studying everything at once. I knew what to do each day, and
                Paulyn’s writing feedback changed my score.
              </p>
              <p>
                <strong>Example study scenario</strong>
                <br />
                Replace with a consented pilot story after outcomes are independently verified.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="promo-grid">
            <div className="promo-main">
              <span className="eyebrow">Choose with confidence</span>
              <h2>Which AcmeLearn route fits your goal?</h2>
              <p>
                Compare course length, live teaching, feedback allowance and recommended
                preparation time side by side.
              </p>
              <Link className="btn btn-coral" href="/compare">
                Compare learning plans →
              </Link>
            </div>
            <div className="promo-side" style={{ background: 'var(--aqua)', color: 'var(--navy)' }}>
              <span className="eyebrow">Not sure yet?</span>
              <h2 style={{ fontSize: 34 }}>Start with your estimated band.</h2>
              <p>Take the short diagnostic and get a recommended plan before paying.</p>
              <Link className="btn btn-dark" href="/learning">
                Take the diagnostic
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell">
          <div className="single-tutor">
            <picture>
              <source media="(max-width:700px)" srcSet="/assets/mobile-study-480.avif" type="image/avif" />
              <source media="(max-width:700px)" srcSet="/assets/mobile-study-480.webp" type="image/webp" />
              <source srcSet="/assets/mobile-study-720.avif" type="image/avif" />
              <source srcSet="/assets/mobile-study-720.webp" type="image/webp" />
              <img
                src="/assets/mobile-study.jpg"
                width={928}
                height={1152}
                loading="lazy"
                alt="An IELTS learner using AcmeLearn on a mobile phone"
              />
            </picture>
            <div className="single-tutor-copy">
              <span className="eyebrow">Study wherever life happens</span>
              <h2 style={{ margin: '12px 0' }}>AcmeLearn goes with you.</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                Install the web app for quick dashboard access, offline writing drafts and cached
                learning pages. Progress syncs securely when your connection returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="quote-mark">“</div>
          <p className="quote">
            A focused plan should show learners what to practise, why it matters and what to
            improve next.
          </p>
          <p>
            <strong>AcmeLearn learning principle</strong> · not a learner testimonial
          </p>
        </div>
      </section>
    </main>
  );
}
