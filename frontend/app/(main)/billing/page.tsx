import { getSessionProfile } from '@/lib/session';
import { getFeatureFlags } from '@/lib/featureFlags';
import { createClient } from '@/lib/supabase/server';
import { getDisplayCurrency, convertFromNgnMinor } from '@/lib/currency';
import { BillingClient, type ProductRow } from './BillingClient';

export default async function BillingPage() {
  const profile = await getSessionProfile();
  const flags = await getFeatureFlags(profile);
  const supabase = await createClient();
  const displayCurrency = await getDisplayCurrency();
  const { data } = await supabase
    .from('products')
    .select('id,course_id,name,amount_minor,currency,billing_type')
    .eq('active', true)
    .order('amount_minor', { ascending: true });

  const products = await Promise.all(
    (data ?? []).map(async (p) => ({
      ...p,
      display_amount_minor: p.currency === 'NGN' ? await convertFromNgnMinor(p.amount_minor, displayCurrency) : p.amount_minor,
      display_currency: p.currency === 'NGN' ? displayCurrency : p.currency,
    })),
  );

  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <span className="eyebrow">Flexible preparation</span>
          <h1 style={{ fontSize: 52 }}>Choose how you learn.</h1>
          <p>
            Secure local payment through Paystack or international checkout through Stripe.
            Course access activates only after a verified payment webhook.
          </p>
        </div>
      </header>
      <main className="section section-soft">
        <div className="shell">
          <div className="auth-alert">
            <strong>Current cohort availability:</strong> 4 places remain. Enrolment pauses
            automatically at the tutor’s safe capacity limit.
          </div>
        </div>
        <BillingClient
          products={products as ProductRow[]}
          isSignedIn={!!profile}
          subscriptionsEnabled={flags.subscriptions}
        />
        <div className="shell" style={{ textAlign: 'center', marginTop: 25, color: 'var(--muted)', fontSize: 13 }}>
          Paystack · Stripe · Visa · Mastercard · Verve · Bank transfer
        </div>
      </main>
    </>
  );
}
