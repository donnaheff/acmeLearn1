import Link from 'next/link';
import { CompareForm } from './CompareForm';
import { getCompareContent } from '@/lib/siteContent';
import { createClient } from '@/lib/supabase/server';
import { getDisplayCurrency, convertFromNgnMinor, formatMoney, type DisplayCurrency } from '@/lib/currency';

async function money(
  row: { amount_minor: number; currency: string; billing_type: string } | undefined,
  displayCurrency: DisplayCurrency,
) {
  if (!row) return '—';
  const shown = row.currency === 'NGN' ? await convertFromNgnMinor(row.amount_minor, displayCurrency) : row.amount_minor;
  const amount = formatMoney(shown, row.currency === 'NGN' ? displayCurrency : row.currency);
  return row.billing_type === 'monthly' ? `${amount}/month` : amount;
}

export default async function ComparePage() {
  const content = await getCompareContent();
  const supabase = await createClient();
  const displayCurrency = await getDisplayCurrency();
  const { data: products } = await supabase
    .from('products')
    .select('name,amount_minor,currency,billing_type')
    .eq('active', true);

  const essentials = products?.find((p) => p.name.includes('Essentials'));
  const accelerator = products?.find((p) => p.name.includes('Accelerator'));
  const proCoaching = products?.find((p) => p.name.includes('Coaching'));
  const [essentialsPrice, acceleratorPrice, proCoachingPrice] = await Promise.all([
    money(essentials, displayCurrency),
    money(accelerator, displayCurrency),
    money(proCoaching, displayCurrency),
  ]);
  const isConverted = displayCurrency !== 'NGN';

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
            <table className="data-table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free</th>
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
                  <td>Trying AcmeLearn out</td>
                  <td>Independent practice</td>
                  <td>Structured Band 7 route</td>
                  <td>Personal intensive support</td>
                </tr>
                <tr>
                  <td>Access</td>
                  <td>Ongoing, limited</td>
                  <td>90 days</td>
                  <td>8 weeks</td>
                  <td>Monthly</td>
                </tr>
                <tr>
                  <td>Diagnostic &amp; practice</td>
                  <td>1 full diagnostic</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Live lectures</td>
                  <td>—</td>
                  <td>—</td>
                  <td>2 each week</td>
                  <td>4 private sessions</td>
                </tr>
                <tr>
                  <td>Writing feedback</td>
                  <td>1 AI check</td>
                  <td>Automated guidance</td>
                  <td>4 marked tasks</td>
                  <td>Unlimited review</td>
                </tr>
                <tr>
                  <td>Speaking feedback</td>
                  <td>—</td>
                  <td>Self-recording</td>
                  <td>2 tutor reviews</td>
                  <td>Private coaching</td>
                </tr>
                <tr>
                  <td>Mock exams</td>
                  <td>—</td>
                  <td>2</td>
                  <td>4</td>
                  <td>4 + tutor debrief</td>
                </tr>
                <tr>
                  <td>Resources guide library</td>
                  <td>—</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>Price</td>
                  <td>
                    <b>Free</b>
                  </td>
                  <td>
                    <b>{essentialsPrice}</b>
                  </td>
                  <td>
                    <b>{acceleratorPrice}</b>
                  </td>
                  <td>
                    <b>{proCoachingPrice}</b>
                  </td>
                </tr>
                {isConverted && (
                  <tr>
                    <td></td>
                    <td colSpan={3} style={{ fontSize: 11, color: 'var(--muted)' }}>
                      Approximate {displayCurrency} equivalent — you&apos;re charged in Nigerian naira (₦) at checkout.
                    </td>
                  </tr>
                )}
                <tr>
                  <td></td>
                  <td>
                    <Link className="btn btn-outline" href="/signup">
                      Get started free
                    </Link>
                  </td>
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
