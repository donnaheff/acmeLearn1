import { createClient } from '@/lib/supabase/server';

export const FLAG_DEFAULTS = {
  core_learning: true,
  live_classes: true,
  payments: true,
  subscriptions: false,
  referrals: false,
  scholarships: false,
  tutor_marketplace: false,
  whatsapp: false,
  readiness_forecast: false,
  multi_organization: false,
  ai_recommendations: false,
} as const;

export type FlagName = keyof typeof FLAG_DEFAULTS;
export type Flags = Record<FlagName, boolean>;

type Profile = { id: string; email?: string | null; role?: string | null; pilot?: boolean | null };

// Deterministic per-user bucket, ported from feature-flags.js: same rollout_percentage
// always resolves the same way for a given user, so a flag doesn't flicker on refresh.
function bucket(identity: string, flag: string) {
  let hash = 0;
  const input = `${identity}:${flag}`;
  for (const char of input) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 100;
}

export async function getFeatureFlags(profile: Profile | null): Promise<Flags> {
  const flags: Flags = { ...FLAG_DEFAULTS };
  const supabase = await createClient();
  const { data: rows, error } = await supabase.from('feature_flags').select('*');
  if (error || !rows) return flags;

  const identity = profile?.id || profile?.email || 'anon';
  for (const row of rows as Array<{
    flag: string;
    enabled: boolean;
    audience: string;
    rollout_percentage: number;
  }>) {
    if (!(row.flag in flags)) continue;
    const audienceMatches =
      row.audience === 'all' ||
      row.audience === profile?.role ||
      (row.audience === 'pilot' && profile?.pilot === true);
    flags[row.flag as FlagName] =
      row.enabled && audienceMatches && bucket(identity, row.flag) < row.rollout_percentage;
  }
  return flags;
}
