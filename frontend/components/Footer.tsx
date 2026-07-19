import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer" id="support">
      <div className="shell">
        <div className="footer-grid">
          <div>
            <Link className="brand" href="/">
              <img className="brand-logo" src="/assets/acmelearn-logo.svg" alt="AcmeLearn logo" />
              <span>AcmeLearn</span>
            </Link>
            <p style={{ maxWidth: 320 }}>
              Focused IELTS preparation for learners ready to move forward—in study, work and life.
            </p>
          </div>
          <div>
            <h4>Learn</h4>
            <div className="footer-links">
              <Link href="/courses">Courses</Link>
              <Link href="/practice">Practice tests</Link>
              <Link href="/resources">Free resources</Link>
            </div>
          </div>
          <div>
            <h4>Support</h4>
            <div className="footer-links">
              <Link href="/support">Help centre</Link>
              <Link href="/meet-your-tutor">Contact your tutor</Link>
              <Link href="/research">Share product feedback</Link>
            </div>
          </div>
          <div>
            <h4>Company</h4>
            <div className="footer-links">
              <Link href="/about">About us</Link>
              <Link href="/careers">Careers</Link>
              <Link href="/terms">Terms &amp; refunds</Link>
              <Link href="/privacy">Privacy controls</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 AcmeLearn Education Ltd.</span>
          <span>IELTS is a registered trademark of its respective owners. AcmeLearn is independent.</span>
        </div>
      </div>
    </footer>
  );
}
