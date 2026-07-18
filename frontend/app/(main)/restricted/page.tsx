import Link from 'next/link';

export default function RestrictedPage() {
  return (
    <main className="page-hero">
      <div className="shell">
        <span className="eyebrow">Access restricted</span>
        <h1>Staff access only.</h1>
        <p>Your account does not have permission to view this area.</p>
        <Link className="btn btn-dark" href="/">
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}
