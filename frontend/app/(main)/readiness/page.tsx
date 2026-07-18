import { getSessionProfile } from '@/lib/session';
import { getFeatureFlags } from '@/lib/featureFlags';
import { ReadinessClient } from './ReadinessClient';

export default async function ReadinessPage() {
  const profile = await getSessionProfile();
  const flags = await getFeatureFlags(profile);

  return <ReadinessClient enabled={flags.readiness_forecast} />;
}
