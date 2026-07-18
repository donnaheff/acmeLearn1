'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

type Product = {
  id: string;
  name: string;
  amount_minor: number;
  currency: string;
  billing_type: string;
  active: boolean;
};

export function PricingForm({ products }: { products: Product[] }) {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, { name: string; amount: string; currency: string; active: boolean }>>(
    Object.fromEntries(
      products.map((p) => [
        p.id,
        { name: p.name, amount: (p.amount_minor / 100).toFixed(2), currency: p.currency, active: p.active },
      ]),
    ),
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  async function save(id: string) {
    const draft = drafts[id];
    const amountMinor = Math.round(Number(draft.amount) * 100);
    if (!draft.name.trim() || Number.isNaN(amountMinor) || amountMinor <= 0) {
      toast('Enter a valid name and a positive price.');
      return;
    }
    setSavingId(id);
    const { error } = await supabase
      .from('products')
      .update({ name: draft.name, amount_minor: amountMinor, currency: draft.currency, active: draft.active })
      .eq('id', id);
    setSavingId(null);
    if (error) {
      toast(error.message);
      return;
    }
    toast('Plan updated — live on /billing and /compare immediately.');
    router.refresh();
  }

  return (
    <div className="panel">
      <div className="section-head" style={{ marginBottom: 12 }}>
        <h3>Plan pricing</h3>
        <span className="eyebrow">Drives /billing and /compare directly</span>
      </div>
      {products.map((p) => {
        const d = drafts[p.id];
        return (
          <div
            key={p.id}
            style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.7fr auto auto', gap: 10, alignItems: 'center', marginBottom: 10 }}
          >
            <input
              value={d.name}
              onChange={(e) => setDrafts((s) => ({ ...s, [p.id]: { ...s[p.id], name: e.target.value } }))}
            />
            <input
              type="number"
              step="0.01"
              min={0}
              value={d.amount}
              onChange={(e) => setDrafts((s) => ({ ...s, [p.id]: { ...s[p.id], amount: e.target.value } }))}
            />
            <input
              value={d.currency}
              maxLength={3}
              onChange={(e) => setDrafts((s) => ({ ...s, [p.id]: { ...s[p.id], currency: e.target.value.toUpperCase() } }))}
            />
            <label className="check" style={{ margin: 0 }}>
              <input
                type="checkbox"
                checked={d.active}
                onChange={(e) => setDrafts((s) => ({ ...s, [p.id]: { ...s[p.id], active: e.target.checked } }))}
              />{' '}
              Active
            </label>
            <button type="button" className="btn btn-outline" disabled={savingId === p.id} onClick={() => save(p.id)}>
              {savingId === p.id ? 'Saving…' : 'Save'}
            </button>
          </div>
        );
      })}
      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
        Billing type ({products.map((p) => p.billing_type).join(', ')}) and which course each plan unlocks aren&apos;t
        editable here — those affect checkout/enrollment logic and need a migration to change safely.
      </p>
    </div>
  );
}
