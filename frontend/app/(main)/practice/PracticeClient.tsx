'use client';

import { useToast } from '@/components/ToastProvider';

export function PracticeClient({ isSignedIn }: { isSignedIn: boolean }) {
  const toast = useToast();

  function start(e: React.MouseEvent) {
    e.preventDefault();
    toast(isSignedIn ? 'Practice added to your study plan' : 'Create a free account to save this activity');
  }

  return (
    <>
      <header className="page-hero" style={{ background: '#dcefeb' }}>
        <div className="shell">
          <div className="crumb">Home / Practice</div>
          <span className="eyebrow">Real format. Useful feedback.</span>
          <h1>Practise like it’s test day.</h1>
          <p>
            Timed mocks, focused drills and instant explanations. Every result updates your
            strengths, gaps and next best activity.
          </p>
          <a className="btn btn-dark practice-start" href="#" style={{ marginTop: 16 }} onClick={start}>
            Start a free diagnostic →
          </a>
        </div>
      </header>
      <main className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <span className="eyebrow">Recommended practice</span>
              <h2>Start where it matters most.</h2>
            </div>
            <p>Based on common score gaps for learners targeting Band 7 and above.</p>
          </div>
          <div className="cards-4">
            <a href="#" className="skill-card practice-start" onClick={start}>
              <span className="card-num">FREE · 40 MIN</span>
              <span className="card-icon">◖))</span>
              <h3>Listening diagnostic</h3>
              <p>20 adaptive questions across all four test sections.</p>
              <span className="arrow">Start →</span>
            </a>
            <a href="#" className="skill-card practice-start" onClick={start}>
              <span className="card-num">TIMED · 20 MIN</span>
              <span className="card-icon">▤</span>
              <h3>Reading: Headings</h3>
              <p>Master one of the most challenging Academic question types.</p>
              <span className="arrow">Start →</span>
            </a>
            <a href="#" className="skill-card practice-start" onClick={start}>
              <span className="card-num">AI REVIEW · 40 MIN</span>
              <span className="card-icon">✎</span>
              <h3>Writing Task 2</h3>
              <p>Write a full essay and receive criterion-level feedback.</p>
              <span className="arrow">Start →</span>
            </a>
            <a href="#" className="skill-card practice-start" onClick={start}>
              <span className="card-num">RECORDED · 15 MIN</span>
              <span className="card-icon">◎</span>
              <h3>Speaking Part 2</h3>
              <p>Record a two-minute response and analyse your fluency.</p>
              <span className="arrow">Start →</span>
            </a>
          </div>
        </div>
      </main>
      <section className="section section-soft">
        <div className="shell">
          <div className="promo-grid">
            <div className="promo-main">
              <span className="eyebrow">Full-length mock</span>
              <h2>Know your score before test day.</h2>
              <p>
                Sit all four skills in realistic timing and receive a detailed estimated-band
                report within 24 hours.
              </p>
              <button className="btn btn-coral practice-start" onClick={start}>
                Book my mock →
              </button>
            </div>
            <div className="promo-side">
              <span className="eyebrow" style={{ color: 'white' }}>
                Next session
              </span>
              <div className="price" style={{ fontSize: 38 }}>
                Saturday
              </div>
              <p>
                18 July · 9:00 AM WAT
                <br />
                Online · 2h 45m
              </p>
              <button className="btn practice-start" onClick={start}>
                Reserve free place
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
