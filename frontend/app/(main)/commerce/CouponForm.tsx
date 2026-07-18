'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export function CouponForm() {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const endsAt = data.get('ends_at');
    const maxUses = data.get('max_uses');
    const payload = {
      code: String(data.get('code')).toUpperCase(),
      discount_type: String(data.get('discount_type')),
      discount_value: Number(data.get('discount_value')),
      max_uses: maxUses ? Number(maxUses) : null,
      ends_at: endsAt ? new Date(String(endsAt)).toISOString() : null,
      active: true,
    };
    const { error } = await supabase.from('coupons').insert(payload);
    if (error) {
      toast(error.message);
    } else {
      toast('Coupon created with an audit record.');
      formRef.current?.reset();
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <form ref={formRef} id="couponForm" className="panel staff-form" onSubmit={handleSubmit}>
      <span className="eyebrow">New promotion</span>
      <h3>Create coupon</h3>
      <div>
        <label>CODE</label>
        <input required name="code" placeholder="LAUNCH20" />
      </div>
      <div>
        <label>TYPE</label>
        <select name="discount_type" defaultValue="percent">
          <option value="percent">Percentage</option>
          <option value="fixed">Fixed amount</option>
        </select>
      </div>
      <div>
        <label>VALUE</label>
        <input required name="discount_value" type="number" min={1} />
      </div>
      <div>
        <label>MAXIMUM USES</label>
        <input name="max_uses" type="number" min={1} />
      </div>
      <div>
        <label>EXPIRES</label>
        <input name="ends_at" type="datetime-local" />
      </div>
      <button className="btn btn-coral" type="submit" disabled={submitting}>
        {submitting ? 'Creating…' : 'Create audited coupon →'}
      </button>
    </form>
  );
}
