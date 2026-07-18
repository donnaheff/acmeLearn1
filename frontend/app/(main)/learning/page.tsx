import { getSessionProfile } from '@/lib/session';
import { LearningClient } from './LearningClient';

export default async function LearningPage() {
  const profile = await getSessionProfile();
  return <LearningClient signedIn={!!profile} profileId={profile?.id ?? null} />;
}
