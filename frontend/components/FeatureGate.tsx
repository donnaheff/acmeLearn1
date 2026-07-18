import type { FlagName, Flags } from '@/lib/featureFlags';

export function FeatureGate({
  flag,
  flags,
  children,
}: {
  flag: FlagName;
  flags: Flags;
  children: React.ReactNode;
}) {
  if (!flags[flag]) return null;
  return <>{children}</>;
}
