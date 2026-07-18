import { createClient } from '@/lib/supabase/server';
import { LecturesClient, type Lecture } from './LecturesClient';

export default async function LecturesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('lectures')
    .select(
      'id,title,starts_at,duration_minutes,platform,access_opens_at,access_closes_at,courses(title),profiles!lectures_tutor_id_fkey(first_name,last_name)',
    )
    .in('status', ['scheduled', 'live'])
    .order('starts_at', { ascending: true });

  const lectures = (data || []) as unknown as Lecture[];

  return <LecturesClient lectures={lectures} />;
}
