import { createClient } from '@/lib/supabase/server';
import { ReplayWebhookButton, RestoreDrillButton } from './MonitoringActions';

const SERVICES: Array<{ label: string; keywords: string[] }> = [
  { label: 'Supabase database', keywords: ['supabase', 'database'] },
  { label: 'Zoom API', keywords: ['zoom'] },
  { label: 'Paystack webhooks', keywords: ['paystack'] },
  { label: 'Stripe webhooks', keywords: ['stripe'] },
  { label: 'Email / WhatsApp', keywords: ['email', 'whatsapp'] },
];

export default async function MonitoringPage() {
  const supabase = await createClient();
  const [{ data: errorEvents }, { data: incidents }] = await Promise.all([
    supabase.from('error_events').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('service_incidents').select('*').neq('status', 'resolved').order('started_at', { ascending: false }),
  ]);

  const serviceStatus = SERVICES.map((s) => {
    const match = incidents?.find((i) =>
      s.keywords.some((k) => (i.service || '').toLowerCase().includes(k)),
    );
    return { ...s, incident: match };
  });

  return (
    <>
      <header className="page-hero" style={{ padding: '45px 0' }}>
        <div className="shell">
          <span className="eyebrow">Reliability centre</span>
          <h1 style={{ fontSize: 48 }}>Platform health and recovery.</h1>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell">
          <div className="staff-metrics">
            <div className="metric">
              <span className="eyebrow">Uptime</span>
              <strong>—</strong>
              <small>Illustrative — no uptime table backs this tile</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Webhook queue</span>
              <strong>—</strong>
              <small>Illustrative — webhook_jobs is service-role only</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Open incidents</span>
              <strong>{incidents?.length ?? 0}</strong>
              <small>From service_incidents</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Recent errors</span>
              <strong style={{ fontSize: 25 }}>{errorEvents?.length ?? 0}</strong>
              <small>Last 50 logged</small>
            </div>
          </div>
          <div className="analytics-grid">
            <div className="panel">
              <span className="eyebrow">Service status</span>
              <table className="data-table">
                <tbody>
                  {serviceStatus.map((s) => (
                    <tr key={s.label}>
                      <td>{s.label}</td>
                      <td>
                        <span className={`status${s.incident ? ' warn' : ''}`}>
                          {s.incident ? s.incident.title || s.incident.severity : 'Operational'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="panel">
              <span className="eyebrow">Error log</span>
              <h3 style={{ margin: '8px 0' }}>Recent error events</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Message</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {errorEvents?.length ? (
                    errorEvents.map((e) => (
                      <tr key={e.id}>
                        <td>{e.page || '—'}</td>
                        <td>{e.message || e.error_code || '—'}</td>
                        <td>{new Date(e.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                        No error events logged
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="panel">
              <span className="eyebrow">Dead-letter queue</span>
              <h3 style={{ margin: '8px 0' }}>Failed webhook events</h3>
              <p style={{ color: 'var(--muted)' }}>
                Events retry with exponential backoff. After five attempts they move here for audited replay.
              </p>
              <table className="data-table">
                <tbody>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                      Illustrative — webhook_dead_letters is service-role only
                    </td>
                  </tr>
                </tbody>
              </table>
              <ReplayWebhookButton />
            </div>
            <div className="panel">
              <span className="eyebrow">Web performance</span>
              <h3 style={{ margin: '8px 0' }}>Core Web Vitals</h3>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>Illustrative — no analytics table backs these values</p>
              <p>
                LCP <b style={{ float: 'right' }}>1.9s</b>
              </p>
              <div className="bar">
                <span style={{ width: '76%' }} />
              </div>
              <p>
                CLS <b style={{ float: 'right' }}>0.04</b>
              </p>
              <div className="bar">
                <span style={{ width: '40%' }} />
              </div>
            </div>
            <div className="panel">
              <span className="eyebrow">Recovery</span>
              <h3 style={{ margin: '8px 0' }}>Backup verification</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                Daily encrypted backup · point-in-time recovery · monthly isolated restore test.
              </p>
              <RestoreDrillButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
