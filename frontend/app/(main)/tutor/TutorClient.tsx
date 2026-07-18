'use client';

import { useState } from 'react';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import { functionErrorMessage } from '@/lib/functionError';

export function StartHostLectureButton({ lectureId }: { lectureId: string | null }) {
  const supabase = useSupabase();
  const toast = useToast();
  const [label, setLabel] = useState('Start lecture →');
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!lectureId) {
      toast('No upcoming lecture is assigned.');
      return;
    }
    setBusy(true);
    setLabel('Authorising host…');
    const { data, error } = await supabase.functions.invoke('get-host-access', { body: { lecture_id: lectureId } });
    if (error) {
      toast(await functionErrorMessage(error));
      setLabel('Start lecture →');
      setBusy(false);
      return;
    }
    if (data?.start_url) {
      location.href = data.start_url;
    }
  }

  return (
    <button id="startHostLecture" className="btn btn-coral" onClick={handleClick} disabled={busy}>
      {label}
    </button>
  );
}

type AttendanceRow = { student: string; joined: string; duration: number };

export function ExportAttendanceCsvButton({ rows }: { rows: AttendanceRow[] }) {
  function handleExport() {
    const lines = [
      ['Student', 'Joined', 'Duration', 'Attendance'].join(','),
      ...rows.map((r) =>
        [r.student, r.joined, `${r.duration} min`, r.duration >= 30 ? 'Present' : r.duration > 0 ? 'Late' : 'Absent']
          .map((c) => `"${String(c).replaceAll('"', '""')}"`)
          .join(','),
      ),
    ];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    a.download = 'acmelearn-attendance.csv';
    a.click();
  }

  return (
    <button className="btn btn-outline" onClick={handleExport}>
      Export CSV
    </button>
  );
}
