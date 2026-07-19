-- feature_flags rows with audience='pilot' (subscriptions, ai_recommendations,
-- readiness_forecast, referrals, scholarships, tutor_marketplace, whatsapp) can
-- only resolve true when profile.pilot === true (see lib/featureFlags.ts). That
-- column never existed on public.profiles, so every 'pilot' audience flag was
-- permanently unreachable regardless of its enabled value. Default true treats
-- every current user as being in the pilot, matching this product's actual
-- current stage and restoring the audience-gating system to working order.
alter table public.profiles add column if not exists pilot boolean not null default true;
