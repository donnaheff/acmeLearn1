'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export type ScoreReviewRequest = {
  id: string;
  reason: string | null;
  writing_submissions: { question: string } | null;
};

export function ScoreReviewList({ requests }: { requests: ScoreReviewRequest[] }) {
  const supabase = useSupabase();
  const router = useRouter();
  const toast = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function review(id: string) {
    const resolution = prompt('Resolution note for this score review (shown to the student):');
    if (resolution === null) return;
    if (!resolution.trim()) {
      toast('Enter a resolution note first.');
      return;
    }
    setBusyId(id);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('score_review_requests')
      .update({ status: 'resolved', resolution: resolution.trim(), reviewed_by: user?.id })
      .eq('id', id);
    setBusyId(null);
    if (error) {
      toast(error.message);
      return;
    }
    toast('Review resolved and visible to the student.');
    router.refresh();
  }

  if (!requests.length) {
    return <p style={{ color: 'var(--muted)', fontSize: 13 }}>No open score-review requests.</p>;
  }

  return (
    <>
      {requests.map((r) => (
        <div className="recommendation" key={r.id}>
          <div className="rec-icon">{(r.writing_submissions?.question || 'SR').slice(0, 2).toUpperCase()}</div>
          <div>
            <strong>{r.writing_submissions?.question || 'Submission'}</strong>
            <p>&ldquo;{r.reason}&rdquo; · one review permitted</p>
          </div>
          <button className="btn btn-dark" disabled={busyId === r.id} onClick={() => review(r.id)}>
            {busyId === r.id ? 'Saving…' : 'Review'}
          </button>
        </div>
      ))}
    </>
  );
}
