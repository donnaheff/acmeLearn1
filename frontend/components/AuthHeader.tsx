import Link from 'next/link';

export function AuthHeader({
  backHref,
  backLabel,
  showTopBar = false,
}: {
  backHref: string;
  backLabel: string;
  showTopBar?: boolean;
}) {
  return (
    <>
      {showTopBar && (
        <div className="topbar">
          <div className="shell">
            <span>IELTS coaching for ambitious learners</span>
            <div className="toplinks">
              <Link href="/resources">Insights</Link>
              <Link href="/#support">Support</Link>
            </div>
          </div>
        </div>
      )}
      <nav className="mainnav">
        <div className="shell">
          <Link className="brand" href="/">
            <img className="brand-logo" src="/assets/acmelearn-logo.svg" alt="AcmeLearn logo" />
            <span>AcmeLearn</span>
          </Link>
          {showTopBar && (
            <div className="navlinks">
              <Link href="/courses">Courses</Link>
              <Link href="/practice">Practice</Link>
              <Link href="/resources">Resources</Link>
            </div>
          )}
          <Link href={backHref} style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700 }}>
            {backLabel}
          </Link>
        </div>
      </nav>
    </>
  );
}
