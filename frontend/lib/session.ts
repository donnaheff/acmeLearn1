import { createClient } from '@/lib/supabase/server';

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'tutor' | 'admin';
  phone: string | null;
  timezone: string;
  target_band: number | null;
  whatsapp_opt_in: boolean;
  email_reminders_opt_in: boolean;
  marketing_opt_in: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  email?: string | null;
  pilot?: boolean;
};

export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) return null;

  return { ...profile, email: user.email };
}
