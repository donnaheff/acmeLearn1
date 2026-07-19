'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export type ReleaseRecord = {
  id: string;
  version: string;
  environment: string;
  status: string;
  migration_check: boolean;
  tests_passed: boolean;
  accessibility_passed: boolean;
  backup_verified: boolean;
  rollback_plan: string | null;
};

export function ReleaseControlPanel({ release }: { release: ReleaseRecord | null }) {
  const supabase = useSupabase();
  const router = useRouter();
  const toast = useToast();
  const [showRollback, setShowRollback] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [version, setVersion] = useState('');
  const [rollbackPlan, setRollbackPlan] = useState('');
  const [saving, setSaving] = useState(false);

  async function logRelease() {
    if (!version.trim() || !rollbackPlan.trim()) {
      toast('Enter a version and a rollback plan.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('release_records').insert({
      version: version.trim(),
      environment: 'staging',
      rollback_plan: rollbackPlan.trim(),
    });
    setSaving(false);
    if (error) {
      toast(error.message);
      return;
    }
    toast('Release recorded.');
    setShowForm(false);
    setVersion('');
    setRollbackPlan('');
    router.refresh();
  }

  if (!release) {
    return (
      <div className="panel" style={{ marginTop: 20 }}>
        <span className="eyebrow">Release tracking</span>
        <h3 style={{ margin: '8px 0' }}>No release recorded yet</h3>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Log a version and its rollback plan before the first staging approval.
        </p>
        {showForm ? (
          <>
            <div className="field">
              <label>VERSION</label>
              <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="0.9.0" />
            </div>
            <div className="field">
              <label>ROLLBACK PLAN</label>
              <textarea
                rows={4}
                style={{ width: '100%' }}
                value={rollbackPlan}
                onChange={(e) => setRollbackPlan(e.target.value)}
                placeholder="Steps to revert this release if something goes wrong…"
              />
            </div>
            <button className="btn btn-coral" disabled={saving} onClick={logRelease}>
              {saving ? 'Saving…' : 'Log release'}
            </button>
          </>
        ) : (
          <button className="btn btn-outline" onClick={() => setShowForm(true)}>
            Log this release
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="panel" style={{ marginTop: 20 }}>
      <span className="eyebrow">Release {release.version}</span>
      <h3 style={{ margin: '8px 0' }}>Staging approval</h3>
      <div className="phase-step">
        <b>{release.migration_check ? '✓' : '—'}</b>
        <span>Migration check</span>
      </div>
      <div className="phase-step">
        <b>{release.tests_passed ? '✓' : '—'}</b>
        <span>Automated security tests</span>
      </div>
      <div className="phase-step">
        <b>{release.accessibility_passed ? '✓' : '—'}</b>
        <span>Accessibility audit</span>
      </div>
      <div className="phase-step">
        <b>{release.backup_verified ? '✓' : '—'}</b>
        <span>Backup verified</span>
      </div>
      {showRollback && (
        <p style={{ fontSize: 13, whiteSpace: 'pre-line', background: 'var(--paper)', padding: 12, marginTop: 10 }}>
          {release.rollback_plan || 'No rollback plan recorded for this release.'}
        </p>
      )}
      <button
        className="btn btn-outline"
        style={{ width: '100%', marginTop: 15 }}
        onClick={() => setShowRollback((v) => !v)}
      >
        {showRollback ? 'Hide rollback plan' : 'View rollback plan'}
      </button>
    </div>
  );
}
