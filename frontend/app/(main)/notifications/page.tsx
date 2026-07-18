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

  return <NotificationsClient notifications={(data || []) as Notification[]} />;
}
