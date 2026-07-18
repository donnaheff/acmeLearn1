import { PilotForm } from './PilotForm';

export default function PilotPage() {
  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <span className="eyebrow">Controlled launch · 20 learners</span>
          <h1 style={{ fontSize: 54 }}>Help shape AcmeLearn’s first cohort.</h1>
          <p>
            The pilot validates learning quality, accessibility and tutor capacity before broader
            sales open. Participation does not guarantee a particular IELTS result.
          </p>
        </div>
      </header>
      <main className="section section-soft">
        <div className="shell admin-grid">
          <section>
            <div className="panel">
              <h2 style={{ fontSize: 34 }}>What the pilot includes</h2>
              <div className="phase-step">
                <b>1</b>
                <span>
                  <strong>Baseline study-level diagnostic</strong>
                  <small style={{ display: 'block' }}>Not an official score prediction</small>
                </span>
              </div>
              <div className="phase-step">
                <b>2</b>
                <span>
                  <strong>Eight weeks of guided preparation</strong>
                  <small style={{ display: 'block' }}>One verified tutor and protected capacity</small>
                </span>
              </div>
              <div className="phase-step">
                <b>3</b>
                <span>
                  <strong>Writing and speaking feedback</strong>
                  <small style={{ display: 'block' }}>Measured turnaround standards</small>
                </span>
              </div>
              <div className="phase-step">
                <b>4</b>
                <span>
                  <strong>Product research participation</strong>
                  <small style={{ display: 'block' }}>
                    Voluntary feedback; learning records remain private
                  </small>
                </span>
              </div>
            </div>
          </section>
          <aside>
            <PilotForm />
          </aside>
        </div>
      </main>
    </>
  );
}
