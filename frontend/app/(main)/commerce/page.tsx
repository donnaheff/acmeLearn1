import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CouponForm } from './CouponForm';
import { PricingForm } from './PricingForm';
import { ScholarshipReview } from './ScholarshipReview';

function money(amountMinor: number, currency = 'NGN') {
  return `${currency} ${(amountMinor / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default async function CommercePage() {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    { data: paidOrdersThisMonth },
    { count: paidCount },
    { count: refundedCount },
    { data: coupons },
    { data: redemptions },
    { count: scholarshipCount },
    { count: scholarshipPendingCount },
    { data: scholarshipApplications },
    { data: refunds },
    { data: referrals },
  ] = await Promise.all([
    supabase.from('orders').select('amount_minor,currency').eq('status', 'paid').gte('paid_at', monthStart.toISOString()),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'refunded'),
    supabase.from('coupons').select('used_count'),
    supabase.from('coupon_redemptions').select('discount_minor'),
    supabase.from('scholarship_applications').select('id', { count: 'exact', head: true }),
    supabase.from('scholarship_applications').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase
      .from('scholarship_applications')
      .select('id,statement,status,discount_percent,created_at,courses(title),profiles!user_id(first_name,last_name)')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('refunds')
      .select('id,amount_minor,reason,status,created_at,orders(provider_reference,currency),requester:profiles!requested_by(first_name,last_name)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('referrals')
      .select('code,reward_minor,status,referrer:profiles!referrer_id(first_name,last_name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const { data: products } = await supabase
    .from('products')
    .select('id,name,amount_minor,currency,billing_type,active')
    .order('amount_minor', { ascending: true });

  const paidTotal = paidOrdersThisMonth?.reduce((sum, o) => sum + (o.amount_minor || 0), 0) ?? 0;
  const paidCurrency = paidOrdersThisMonth?.[0]?.currency ?? 'NGN';
  const refundRate = paidCount ? (((refundedCount ?? 0) / paidCount) * 100).toFixed(1) : '0.0';
  const couponUses = coupons?.reduce((sum, c) => sum + (c.used_count || 0), 0) ?? 0;
  const discountTotal = redemptions?.reduce((sum, r) => sum + (r.discount_minor || 0), 0) ?? 0;

  return (
    <>
      <header className="page-hero" style={{ padding: '45px 0' }}>
        <div className="shell">
          <span className="eyebrow">Revenue operations</span>
          <h1 style={{ fontSize: 48 }}>Payments, discounts and refunds.</h1>
        </div>
      </header>
      <div className="section section-soft">
        <div className="shell">
          <div className="staff-metrics">
            <div className="metric">
              <span className="eyebrow">Paid this month</span>
              <strong>{money(paidTotal, paidCurrency)}</strong>
              <small>{paidOrdersThisMonth?.length ?? 0} transactions</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Refund rate</span>
              <strong>{refundRate}%</strong>
              <small>{refundedCount ?? 0} refunded orders</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Coupon use</span>
              <strong>{couponUses}</strong>
              <small>{money(discountTotal)} discounted</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Scholarships</span>
              <strong>{scholarshipCount ?? 0}</strong>
              <small>{scholarshipPendingCount ?? 0} awaiting review</small>
            </div>
          </div>
          <div className="admin-grid">
            <section>
              <div className="panel">
                <h3>Refund queue</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Learner</th>
                      <th>Amount</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refunds?.length ? (
                      refunds.map((r: any) => (
                        <tr key={r.id}>
                          <td>{r.orders?.provider_reference || '—'}</td>
                          <td>
                            {r.requester?.first_name} {r.requester?.last_name}
                          </td>
                          <td>{money(r.amount_minor || 0, r.orders?.currency)}</td>
                          <td>{r.reason || '—'}</td>
                          <td>
                            <span className={`status${r.status === 'requested' ? ' warn' : ''}`}>
                              {r.status === 'requested' ? 'Review' : r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                          No refund requests
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="panel" style={{ marginTop: 20 }}>
                <h3>Referral controls</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                  Rewards activate only after a verified paid order. Matching payment instruments, devices and
                  self-referrals are held for review.
                </p>
                <table className="data-table">
                  <tbody>
                    {referrals?.length ? (
                      referrals.map((r: any, i: number) => (
                        <tr key={i}>
                          <td>{r.code}</td>
                          <td>{r.referrer?.first_name} {r.referrer?.last_name}</td>
                          <td>{money(r.reward_minor || 0)} pending</td>
                          <td>
                            <span className="status">{r.status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                          No referrals yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <ScholarshipReview applications={(scholarshipApplications as any) ?? []} />
            </section>
            <aside>
              <PricingForm products={products ?? []} />
              <div style={{ marginTop: 20 }}>
                <CouponForm />
              </div>
              <div className="panel" style={{ marginTop: 20 }}>
                <span className="eyebrow">Receipts</span>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Every confirmed payment receives a numbered invoice and downloadable receipt.
                </p>
                <Link className="btn btn-dark" href="/receipts">
                  View receipts →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
