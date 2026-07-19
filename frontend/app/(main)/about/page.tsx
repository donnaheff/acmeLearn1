export const metadata = { title: 'About AcmeLearn' };

export default function AboutPage() {
  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <span className="eyebrow">Our story</span>
          <h1 style={{ fontSize: 52 }}>Focused IELTS preparation, built around you.</h1>
          <p>
            AcmeLearn provides independent IELTS preparation for learners ready to move
            forward — in study, work and life.
          </p>
        </div>
      </header>
      <main className="section">
        <div className="shell legal">
          <h2>Why we started</h2>
          <p>
            Most IELTS preparation is either generic self-study or expensive one-off coaching.
            AcmeLearn combines adaptive practice, real criterion-level feedback and live tutor
            support in one place, so a learner&apos;s target band drives what they study next
            rather than a fixed syllabus.
          </p>
          <h2>Where we are today</h2>
          <p>
            AcmeLearn is currently in a controlled pilot with a single founding tutor, Paulyn
            Moneke, so that every learner gets consistent, hands-on feedback while the platform is
            proven out. Additional tutors will only join after verification, observation and
            quality review — see <a href="/meet-your-tutor">Meet your tutor</a> for details.
          </p>
          <h2>Independence</h2>
          <p>
            AcmeLearn is not affiliated with or endorsed by the owners of IELTS. IELTS is a
            registered trademark of its respective owners.
          </p>
          <h2>Get in touch</h2>
          <p>
            Questions, feedback or partnership enquiries — reach us through the{' '}
            <a href="/support">help centre</a>.
          </p>
        </div>
      </main>
    </>
  );
}
