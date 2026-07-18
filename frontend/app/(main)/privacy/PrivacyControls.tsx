'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import { functionErrorMessage } from '@/lib/functionError';

export function PrivacyControls({ profileId, email }: { profileId: string; email: string }) {
  const supabase = useSupabase();
  const toast = useToast();
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function exportData() {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('account-privacy', { body: { action: 'export' } });
      if (error) throw error;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      a.download = 'acmelearn-data-export.json';
      a.click();
    } catch (e) {
      toast(await functionErrorMessage(e));
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    const confirmEmail = prompt(`Type ${email || 'your email'} to permanently delete your account:`);
    if (!confirmEmail) return;
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('account-privacy', {
        body: { action: 'delete', confirm_email: confirmEmail },
      });
      if (error) throw error;
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (e) {
      toast(await functionErrorMessage(e));
      setDeleting(false);
    }
  }

  return (
    <div className="promo-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <div className="lecture-note">
        <h3>Download your data</h3>
        <p>Export your profile, enrolments, scores, submissions, attendance, orders and consent history as JSON.</p>
        <button id="exportData" className="btn btn-dark" onClick={exportData} disabled={exporting}>
          {exporting ? 'Preparing export…' : 'Download data export'}
        </button>
      </div>
      <div style={{ background: '#fff1ef', padding: 24 }}>
        <h3>Delete your account</h3>
        <p>
          Permanent deletion removes your profile and associated learner records, subject to legal
          financial-retention requirements.
        </p>
        <button id="deleteAccount" className="btn btn-coral" onClick={deleteAccount} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete account'}
        </button>
      </div>
    </div>
  );
}
