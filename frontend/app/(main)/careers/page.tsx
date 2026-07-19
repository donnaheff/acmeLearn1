export const metadata = { title: 'Careers at AcmeLearn' };

export default function CareersPage() {
  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <span className="eyebrow">Join us</span>
          <h1 style={{ fontSize: 52 }}>Careers.</h1>
          <p>AcmeLearn is a small, single-tutor pilot right now — here&apos;s where things stand.</p>
        </div>
      </header>
      <main className="section">
        <div className="shell legal">
          <h2>No open roles at the moment</h2>
          <p>
            We&apos;re intentionally starting small, with one verified founding tutor, so we can
            prove out the model before growing the team. We are not currently hiring tutors,
            engineers or support staff.
          </p>
          <h2>Interested for later?</h2>
          <p>
            As AcmeLearn grows past the pilot, tutor and team roles will be posted here first,
            after the same verification and quality review every tutor goes through today. If
            you&apos;d like us to keep you in mind, reach out through the{' '}
            <a href="/support">help centre</a> with a short note about your background.
          </p>
        </div>
      </main>
    </>
  );
}
