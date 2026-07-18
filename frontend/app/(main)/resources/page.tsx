import Link from 'next/link';

export default function ResourcesPage() {
  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <div className="crumb">Home / Resources</div>
          <span className="eyebrow">Guides, insights &amp; strategies</span>
          <h1>Better preparation starts with better advice.</h1>
          <p>
            Practical explanations from IELTS teachers, examiners and learners—free to read and
            made to use.
          </p>
        </div>
      </header>
      <main className="section">
        <div className="shell">
          <div className="promo-grid" style={{ marginBottom: 48 }}>
            <article className="promo-main" style={{ background: '#102c49' }}>
              <span className="eyebrow">Featured guide · 8 min read</span>
              <h2>What Band 7 writing really looks like.</h2>
              <p>
                We annotate a real Task 2 response against all four examiner criteria—sentence by
                sentence.
              </p>
              <Link href="/resources/band-7" className="btn btn-coral">
                Read the guide →
              </Link>
            </article>
            <aside className="promo-side" style={{ background: '#dcefeb', color: 'var(--navy)' }}>
              <span className="eyebrow">Free download</span>
              <h2 style={{ fontSize: 32 }}>The 30-day IELTS planner</h2>
              <p>Daily tasks, mock dates and progress checks in one printable plan.</p>
              <Link href="/signup" className="btn btn-dark">
                Send me the planner
              </Link>
            </aside>
          </div>
          <div id="articles" className="section-head">
            <div>
              <span className="eyebrow">Latest insight</span>
              <h2>Learn something useful.</h2>
            </div>
          </div>
          <div className="course-grid">
            <article className="course">
              <div className="course-top">
                <span className="eyebrow">Writing</span>
                <h3>7 phrases to avoid in Task 2</h3>
              </div>
              <div className="course-body">
                <p>Why memorised language lowers your score—and what to write instead.</p>
                <div className="meta">
                  <span>6 min read</span>
                  <span>12 Jul 2026</span>
                </div>
                <a href="#">Read article →</a>
              </div>
            </article>
            <article className="course">
              <div className="course-top">
                <span className="eyebrow">Speaking</span>
                <h3>How to stop giving short answers</h3>
              </div>
              <div className="course-body">
                <p>A simple three-part pattern to develop natural, fluent responses.</p>
                <div className="meta">
                  <span>5 min read</span>
                  <span>08 Jul 2026</span>
                </div>
                <a href="#">Read article →</a>
              </div>
            </article>
            <article className="course">
              <div className="course-top">
                <span className="eyebrow">Planning</span>
                <h3>When should you book your exam?</h3>
              </div>
              <div className="course-body">
                <p>Use practice scores—not guesswork—to choose the right test date.</p>
                <div className="meta">
                  <span>7 min read</span>
                  <span>01 Jul 2026</span>
                </div>
                <a href="#">Read article →</a>
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}
