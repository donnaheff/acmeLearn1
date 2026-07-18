import { createClient } from '@/lib/supabase/server';
import { RecordingsClient, type Recording } from './RecordingsClient';

export default async function RecordingsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('recordings')
    .select('id,title,duration_seconds,available_until,lectures(courses(title))')
    .eq('published', true)
    .order('created_at', { ascending: false });

  const recordings = (data || []) as unknown as Recording[];

  return <RecordingsClient recordings={recordings} />;
}
