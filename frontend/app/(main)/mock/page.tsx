import { getSessionProfile } from '@/lib/session';
import { MockClient } from './MockClient';

export default async function MockPage() {
  const profile = await getSessionProfile();
  return <MockClient profileId={profile!.id} />;
}
