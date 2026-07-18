import { createClient } from '@/lib/supabase/server';
import defaults from '@/lib/site-content.default.json';

type ContentKey = keyof typeof defaults;

async function getSection<K extends ContentKey>(key: K): Promise<(typeof defaults)[K]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('content_key', key)
    .eq('published', true)
    .maybeSingle();
  return { ...defaults[key], ...(data?.value as Partial<(typeof defaults)[K]> | undefined) };
}

export const getHomeContent = () => getSection('home');
export const getResourcesContent = () => getSection('resources');
export const getCompareContent = () => getSection('compare');
export const getPilotContent = () => getSection('pilot');
export const getMeetYourTutorContent = () => getSection('meet_your_tutor');
