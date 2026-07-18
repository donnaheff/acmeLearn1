-- Run after saving SITE_URL and CRON_SECRET in Supabase Vault.
-- Dashboard alternative: Integrations > Cron > create a job every 5 minutes calling send-reminders.
create extension if not exists pg_cron;
create extension if not exists pg_net;
select vault.create_secret('https://YOUR_PROJECT.supabase.co','acme_site_url');
select vault.create_secret('REPLACE_WITH_LONG_RANDOM_VALUE','acme_cron_secret');
select cron.schedule('acmelearn-reminders','*/5 * * * *',$$
 select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name='acme_site_url') || '/functions/v1/send-reminders',
  headers := jsonb_build_object('Content-Type','application/json','x-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='acme_cron_secret')),
  body := '{}'::jsonb
 )
$$);
select cron.schedule('acmelearn-scheduled-articles','*/5 * * * *',$$
 select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name='acme_site_url') || '/functions/v1/publish-scheduled-articles',
  headers := jsonb_build_object('Content-Type','application/json','x-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='acme_cron_secret')),
  body := '{}'::jsonb
 )
$$);