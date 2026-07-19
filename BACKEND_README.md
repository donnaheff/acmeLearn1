# AcmeLearn — latest build

This folder is the consolidated delivery package for the AcmeLearn web, Android, iOS, backend and database projects.

## Live deployment status

A Supabase project (`acmelearn`, ref `lydeuuixyccskuepvszk`, region `eu-west-1`, org "donnaheff's Org") is
provisioned and wired into `web/config.js` and `mobile/config.js` (`DEMO_MODE: false`). Deployed:

- All 6 `database/*.sql` files except `cron.sql` (schema, phase/launch/operational extensions, seed, launch_seed).
- All 15 Edge Functions in `supabase/functions/`.

Two source bugs were fixed to make the schema deployable on current Postgres (same RLS/capacity/consent
logic, no behavior change):
- `current_role` collided with the reserved `CURRENT_ROLE` SQL keyword inside `create policy ... using(...)`
  clauses, causing a syntax error. Renamed to `acme_role` everywhere (function + all call sites).
- `lectures.access_opens_at`/`access_closes_at` were declared as `GENERATED ALWAYS AS (...) STORED` columns,
  but `timestamptz +/- interval` is `STABLE`, not `IMMUTABLE`, which Postgres generated columns require.
  Replaced with a `BEFORE INSERT OR UPDATE` trigger (`set_lecture_access_window`) that computes the same
  two values.
- `operational_extensions.sql`'s `data_quality_findings` view referenced `notifications.created_at`, a
  column that doesn't exist on that table; changed to `notifications.scheduled_for`.

Still outstanding before this is production-ready (by design — these need the organization's real accounts):
- `database/cron.sql` (needs `CRON_SECRET` and the deployed function URLs).
- Third-party secrets: `ZOOM_*`, `PAYSTACK_SECRET_KEY`, `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`,
  `RESEND_API_KEY`/`EMAIL_FROM`, `TWILIO_*`, `LINK_ENCRYPTION_KEY` — set with `supabase secrets set KEY=value`.
  Until set, Zoom/payment/email/WhatsApp flows will error at call time; everything else (auth, profiles,
  courses, enrollments, diagnostics, writing/speaking submissions, feature flags, support tickets, etc.)
  works against the live database now.
- `platform_settings.launch_tutor_id` (needed by `book-coaching`) — set once the tutor's account exists:
  `insert into platform_settings(key,value) values('launch_tutor_id','{"id":"<tutor-profile-uuid>"}')`.
- All 9 `launch_checks` rows still read `status: 'pending'` (demo_off, supabase, zoom, paystack, staff_mfa,
  support, legal, restore, https) — update them as each is actually verified.

## Contents

- `frontends/web/` — deployable responsive web/PWA frontend.
- `frontends/mobile/www/` — mobile-optimized bundled web frontend.
- `frontends/mobile/android/` — generated Android Studio/Capacitor project.
- `frontends/mobile/ios/` — generated Xcode/Capacitor project.
- `frontends/mobile/assets/` — Android/iOS icon and splash masters.
- `backend/supabase/functions/` — Supabase Edge Functions.
- `backend/supabase/config.toml` — Edge Function deployment configuration.
- `database/` — ordered PostgreSQL/Supabase schemas, policies, seeds and cron configuration.
- `tests/` — structural, security, performance and Playwright tests.
- `docs/` — environment template, compliance, analytics and release documentation.
- `releases/` — packaged web release, Android debug APK and native source archives.

## Mobile implementation

The mobile applications use Capacitor 7 and share the latest AcmeLearn frontend. Native integrations include:

- Android and iOS projects
- platform-specific icons and splash screens
- safe-area-aware mobile layout
- five-tab native-style navigation
- offline/network status
- microphone permission for speaking practice
- local lecture notifications
- native external browser for Zoom and payment checkout
- OAuth deep-link callback: `com.acmelearn.app://auth-callback`
- Android back-button behavior
- status bar, keyboard and splash-screen integration

## Release artifacts

- `releases/AcmeLearn-web.zip` — deployable static web frontend.
- `releases/AcmeLearn-android-debug.apk` — installable debug APK for QA only.
- `releases/AcmeLearn-android-source.zip` — Android project and bundled frontend.
- `releases/AcmeLearn-ios-source.zip` — Xcode project and bundled frontend.
- `releases/SHA256SUMS.txt` — artifact checksums.

The Android APK is debug-signed and must not be uploaded to Google Play. Produce an Android App Bundle (`.aab`) with the organization’s private release key for production.

An iOS `.ipa` cannot be signed on this Linux build host. Open `frontends/mobile/ios/App/App.xcworkspace` on macOS with Xcode, select the organization’s Apple Developer team, configure signing and archive for TestFlight/App Store distribution.

## Database migration order

Run in this order:

1. `database/schema.sql`
2. `database/phase_extensions.sql`
3. `database/launch_extensions.sql`
4. `database/operational_extensions.sql`
5. `database/app_extensions.sql` (articles CMS, audit trail, rate limiting, paid-Resources gate, AI feedback columns, staff/admin RLS)
6. `database/pilot_audience_fix.sql` (adds profiles.pilot, without which every 'pilot' audience feature flag is unreachable)
7. `database/referral_rewards.sql` (links a referral code at signup to referred_user_id; payment-webhook credits the referrer)
8. `database/seed.sql` (optional starter catalogue)
9. `database/launch_seed.sql` (optional controlled-launch content)
10. `database/cron.sql` after secrets and URLs are configured

## Production requirements

Before deployment, replace all placeholder values in web/mobile `config.js`, mobile `mobile-config.js`, and Supabase secrets. Configure the custom OAuth scheme in Supabase redirect allowlists. Production launch remains blocked until legal review, staff MFA, accessibility evidence, payment/Zoom tests and backup restoration are complete.

See `HOSTING.md` and `frontends/mobile/README.md` for deployment and store-build instructions.
