'use client';

export default function OfflinePage() {
  return (
    <main className="page-hero" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="shell" style={{ textAlign: 'center' }}>
        <img src="/assets/acmelearn-logo.svg" width={70} alt="AcmeLearn" />
        <span className="eyebrow" style={{ display: 'block', marginTop: 20 }}>
          You’re offline
        </span>
        <h1 style={{ fontSize: 52, margin: '15px 0' }}>Your draft is still safe.</h1>
        <p style={{ margin: 'auto' }}>
          Reconnect to sync progress, open lecture links or submit work. Previously cached
          learning pages remain available.
        </p>
        <button
          className="btn btn-coral"
          style={{ marginTop: 25 }}
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    </main>
  );
}
