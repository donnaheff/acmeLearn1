import { getSessionProfile } from '@/lib/session';
import { SpeakingClient } from './SpeakingClient';

export default async function SpeakingPage() {
  const profile = await getSessionProfile();
  return <SpeakingClient profileId={profile!.id} />;
}
