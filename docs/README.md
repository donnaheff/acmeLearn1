# AcmeLearn IELTS platform

Responsive multi-page learning platform with a production Supabase + Zoom backend and a credential-free demo mode.

## Implemented

- Email/password and social authentication (Google, Apple, Microsoft/Azure and Facebook)
- Student, tutor and administrator roles with Postgres row-level security
- Course enrolment checks on lectures and recordings
- Zoom Server-to-Server OAuth meeting creation
- Waiting rooms, required Zoom registration, unique per-student join URLs and automatic cloud recording
- Join links released 15 minutes before class and closed 30 minutes after it
- Signed, 15-minute recording playback URLs for active course members
- Zoom webhook signature validation, attendance sync and recording ingestion to private storage
- Email reminders through Resend, WhatsApp reminders through Twilio and attached calendar events
- Administrator scheduling/enrolment UI, tutor attendance/recording UI, CSV export
- Student dashboard, lecture room, recordings, courses, practice and resources
- Paystack and Stripe checkout with signed webhook enrolment activation
- Diagnostic assessment and explainable recommendation engine
- Autosaving IELTS writing workspace and tutor-feedback data model
- Browser-based speaking recorder with private media storage policies
- Reconnect-safe mock exam experience, assignments and certificates
- In-app notifications, communication preferences, consent history and support tickets
- Business/learning analytics, intervention workflows and tutor marketplace
- Account data export/deletion, privacy/terms/refund pages and audit/error logs
- Multi-organisation schema and installable offline-first PWA
- One-tutor launch model with a verified public profile and booking flow
- Responsive AVIF/WebP campaign imagery for hero, live teaching, feedback, mobile study and outcomes
- Homepage trust indicators, verified learner story and persistent diagnostic CTA
- Interactive course comparison and five personalized dashboard states
- Supabase-backed lightweight content management with draft/publish controls
- Core Web Vitals reporting, performance budgets and launch usability-research workflow
- Single-tutor availability, overlap protection, workload limits and continuity workflows
- Cohort capacity, automatic waitlists, class-change credits and learner notifications
- Versioned original question bank with difficulty, licensing and review controls
- Marking moderation, score-review requests and timestamped speaking feedback
- Exam-readiness forecasting with confidence range and non-guarantee disclosure
- Coupons, scholarships, invoices, refunds and fraud-aware referrals
- MFA setup, global session logout and password-recovery completion
- Webhook queues/dead letters, incident tracking and backup-restore dashboard
- Playwright desktop/mobile journeys and staging authorization test plan
- Five-item student navigation, unified account centre and global search
- Database feature flags with pilot audiences and percentage rollout
- Production launch gates, release records and rollback controls
- Service-level publication and automatic sales pause at safe tutor capacity
- Evidence-governed marketing claims with automatic expiry
- Minimal analytics definitions and automated data-quality reconciliation
- Controlled 20-learner pilot application and research workflow

## Local demo

Open `index.html`. `config.js` ships with `DEMO_MODE: true`. Any valid-looking email/password signs in locally.

- `admin@acmelearn.demo` opens the administrator role.
- `tutor@acmelearn.demo` opens the tutor role.
- Any other email opens a student account.

Demo social buttons create a local student profile. Real passwords are never stored by the demo.

## Production deployment

1. Create a Supabase project. Run `supabase/schema.sql`, `supabase/phase_extensions.sql`, `supabase/launch_extensions.sql`, `supabase/operational_extensions.sql`, then optional `supabase/seed.sql` and `supabase/launch_seed.sql`, in that order.
2. Configure Auth providers in **Authentication → Providers**. Add the deployed URL and `/index.html` to allowed redirect URLs.
3. Register the first owner through the site, then promote that account in the SQL editor:

```sql
update public.profiles set role='admin' where id=(select id from auth.users where email='owner@example.com');
```

Tutors are assigned with `role='tutor'`; course ownership further limits which cohorts they can manage.
4. Update `config.js` with the project URL and anon key, then set `DEMO_MODE: false`.
5. Install the Supabase CLI, link the project and deploy:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy create-zoom-meeting
supabase functions deploy get-lecture-access
supabase functions deploy get-host-access
supabase functions deploy get-recording-url
supabase functions deploy manage-enrollment
supabase functions deploy initialize-payment
supabase functions deploy generate-recommendations
supabase functions deploy account-privacy
supabase functions deploy book-coaching
supabase functions deploy calculate-readiness
supabase functions deploy request-refund
supabase functions deploy launch-health
supabase functions deploy payment-webhook --no-verify-jwt
supabase functions deploy zoom-webhook --no-verify-jwt
supabase functions deploy send-reminders --no-verify-jwt
```

6. Copy `.env.example` values into Supabase Edge Function secrets. Include a random 32+ character `LINK_ENCRYPTION_KEY` and the Zoom host user ID:

```bash
supabase secrets set ZOOM_ACCOUNT_ID=... ZOOM_CLIENT_ID=... ZOOM_CLIENT_SECRET=...
supabase secrets set ZOOM_HOST_USER_ID=... ZOOM_WEBHOOK_SECRET_TOKEN=...
supabase secrets set LINK_ENCRYPTION_KEY=... SITE_URL=https://your-domain.example
supabase secrets set RESEND_API_KEY=... EMAIL_FROM='AcmeLearn <classes@your-domain.example>'
supabase secrets set TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_WHATSAPP_FROM=... TWILIO_CONTENT_SID=...
supabase secrets set PAYSTACK_SECRET_KEY=... STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=...
supabase secrets set CRON_SECRET=...
```

7. In the Zoom Marketplace, create a **Server-to-Server OAuth** app. Grant meeting read/write, registrant read/write, recording read and user read scopes. Add the deployed `zoom-webhook` URL as an event endpoint and subscribe to participant joined/left, meeting ended and recording completed.
8. Configure Resend with a verified sending domain. Configure approved Twilio WhatsApp templates/production sender and collect explicit student opt-in.
9. Apply `supabase/cron.sql`, replacing its placeholders, to process reminders every five minutes.
10. Register the deployed `payment-webhook` URL in Paystack and Stripe, configure verified webhook secrets and run test transactions before enabling live mode.
11. Host this folder on a static host with HTTPS. Add a Content Security Policy and keep all service keys exclusively in Supabase secrets.
12. Enable staff MFA, Supabase point-in-time recovery, daily backup verification, uptime checks and alerting on `error_events` and failed notification rows.
13. Run `python3 tests/checks.py`, `python3 tests/performance_budget.py` and `python3 tests/production_readiness.py`, then run `npm test` for automated browser journeys. The readiness script intentionally blocks launch until credentials and external review evidence exist.
14. Use `launch-control.html` to keep advanced flags disabled during the 10–20 learner pilot. Enable features only after evidence and capacity review.

## Security notes

Meeting start URLs and student join URLs are AES-GCM encrypted at rest. Browser clients never receive host URLs. Supabase service-role, Zoom, Resend and Twilio credentials only exist in Edge Functions. RLS limits all client reads. Zoom webhook payloads require a valid HMAC signature and a five-minute timestamp window. Recording files are copied to a private storage bucket and played through short-lived signed URLs.

Before launch, obtain privacy consent for lecture recording, publish retention terms, enable MFA for staff, configure database backups and run an external security review.
