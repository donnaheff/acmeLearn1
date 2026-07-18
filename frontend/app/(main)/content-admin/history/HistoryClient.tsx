'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

type AuditRow = {
  id: number;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_at: string;
};

function summarize(row: AuditRow) {
  const source = row.after_data ?? row.before_data;
  if (!source) return '';
  if (row.entity_type === 'site_content') {
    const value = source.value as Record<string, unknown> | undefined;
    return value ? Object.values(value)[0]?.toString().slice(0, 60) : '';
  }
  return (source.title as string) ?? '';
}

export function HistoryClient({
  rows,
  actorNames,
}: {
  rows: AuditRow[];
  actorNames: Record<string, string>;
}) {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);

  async function restore(row: AuditRow) {
    if (!row.before_data) {
      toast('No earlier version to restore — this was the first save.');
      return;
    }
    if (!window.confirm('Restore this earlier version? The current version will be overwritten.')) return;
    setBusyId(row.id);

    let error: { message: string } | null = null;
    if (row.entity_type === 'site_content') {
      const before = row.before_data as { value: unknown; published: boolean };
      ({ error } = await supabase
        .from('site_content')
        .update({ value: before.value, published: before.published, updated_at: new Date().toISOString() })
        .eq('content_key', row.entity_id));
    } else if (row.action === 'DELETE') {
      const { created_at: _createdAt, ...rest } = row.before_data as Record<string, unknown>;
      ({ error } = await supabase.from('articles').insert({ ...rest, updated_at: new Date().toISOString() }));
    } else {
      const { id: _id, created_at: _createdAt, ...rest } = row.before_data as Record<string, unknown>;
      ({ error } = await supabase
        .from('articles')
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq('id', row.entity_id));
    }

    setBusyId(null);
    if (error) {
      toast(error.message);
    } else {
      toast('Restored.');
      router.refresh();
    }
  }

  return (
    <div className="panel">
      <table className="data-table">
        <thead>
          <tr>
            <th>When</th>
            <th>By</th>
            <th>Type</th>
            <th>Change</th>
            <th>Action</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={row.id}>
                <td>
                  {new Date(row.created_at).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td>{(row.actor_id && actorNames[row.actor_id]) || 'System'}</td>
                <td>{row.entity_type === 'site_content' ? 'Site content' : 'Article'}</td>
                <td>{summarize(row)}</td>
                <td>
                  <span className={`status${row.action !== 'INSERT' ? ' warn' : ''}`}>{row.action}</span>
                </td>
                <td>
                  {row.before_data && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={busyId === row.id}
                      onClick={() => restore(row)}
                    >
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                No changes recorded yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
