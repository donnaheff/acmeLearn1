import { getSessionProfile } from '@/lib/session';
import { WritingClient } from './WritingClient';

export default async function WritingPage() {
  const profile = await getSessionProfile();
  return <WritingClient profileId={profile!.id} />;
}
