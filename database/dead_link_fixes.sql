-- Migrations applied directly to the live project while fixing dead
-- buttons/links found in the site-wide audit. Mirrored here so
-- database/ stays reproducible.

-- meet-your-tutor: coaching_bookings had a SELECT-only RLS policy, so a
-- student could never actually create a booking. Also no tutor-role
-- profile existed for the FK to point at, so the "meet your tutor" page's
-- own featured profile (Paulyn) is set as the launch tutor.
create policy "own booking insert" on public.coaching_bookings
  for insert with check (student_id = auth.uid());

insert into public.platform_settings(key, value, updated_at) values
  ('launch_tutor_id', '{"id":"ef67a2f1-5c8d-4c83-ac5b-80d163af82d1"}', now())
on conflict (key) do update set value = excluded.value, updated_at = now();

-- notifications: "Save preferences" had nothing to save into.
alter table public.profiles
  add column if not exists email_reminders_opt_in boolean not null default true,
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists quiet_hours_start time not null default '21:00',
  add column if not exists quiet_hours_end time not null default '07:00';

-- question-admin: assessment_versions had a SELECT-only RLS policy, so
-- "Create version N" could never actually write a new version row.
create policy "staff assessment versions" on public.assessment_versions
  for all using (acme_role() in ('admin','tutor')) with check (acme_role() in ('admin','tutor'));

-- monitoring: webhook_dead_letters intentionally had no client policies at
-- all (service-role only) — the dead-letter queue is now real and
-- admin-readable so staff can actually see and replay failed events. Replay
-- itself goes through the admin-only replay-dead-letter Edge Function
-- (service role), not a direct client write, so no write policy is added here.
create policy "admin read dead letters" on public.webhook_dead_letters
  for select using (acme_role() = 'admin');
