import Link from 'next/link';
import { CompareForm } from './CompareForm';
import { getCompareContent } from '@/lib/siteContent';

export default async function ComparePage() {
  const content = await getCompareContent();
  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <span className="eyebrow">{content.eyebrow}</span>
          <h1 style={{ fontSize: 52 }}>{content.heading}</h1>
          <p>{content.body}</p>
        </div>
      </header>
      <main className="section section-soft">
        <div className="shell">
          <CompareForm />
          <div className="panel" style={{ marginTop: 25, overflow: 'auto' }}>
            <table className="data-table" style={{ minWidth: 760 }}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Practice Essentials</th>
                  <th>Complete Accelerator</th>
                  <th>Pro Coaching</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <b>Best for</b>
                  </td>
                  <td>Independent practice</td>
                  <td>Structured Band 7 route</td>
                  <td>Personal intensive support</td>
                </tr>
                <tr>
                  <td>Access</td>
                  <td>90 days</td>
                  <td>8 weeks</td>
                  <td>Monthly</td>
                </tr>
                <tr>
                  <td>Live lectures</td>
                  <td>—</td>
                  <td>2 each week</td>
                  <td>4 private sessions</td>
                </tr>
                <tr>
                  <td>Writing feedback</td>
                  <td>Automated guidance</td>
                  <td>4 marked tasks</td>
                  <td>Unlimited review</td>
                </tr>
                <tr>
                  <td>Speaking feedback</td>
                  <td>Self-recording</td>
                  <td>2 tutor reviews</td>
                  <td>Private coaching</td>
                </tr>
                <tr>
                  <td>Mock exams</td>
                  <td>2</td>
                  <td>4</td>
                  <td>4 + tutor debrief</td>
                </tr>
                <tr>
                  <td>Price</td>
                  <td>
                    <b>GH₵19,000</b>
                  </td>
                  <td>
                    <b>GH₵74,000</b>
                  </td>
                  <td>
                    <b>GH₵38,000/month</b>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <Link className="btn btn-outline" href="/billing">
                      Choose
                    </Link>
                  </td>
                  <td>
                    <Link className="btn btn-coral" href="/billing">
                      Choose
                    </Link>
                  </td>
                  <td>
                    <Link className="btn btn-outline" href="/billing">
                      Choose
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
