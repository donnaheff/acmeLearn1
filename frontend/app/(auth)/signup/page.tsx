import { getFeatureFlags } from '@/lib/featureFlags';
import { SignupForm } from './SignupForm';

export default async function SignupPage() {
  const flags = await getFeatureFlags(null);
  return <SignupForm whatsappEnabled={flags.whatsapp} />;
}
