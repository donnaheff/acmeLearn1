import { createClient } from '@/lib/supabase/server';
import defaults from '@/lib/site-content.default.json';

type HomeContent = typeof defaults.home;

export async function getHomeContent(): Promise<HomeContent> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('content_key', 'home')
    .eq('published', true)
    .maybeSingle();
  return { ...defaults.home, ...(data?.value as Partial<HomeContent> | undefined) };
}
