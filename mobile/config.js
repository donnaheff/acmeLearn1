// Public browser configuration. Replace placeholders after creating your Supabase project.
// Never place Zoom, Resend, Twilio or Supabase service-role secrets in this file.
window.ACME_CONFIG = {
  SUPABASE_URL: 'https://lydeuuixyccskuepvszk.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZGV1dWl4eWNjc2t1ZXB2c3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMjg4MjMsImV4cCI6MjA5OTkwNDgyM30.VN84_AftUEJ6eXzyJRc1Sqp26LfUyATlV8uzTwkb2y4',
  SITE_URL: window.location.origin === 'null' ? '' : window.location.origin,
  DEMO_MODE: false // Live Supabase project (schema, RLS and 15 Edge Functions deployed). Third-party
  // secrets (Zoom/Stripe/Paystack/Twilio/Resend) are still unset — see docs/.env.example.
};