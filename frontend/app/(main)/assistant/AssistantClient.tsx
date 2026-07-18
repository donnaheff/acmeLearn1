'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

type Message = {
  role: 'user' | 'assistant';
  text: string;
  sources?: Array<{ title: string; slug: string }>;
};

export function AssistantClient() {
  const supabase = useSupabase();
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  async function send() {
    const question = input.trim();
    if (!question) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('study-assistant-chat', { body: { message: question } });
    setBusy(false);
    if (error) {
      toast('The assistant is unavailable — is ANTHROPIC_API_KEY configured?');
      return;
    }
    setMessages((m) => [...m, { role: 'assistant', text: data.answer, sources: data.sources }]);
  }

  return (
    <div className="panel" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ minHeight: 240, marginBottom: 16 }}>
        {messages.length === 0 && (
          <p style={{ color: 'var(--muted)' }}>
            Try asking something like &ldquo;How do I improve coherence in Task 2?&rdquo; or &ldquo;What does Band 7
            actually require?&rdquo;
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              margin: '12px 0',
              padding: 14,
              borderRadius: 4,
              background: m.role === 'user' ? 'var(--paper)' : '#eef6f4',
              textAlign: m.role === 'user' ? 'right' : 'left',
            }}
          >
            <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{m.text}</p>
            {m.sources && m.sources.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
                From:{' '}
                {m.sources.map((s, si) => (
                  <span key={s.slug}>
                    <Link href={`/resources/${s.slug}`}>{s.title}</Link>
                    {si < m.sources!.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && <p style={{ color: 'var(--muted)' }}>Thinking…</p>}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          style={{ flex: 1 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send();
          }}
          placeholder="Ask a question about IELTS or your preparation…"
        />
        <button type="button" className="btn btn-coral" disabled={busy} onClick={send}>
          Ask →
        </button>
      </div>
    </div>
  );
}
