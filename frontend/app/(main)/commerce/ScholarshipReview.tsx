'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export type ScholarshipApplication = {
  id: string;
  statement: string | null;
  status: string;
  discount_percent: number | null;
  created_at: string;
  courses: { title: string } | null;
  profiles: { first_name: string; last_name: string } | null;
};

export function ScholarshipReview({ applications }: { applications: ScholarshipApplication[] }) {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [discountDrafts, setDiscountDrafts] = useState<Record<string, string>>({});

  async function approve(id: string) {
    const discount = Number(discountDrafts[id] ?? 25);
    if (!discount || discount <= 0 || discount > 100) {
      toast('Enter a discount percentage between 1 and 100.');
      return;
    }
    setBusyId(id);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('scholarship_applications')
      .update({ status: 'approved', discount_percent: discount, reviewed_by: user?.id })
      .eq('id', id);
    setBusyId(null);
    if (error) {
      toast(error.message);
      return;
    }
    toast(`Approved with ${discount}% off — applies automatically at checkout for that course.`);
    router.refresh();
  }

  async function reject(id: string) {
    setBusyId(id);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('scholarship_applications')
      .update({ status: 'rejected', reviewed_by: user?.id })
      .eq('id', id);
    setBusyId(null);
    if (error) {
      toast(error.message);
      return;
    }
    toast('Application rejected.');
    router.refresh();
  }

  return (
    <div className="panel" style={{ marginTop: 20 }}>
      <h3>Scholarship applications</h3>
      {applications.length ? (
        applications.map((a) => (
          <div key={a.id} style={{ borderTop: '1px solid var(--line)', padding: '14px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <strong>
                  {a.profiles?.first_name} {a.profiles?.last_name}
                </strong>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.courses?.title || '—'}</div>
              </div>
              <span className={`status${a.status === 'submitted' ? ' warn' : ''}`}>{a.status}</span>
            </div>
            <p style={{ fontSize: 13, margin: '8px 0' }}>{a.statement}</p>
            {a.status === 'submitted' ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="25"
                  style={{ width: 70 }}
                  value={discountDrafts[a.id] ?? ''}
                  onChange={(e) => setDiscountDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
                />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>% off</span>
                <button
                  type="button"
                  className="btn btn-coral"
                  disabled={busyId === a.id}
                  onClick={() => approve(a.id)}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={busyId === a.id}
                  onClick={() => reject(a.id)}
                >
                  Reject
                </button>
              </div>
            ) : (
              a.discount_percent != null && <small>{a.discount_percent}% off approved</small>
            )}
          </div>
        ))
      ) : (
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>No scholarship applications yet.</p>
      )}
    </div>
  );
}
