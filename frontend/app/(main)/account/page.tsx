import { getSessionProfile } from '@/lib/session';
import { getFeatureFlags } from '@/lib/featureFlags';
import { AccountClient } from './AccountClient';

export default async function AccountPage() {
  const profile = await getSessionProfile();
  const flags = await getFeatureFlags(profile);

  return <AccountClient profile={profile!} referralsEnabled={flags.referrals} />;
}
