'use client';

import { useState } from 'react';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export type Order = {
  id: string;
  amount_minor: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  products: { name: string } | null;
  invoices: Array<{ invoice_number: string; issued_at: string }> | { invoice_number: string; issued_at: string } | null;
};

function formatAmount(minor: number, currency: string) {
  return `${currency} ${(minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function invoiceOf(order: Order) {
  return Array.isArray(order.invoices) ? order.invoices[0] : order.invoices;
}

export function ReceiptsClient({ orders }: { orders: Order[] }) {
  const supabase = useSupabase();
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [orderId, setOrderId] = useState(orders[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);

  async function submitRefund(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!orderId) {
      toast('Select an order first.');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('request-refund', {
        body: { order_id: orderId, reason },
      });
      if (error) throw error;
      toast(data?.message || 'Refund request submitted for eligibility review.');
      setReason('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not submit refund request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="page-hero" style={{ padding: '45px 0' }}>
        <div className="shell">
          <span className="eyebrow">Billing history</span>
          <h1 style={{ fontSize: 48 }}>Receipts, invoices and refunds.</h1>
        </div>
      </header>
      <main className="section section-soft">
        <div className="shell admin-grid">
          <section className="panel">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Plan</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5}>No orders yet.</td>
                  </tr>
                )}
                {orders.map((o) => {
                  const inv = invoiceOf(o);
                  return (
                    <tr key={o.id}>
                      <td>{inv?.invoice_number || '—'}</td>
                      <td>{o.products?.name || '—'}</td>
                      <td>
                        {new Date(inv?.issued_at || o.paid_at || o.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>{formatAmount(o.amount_minor, o.currency)}</td>
                      <td>
                        <button className="btn btn-outline" onClick={() => window.print()}>
                          PDF receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
          <aside>
            <div className="panel">
              <span className="eyebrow">Need a refund?</span>
              <h3 style={{ margin: '8px 0' }}>Request review</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                Eligibility depends on purchase date, course usage and completed private services.
              </p>
              <form id="refundForm" className="staff-form" onSubmit={submitRefund}>
                <div>
                  <label>ORDER</label>
                  <select value={orderId} onChange={(e) => setOrderId(e.target.value)}>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.products?.name || o.id} · {formatAmount(o.amount_minor, o.currency)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>REASON</label>
                  <textarea required name="reason" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>
                <button className="btn btn-coral" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Request refund →'}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
