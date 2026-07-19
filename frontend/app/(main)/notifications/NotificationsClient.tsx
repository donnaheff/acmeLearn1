'use client';

import { useState } from 'react';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export type Notification = {
  id: string;
  title: string;
  body: string | null;
  kind: string | null;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
};

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export type Preferences = {
  whatsapp_opt_in: boolean;
  email_reminders_opt_in: boolean;
  marketing_opt_in: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
};

export function NotificationsClient({
  notifications: initial,
  profileId,
  preferences,
}: {
  notifications: Notification[];
  profileId: string;
  preferences: Preferences;
}) {
  const supabase = useSupabase();
  const toast = useToast();
  const [notifications, setNotifications] = useState(initial);
  const [prefs, setPrefs] = useState(preferences);
  const [saving, setSaving] = useState(false);

  async function savePreferences() {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        whatsapp_opt_in: prefs.whatsapp_opt_in,
        email_reminders_opt_in: prefs.email_reminders_opt_in,
        marketing_opt_in: prefs.marketing_opt_in,
        quiet_hours_start: prefs.quiet_hours_start,
        quiet_hours_end: prefs.quiet_hours_end,
      })
      .eq('id', profileId);
    setSaving(false);
    toast(error ? error.message : 'Preferences saved.');
  }

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    const { error } = await supabase
      .from('in_app_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
    if (error) toast(error.message);
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.read_at);
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from('in_app_notifications')
      .update({ read_at: nowIso })
      .in(
        'id',
        unread.map((n) => n.id),
      );
    toast(error ? error.message : 'All notifications marked as read.');
  }

  return (
    <>
      <header className="page-hero" style={{ padding: '48px 0' }}>
        <div className="shell">
          <span className="eyebrow">Your updates</span>
          <h1 style={{ fontSize: 48 }}>Notification centre.</h1>
        </div>
      </header>
      <main className="section section-soft">
        <div className="shell admin-grid">
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
              <h3>Recent</h3>
              <button id="markAllRead" className="btn btn-outline" onClick={markAllRead}>
                Mark all read
              </button>
            </div>
            <div className="notice-list">
              {notifications.length === 0 && (
                <div className="notice-item">
                  <div>
                    <p>You have no notifications yet.</p>
                  </div>
                </div>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notice-item${n.read_at ? '' : ' unread'}`}
                  onClick={() => !n.read_at && markRead(n.id)}
                  style={{ cursor: n.read_at ? 'default' : 'pointer' }}
                >
                  <div>
                    <span className="rec-tag">
                      {n.kind || 'Update'} · {timeAgo(n.created_at)}
                    </span>
                    <h3>{n.title}</h3>
                    <p>{n.body}</p>
                  </div>
                  {n.action_url && <a href={n.action_url}>Open →</a>}
                </div>
              ))}
            </div>
          </section>
          <aside>
            <div className="panel">
              <span className="eyebrow">Preferences</span>
              <h3 style={{ margin: '10px 0 18px' }}>How we contact you</h3>
              <label className="check">
                <input
                  type="checkbox"
                  checked={prefs.email_reminders_opt_in}
                  onChange={(e) => setPrefs((p) => ({ ...p, email_reminders_opt_in: e.target.checked }))}
                />{' '}
                Academic email reminders
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={prefs.whatsapp_opt_in}
                  onChange={(e) => setPrefs((p) => ({ ...p, whatsapp_opt_in: e.target.checked }))}
                />{' '}
                WhatsApp lecture reminders
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={prefs.marketing_opt_in}
                  onChange={(e) => setPrefs((p) => ({ ...p, marketing_opt_in: e.target.checked }))}
                />{' '}
                Product and marketing updates
              </label>
              <div className="field">
                <label>QUIET HOURS</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="time"
                    value={prefs.quiet_hours_start}
                    onChange={(e) => setPrefs((p) => ({ ...p, quiet_hours_start: e.target.value }))}
                  />
                  <input
                    type="time"
                    value={prefs.quiet_hours_end}
                    onChange={(e) => setPrefs((p) => ({ ...p, quiet_hours_end: e.target.value }))}
                  />
                </div>
              </div>
              <button
                className="btn btn-dark"
                style={{ width: '100%', marginTop: 18 }}
                disabled={saving}
                onClick={savePreferences}
              >
                {saving ? 'Saving…' : 'Save preferences'}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
