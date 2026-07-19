'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';
import type { Profile } from '@/lib/session';

// Minimal RFC4180-ish parser: handles quoted fields with embedded commas,
// newlines and escaped "" quotes, without pulling in a CSV library for one
// admin import form.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((v) => v.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const EXPECTED_HEADER = ['skill', 'question_type', 'prompt', 'answer', 'difficulty', 'license_source'];

export function QuestionCsvImport({ profile }: { profile: Profile }) {
  const supabase = useSupabase();
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (!rows.length) throw new Error('CSV file is empty.');
      const header = rows[0].map((h) => h.trim().toLowerCase());
      const missing = EXPECTED_HEADER.filter((h) => !header.includes(h));
      if (missing.length) throw new Error(`Missing column(s): ${missing.join(', ')}`);
      const idx = Object.fromEntries(EXPECTED_HEADER.map((h) => [h, header.indexOf(h)]));
      const payload = rows.slice(1).map((r) => ({
        skill: r[idx.skill]?.trim(),
        question_type: r[idx.question_type]?.trim() || null,
        prompt: { text: r[idx.prompt]?.trim() },
        answer: { text: r[idx.answer]?.trim() },
        difficulty: r[idx.difficulty] ? Number(r[idx.difficulty]) : null,
        license_source: r[idx.license_source]?.trim() || null,
        created_by: profile.id,
        status: 'draft',
      }));
      const invalid = payload.filter((p) => !p.skill || !p.prompt.text || !p.answer.text);
      if (invalid.length) throw new Error(`${invalid.length} row(s) missing skill/prompt/answer.`);
      const { error } = await supabase.from('question_items').insert(payload);
      if (error) throw error;
      toast(`Imported ${payload.length} question(s) as drafts for review.`);
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setImporting(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <button
        type="button"
        className="btn btn-outline"
        disabled={importing}
        onClick={() => inputRef.current?.click()}
      >
        {importing ? 'Importing…' : 'Import reviewed CSV'}
      </button>
    </>
  );
}
