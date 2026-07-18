'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import { functionErrorMessage } from '@/lib/functionError';

type Staff = {
  id: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'tutor' | 'admin';
};

export function TeamAdminClient({ staff }: { staff: Staff[] }) {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'tutor'>('tutor');
  const [inviting, setInviting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function invite() {
    if (!email.trim()) {
      toast('Enter an email address.');
      return;
    }
    setInviting(true);
    const { data, error } = await supabase.functions.invoke('invite-staff-member', {
      body: { email: email.trim(), role },
    });
    setInviting(false);
    if (error) {
      toast(await functionErrorMessage(error));
      return;
    }
    toast(`Invite sent to ${data.email} as ${data.role}.`);
    setEmail('');
    router.refresh();
  }

  async function changeRole(id: string, newRole: 'admin' | 'tutor' | 'student') {
    setBusyId(id);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    setBusyId(null);
    if (error) {
      toast(error.message);
      return;
    }
    toast(newRole === 'student' ? 'Staff access revoked.' : `Role changed to ${newRole}.`);
    router.refresh();
  }

  return (
    <div className="admin-grid">
      <section>
        <div className="panel">
          <div className="section-head" style={{ marginBottom: 12 }}>
            <h3>Current staff</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {staff.length ? (
                staff.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.first_name} {s.last_name}
                    </td>
                    <td>
                      <span className="status">{s.role}</span>
                    </td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      {s.role !== 'admin' && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={busyId === s.id}
                          onClick={() => changeRole(s.id, 'admin')}
                        >
                          Make admin
                        </button>
                      )}
                      {s.role !== 'tutor' && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={busyId === s.id}
                          onClick={() => changeRole(s.id, 'tutor')}
                        >
                          Make tutor
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={busyId === s.id}
                        onClick={() => changeRole(s.id, 'student')}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                    No staff accounts yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <aside>
        <div className="panel">
          <span className="eyebrow">Onboard someone new</span>
          <h3 style={{ margin: '10px 0' }}>Invite by email</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            Sends a real signup invite. If they already have an account, use the table instead to change their
            role.
          </p>
          <div>
            <label>EMAIL</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>
          <div>
            <label>ROLE</label>
            <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'tutor')}>
              <option value="tutor">Tutor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="button" className="btn btn-coral" style={{ width: '100%', marginTop: 10 }} disabled={inviting} onClick={invite}>
            {inviting ? 'Sending invite…' : 'Send invite →'}
          </button>
        </div>
      </aside>
    </div>
  );
}
