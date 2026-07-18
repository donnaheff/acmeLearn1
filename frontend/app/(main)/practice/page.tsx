import { getSessionProfile } from '@/lib/session';
import { PracticeClient } from './PracticeClient';

export default async function PracticePage() {
  const profile = await getSessionProfile();
  return <PracticeClient isSignedIn={!!profile} />;
}
