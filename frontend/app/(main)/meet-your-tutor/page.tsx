export default function MeetYourTutorPage() {
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
              <span className="verified">Founding tutor profile</span>
              <h1 style={{ fontSize: 52, margin: '15px 0' }}>Paulyn Moneke</h1>
              <p>AcmeLearn’s founding IELTS tutor and academic-English specialist.</p>
              <p>Launch profile · learner reviews begin after the pilot</p>
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
            <div className="panel">
              <span className="eyebrow">Next available sessions</span>
              <h3 style={{ margin: '10px 0 18px' }}>Book 1:1 coaching</h3>
              <label className="option">
                <input type="radio" name="slot" value="2026-07-17T16:00:00Z" defaultChecked /> Fri 17
                Jul · 5:00 PM WAT
              </label>
              <label className="option">
                <input type="radio" name="slot" value="2026-07-18T12:00:00Z" /> Sat 18 Jul · 1:00 PM
                WAT
              </label>
              <label className="option">
                <input type="radio" name="slot" value="2026-07-20T17:30:00Z" /> Mon 20 Jul · 6:30 PM
                WAT
              </label>
              <div className="course-foot" style={{ margin: '20px 0' }}>
                <strong>GH₵18,000</strong>
                <span>50 minutes</span>
              </div>
              <button className="btn btn-coral" id="bookCoaching" style={{ width: '100%' }}>
                Reserve selected time →
              </button>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                Sessions are delivered through AcmeLearn Zoom access. Off-platform payments are
                prohibited.
              </p>
            </div>
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
