import { createClient } from '@/lib/supabase/server';
import { ClaimForm } from './ClaimForm';

export default async function ClaimsAdminPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase
    .from('marketing_claims')
    .select('*')
    .order('claim_key', { ascending: true });

  return (
    <>
      <header className="page-hero" style={{ padding: '45px 0' }}>
        <div className="shell">
          <span className="eyebrow">Evidence governance</span>
          <h1 style={{ fontSize: 48 }}>Marketing claims and expiry.</h1>
          <p>
            Public outcome claims remain hidden until definition, sample, calculation, approval and publication
            dates are complete.
          </p>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell admin-grid">
          <section>
            <div className="panel">
              <h3>Claim register</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Claim</th>
                    <th>Sample</th>
                    <th>Period</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claims?.length ? (
                    claims.map((c) => (
                      <tr key={c.claim_key}>
                        <td>{c.claim_key}</td>
                        <td>{c.sample_size ?? '—'}</td>
                        <td>
                          {c.date_from && c.date_to
                            ? `${c.date_from} – ${c.date_to}`
                            : 'Not measured'}
                        </td>
                        <td>
                          <span className={`status${c.status !== 'approved' ? ' warn' : ''}`}>
                            {c.status === 'approved' ? 'Approved' : c.status === 'draft' ? 'Hidden' : c.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr>
                        <td>Average band improvement</td>
                        <td>—</td>
                        <td>Not measured</td>
                        <td>
                          <span className="status warn">Hidden</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Feedback under 24 hours</td>
                        <td>Pilot target</td>
                        <td>Launch period</td>
                        <td>
                          <span className="status warn">Target only</span>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          <aside>
            <ClaimForm />
          </aside>
        </div>
      </div>
    </>
  );
}
