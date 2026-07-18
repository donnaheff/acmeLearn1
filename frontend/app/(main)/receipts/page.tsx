import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { ReceiptsClient, type Order } from './ReceiptsClient';

export default async function ReceiptsPage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from('orders')
    .select('id,amount_minor,currency,status,paid_at,created_at,products(name),invoices(invoice_number,issued_at)')
    .eq('user_id', profile!.id)
    .order('created_at', { ascending: false });

  return <ReceiptsClient orders={(data || []) as unknown as Order[]} />;
}
