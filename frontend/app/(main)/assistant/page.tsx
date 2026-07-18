import { AssistantClient } from './AssistantClient';

export default function AssistantPage() {
  return (
    <>
      <header className="page-hero" style={{ padding: '48px 0' }}>
        <div className="shell">
          <span className="eyebrow">Study assistant</span>
          <h1 style={{ fontSize: 48 }}>Ask a question, get a grounded answer.</h1>
          <p>Answers are drawn from AcmeLearn&apos;s own guides where relevant, not generic web search.</p>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell">
          <AssistantClient />
        </div>
      </div>
    </>
  );
}
