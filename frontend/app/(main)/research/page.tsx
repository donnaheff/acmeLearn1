import { getSessionProfile } from '@/lib/session';
import { ResearchForm } from './ResearchForm';

export default async function ResearchPage() {
  const profile = await getSessionProfile();

  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <span className="eyebrow">Real-user research</span>
          <h1 style={{ fontSize: 50 }}>Help improve AcmeLearn.</h1>
          <p>
            Tell us about a journey you completed. Feedback is reviewed in aggregate and never
            affects your learning record.
          </p>
        </div>
      </header>
      <main className="section section-soft">
        <div className="shell">
          <ResearchForm userId={profile?.id ?? null} />
        </div>
      </main>
    </>
  );
}
