'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import { functionErrorMessage } from '@/lib/functionError';
import { formatMoney as formatAmount } from '@/lib/money';

export type ProductRow = {
  id: string;
  course_id: string | null;
  name: string;
  amount_minor: number;
  currency: string;
  billing_type: 'one_time' | 'monthly' | null;
  display_amount_minor: number;
  display_currency: string;
};

// Marketing copy the products table doesn't store — kept keyed by product name so
// real price/currency/billing_type from the database still drives the actual checkout.
const PRODUCT_META: Record<
  string,
  { eyebrow: string; featured: boolean; features: string[]; buttonClass: string }
> = {
  'Practice Essentials': {
    eyebrow: 'Self-paced',
    featured: false,
    features: ['1,800+ practice questions', 'Two full mock exams', 'Adaptive study plan', '90 days access'],
    buttonClass: 'btn-outline',
  },
  'Complete IELTS Accelerator': {
    eyebrow: 'Most popular',
    featured: true,
    features: ['Eight-week complete course', 'Live Zoom lectures', 'Writing and speaking feedback', 'Private recordings'],
    buttonClass: 'btn-coral',
  },
  'Pro Coaching': {
    eyebrow: 'Personal',
    featured: false,
    features: ['Four private sessions', 'Unlimited writing review', 'Tutor intervention plan', 'Priority support'],
    buttonClass: 'btn-outline',
  },
};

const DEFAULT_META = { eyebrow: 'Plan', featured: false, features: [] as string[], buttonClass: 'btn-outline' };

export function BillingClient({
  products,
  isSignedIn,
  subscriptionsEnabled,
}: {
  products: ProductRow[];
  isSignedIn: boolean;
  subscriptionsEnabled: boolean;
}) {
  const supabase = useSupabase();
  const router = useRouter();
  const toast = useToast();
  const [coupon, setCoupon] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const visibleProducts = products.filter(
    (p) => p.billing_type !== 'monthly' || subscriptionsEnabled,
  );

  async function choosePlan(product: ProductRow) {
    if (!isSignedIn) {
      router.push('/login?required=1&returnTo=/billing');
      return;
    }
    setPendingId(product.id);
    try {
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: { product_id: product.id, provider: 'paystack', coupon_code: coupon || null },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      window.location.href = data.checkout_url;
    } catch (err) {
      toast(await functionErrorMessage(err));
      setPendingId(null);
    }
  }

  return (
    <>
      <div className="shell" style={{ maxWidth: 520, marginBottom: 26 }}>
        <div className="field">
          <label>COUPON OR SCHOLARSHIP CODE</label>
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Enter code before choosing a plan"
          />
        </div>
      </div>
      <div className="shell price-grid">
        {visibleProducts.map((product) => {
          const meta = PRODUCT_META[product.name] ?? DEFAULT_META;
          return (
            <article
              key={product.id}
              className={`price-card${meta.featured ? ' featured' : ''}`}
              data-feature={product.billing_type === 'monthly' ? 'subscriptions' : undefined}
            >
              <span className="eyebrow">{meta.eyebrow}</span>
              <h3>{product.name}</h3>
              <div className="amount">{formatAmount(product.display_amount_minor, product.display_currency)}</div>
              <small>{product.billing_type === 'monthly' ? 'per month' : 'one-time payment'}</small>
              {product.display_currency !== product.currency && (
                <small style={{ display: 'block', color: 'var(--muted)' }}>
                  Approximate — charged in {formatAmount(product.amount_minor, product.currency)} ({product.currency})
                </small>
              )}
              <ul>
                {meta.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                className={`btn ${meta.buttonClass}`}
                style={{ marginTop: 'auto' }}
                disabled={pendingId === product.id}
                onClick={() => choosePlan(product)}
              >
                {pendingId === product.id ? 'Opening secure checkout…' : 'Choose plan'}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}
