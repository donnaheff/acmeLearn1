import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { NotificationsClient, type Notification } from './NotificationsClient';

export default async function NotificationsPage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from('in_app_notifications')
    .select('*')
    .eq('user_id', profile!.id)
    .order('created_at', { ascending: false });

  return (
    <NotificationsClient
      notifications={(data || []) as Notification[]}
      profileId={profile!.id}
      preferences={{
        whatsapp_opt_in: profile!.whatsapp_opt_in,
        email_reminders_opt_in: profile!.email_reminders_opt_in,
        marketing_opt_in: profile!.marketing_opt_in,
        quiet_hours_start: String(profile!.quiet_hours_start).slice(0, 5),
        quiet_hours_end: String(profile!.quiet_hours_end).slice(0, 5),
      }}
    />
  );
}
