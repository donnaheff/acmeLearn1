'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export function ClaimForm() {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const publishFrom = data.get('publish_from');
    const publishUntil = data.get('publish_until');
    const payload = {
      claim_key: String(data.get('claim_key')),
      public_text: String(data.get('public_text')),
      metric_definition: String(data.get('metric_definition')),
      sample_size: Number(data.get('sample_size')),
      calculation_method: String(data.get('calculation_method')),
      publish_from: publishFrom ? new Date(String(publishFrom)).toISOString() : null,
      publish_until: publishUntil ? new Date(String(publishUntil)).toISOString() : null,
      status: 'draft',
    };
    const { error } = await supabase.from('marketing_claims').upsert(payload, { onConflict: 'claim_key' });
    if (error) {
      toast(error.message);
    } else {
      toast('Claim saved as a hidden draft for independent approval.');
      formRef.current?.reset();
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <form ref={formRef} id="claimForm" className="panel staff-form" onSubmit={handleSubmit}>
      <span className="eyebrow">Evidence record</span>
      <div>
        <label>CLAIM KEY</label>
        <input required name="claim_key" />
      </div>
      <div>
        <label>PUBLIC TEXT</label>
        <textarea required name="public_text" />
      </div>
      <div>
        <label>METRIC DEFINITION</label>
        <textarea required name="metric_definition" />
      </div>
      <div>
        <label>SAMPLE SIZE</label>
        <input required type="number" min={1} name="sample_size" />
      </div>
      <div>
        <label>CALCULATION METHOD</label>
        <textarea required name="calculation_method" />
      </div>
      <div className="form-grid">
        <div>
          <label>PUBLISH FROM</label>
          <input type="date" name="publish_from" />
        </div>
        <div>
          <label>EXPIRES</label>
          <input type="date" name="publish_until" />
        </div>
      </div>
      <button className="btn btn-coral" type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save for approval →'}
      </button>
    </form>
  );
}
