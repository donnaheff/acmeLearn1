'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import { functionErrorMessage } from '@/lib/functionError';

export type DeadLetter = {
  id: number;
  provider: string;
  event_id: string | null;
  error: string | null;
  failed_at: string;
  replayed_at: string | null;
};

export function DeadLetterQueue({ events }: { events: DeadLetter[] }) {
  const supabase = useSupabase();
  const router = useRouter();
  const toast = useToast();
  const [busyId, setBusyId] = useState<number | null>(null);

  async function replay(id: number) {
    setBusyId(id);
    const { error } = await supabase.functions.invoke('replay-dead-letter', { body: { id } });
    setBusyId(null);
    if (error) {
      toast(await functionErrorMessage(error));
      return;
    }
    toast('Event replayed and marked processed.');
    router.refresh();
  }

  if (!events.length) {
    return (
      <table className="data-table">
        <tbody>
          <tr>
            <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>
              No failed webhook events
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Provider</th>
          <th>Event</th>
          <th>Failed</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {events.map((e) => (
          <tr key={e.id}>
            <td>{e.provider}</td>
            <td>{e.event_id || '—'}</td>
            <td>{new Date(e.failed_at).toLocaleString()}</td>
            <td>
              {e.replayed_at ? (
                <span className="status">Replayed</span>
              ) : (
                <button className="btn btn-outline" disabled={busyId === e.id} onClick={() => replay(e.id)}>
                  {busyId === e.id ? 'Replaying…' : 'Replay'}
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
