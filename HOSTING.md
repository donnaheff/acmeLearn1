# Recommended hosting architecture

## Recommended initial stack

### Web frontend and DNS: Cloudflare Pages

Host `frontends/web/` on Cloudflare Pages with the custom domain `learn.yourdomain.com`. The app is static, so Pages provides a simple global CDN, HTTPS, preview deployments and inexpensive operation. Keep Cloudflare DNS and Web Application Firewall in front of the site.

Vercel is a good alternative if the frontend is later migrated to Next.js. For the current static build, Cloudflare Pages is the simpler fit.

### Authentication, API, database and private files: Supabase

Use one Supabase project for staging and a separate project for production:

- PostgreSQL database and row-level security
- email/social authentication and MFA
- Edge Functions in `backend/supabase/functions/`
- private speaking and recording storage
- scheduled reminders and webhook processing

Choose a region close to the main user base while considering where Zoom, email and payment services process data. Enable point-in-time recovery before accepting payments.

### Large lecture recordings: start with Supabase Storage

The current backend already uses private Supabase Storage and signed URLs. Keep this for the pilot. If video volume or egress cost grows, move recording objects to Cloudflare R2 while retaining enrolment authorization in Supabase.

### Mobile distribution

- Android: Google Play Console, initially through Internal Testing and Closed Testing.
- iOS: Apple App Store Connect through TestFlight before public release.

Mobile binaries are distributed by the stores; the Supabase backend and Cloudflare-hosted legal/support pages remain shared with the web app.

### Email, WhatsApp, monitoring and payments

- Transactional email: Resend with a verified custom domain.
- WhatsApp: Twilio WhatsApp Business, disabled until approved templates and consent are ready.
- Nigerian payments: Paystack.
- International payments: Stripe.
- Error monitoring: Sentry plus the existing internal error-event table.
- Uptime: Better Stack, UptimeRobot or Cloudflare Health Checks.
- Source/CI: private GitHub repository with GitHub Actions.

## Proposed environments

| Environment | Web | Backend/database | Mobile |
|---|---|---|---|
| Local | static server | local/demo or Supabase dev | simulator/device |
| Staging | Cloudflare Pages preview | separate Supabase staging project | Play Internal Testing / TestFlight internal |
| Production | Cloudflare Pages custom domain | separate Supabase production project | Google Play / Apple App Store |

## Why this architecture

It matches the existing code, minimizes DevOps for a one-tutor launch, supports Nigerian and international payments, keeps authorization near the database and can scale without an early infrastructure rewrite.
