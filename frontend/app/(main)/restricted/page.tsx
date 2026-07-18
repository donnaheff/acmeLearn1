import Link from 'next/link';

export default function RestrictedPage({ searchParams }: { searchParams: { reason?: string } }) {
  const isPaidGate = searchParams.reason === 'paid';

  return (
    <main className="page-hero">
      <div className="shell">
        {isPaidGate ? (
          <>
            <span className="eyebrow">Paid clients only</span>
            <h1>Resources are part of a paid plan.</h1>
            <p>Choose a plan to unlock every guide, or sign in with an account that already has one.</p>
            <Link className="btn btn-coral" href="/billing">
              View plans →
            </Link>
          </>
        ) : (
          <>
            <span className="eyebrow">Access restricted</span>
            <h1>Staff access only.</h1>
            <p>Your account does not have permission to view this area.</p>
            <Link className="btn btn-dark" href="/">
              Return to dashboard
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
