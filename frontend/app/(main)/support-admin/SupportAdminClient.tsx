'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

type Ticket = {
  id: string;
  subject: string;
  body: string | null;
  category: string | null;
  status: string;
  priority: string;
  ai_suggested_reply: string | null;
  created_at: string;
  profiles: Array<{ first_name: string; last_name: string }> | { first_name: string; last_name: string } | null;
};

export function SupportAdminClient({ tickets }: { tickets: Ticket[] }) {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  async function generateReply(id: string) {
    setBusyId(id);
    const { data, error } = await supabase.functions.invoke('suggest-ticket-reply', { body: { ticket_id: id } });
    setBusyId(null);
    if (error) {
      toast('Could not generate a reply — is ANTHROPIC_API_KEY configured?');
      return;
    }
    setDrafts((d) => ({ ...d, [id]: data.reply }));
    router.refresh();
  }

  async function copyReply(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    toast('Reply copied — paste it into email or WhatsApp.');
  }

  async function markResolved(id: string) {
    setBusyId(id);
    const { error } = await supabase
      .from('support_tickets')
      .update({ status: 'resolved', updated_at: new Date().toISOString() })
      .eq('id', id);
    setBusyId(null);
    if (error) {
      toast(error.message);
      return;
    }
    toast('Marked resolved.');
    router.refresh();
  }

  return (
    <div className="panel">
      {tickets.length ? (
        tickets.map((t) => {
          const draft = drafts[t.id] ?? t.ai_suggested_reply ?? '';
          const author = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
          return (
            <div key={t.id} className="panel" style={{ marginBottom: 16, background: 'var(--paper)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <strong>{t.subject}</strong>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {author ? `${author.first_name} ${author.last_name}` : 'Student'} · {t.category ?? 'general'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`status${t.status !== 'resolved' ? ' warn' : ''}`}>{t.status}</span>
                </div>
              </div>
              <p style={{ marginTop: 10, fontSize: 14 }}>{t.body}</p>
              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-outline" disabled={busyId === t.id} onClick={() => generateReply(t.id)}>
                  {busyId === t.id ? 'Drafting…' : 'Generate AI reply'}
                </button>
                {t.status !== 'resolved' && (
                  <button type="button" className="btn btn-dark" disabled={busyId === t.id} onClick={() => markResolved(t.id)}>
                    Mark resolved
                  </button>
                )}
              </div>
              {draft && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>SUGGESTED REPLY (edit before sending)</label>
                  <textarea
                    rows={4}
                    value={draft}
                    onChange={(e) => setDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                  />
                  <button type="button" className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => copyReply(t.id, draft)}>
                    Copy reply
                  </button>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p style={{ color: 'var(--muted)', textAlign: 'center' }}>No support tickets yet.</p>
      )}
    </div>
  );
}
