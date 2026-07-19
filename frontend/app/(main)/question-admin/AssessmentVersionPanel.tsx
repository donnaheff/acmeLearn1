'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

export type AssessmentVersion = {
  id: string;
  title: string;
  exam_type: string;
  version: number;
  status: string;
  time_limit_minutes: number | null;
};

export function AssessmentVersionPanel({ versions }: { versions: AssessmentVersion[] }) {
  const supabase = useSupabase();
  const router = useRouter();
  const toast = useToast();
  const [busyTitle, setBusyTitle] = useState<string | null>(null);

  // Latest version per title, so "create next version" knows what to increment.
  const latestByTitle = new Map<string, AssessmentVersion>();
  for (const v of versions) {
    const existing = latestByTitle.get(v.title);
    if (!existing || v.version > existing.version) latestByTitle.set(v.title, v);
  }

  async function createNextVersion(title: string, examType: string) {
    setBusyTitle(title);
    const current = latestByTitle.get(title);
    const nextVersion = (current?.version ?? 0) + 1;
    const { error } = await supabase.from('assessment_versions').insert({
      title,
      exam_type: examType,
      version: nextVersion,
      status: 'draft',
      time_limit_minutes: current?.time_limit_minutes ?? null,
    });
    setBusyTitle(null);
    if (error) {
      toast(error.message);
      return;
    }
    toast(`${title} version ${nextVersion} created as draft.`);
    router.refresh();
  }

  async function createNewSet() {
    const title = prompt('Title for the new mock set:');
    if (!title?.trim()) return;
    await createNextVersion(title.trim(), 'academic');
  }

  return (
    <div className="panel" style={{ marginTop: 20 }}>
      <span className="eyebrow">Mock versions</span>
      {latestByTitle.size ? (
        Array.from(latestByTitle.values()).map((v) => (
          <div key={v.title} style={{ marginBottom: 14 }}>
            <h3 style={{ margin: '8px 0' }}>{v.title}</h3>
            <p style={{ color: 'var(--muted)' }}>{v.exam_type} exam</p>
            <div className="course-foot">
              <span className="status">
                Version {v.version} {v.status === 'published' ? 'published' : v.status}
              </span>
              <button
                className="btn btn-dark"
                disabled={busyTitle === v.title}
                onClick={() => createNextVersion(v.title, v.exam_type)}
              >
                {busyTitle === v.title ? 'Creating…' : `Create version ${v.version + 1}`}
              </button>
            </div>
          </div>
        ))
      ) : (
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>No mock sets versioned yet.</p>
      )}
      <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={createNewSet}>
        + New mock set
      </button>
    </div>
  );
}
