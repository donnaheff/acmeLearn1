-- Consolidates every migration applied directly against the live project
-- during the admin back-office / AI / paid-Resources / staff-onboarding
-- build-out, so `database/` stays a true, reproducible record of the
-- schema instead of silently drifting from what's actually deployed.
-- Run after operational_extensions.sql (and seed.sql/launch_seed.sql if used).

-- === Articles CMS (cms_extensions) ===================================
create type public.article_status as enum ('draft','submitted','published');

create table public.articles (
 id uuid primary key default gen_random_uuid(),
 slug text unique not null,
 title text not null,
 excerpt text not null default '',
 body text not null default '',
 category text not null default 'General',
 read_minutes int not null default 5,
 featured boolean not null default false,
 status public.article_status not null default 'draft',
 author_id uuid references public.profiles(id) on delete set null,
 published_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.articles enable row level security;

create policy "staff create own articles" on public.articles
 for insert with check (
   acme_role() = 'admin'
   or (acme_role() = 'tutor' and author_id = auth.uid() and status <> 'published')
 );
create policy "staff update own or admin any" on public.articles
 for update using (
   acme_role() = 'admin'
   or (acme_role() = 'tutor' and author_id = auth.uid() and status <> 'published')
 ) with check (
   acme_role() = 'admin'
   or (acme_role() = 'tutor' and author_id = auth.uid() and status <> 'published')
 );
create policy "admin delete articles" on public.articles
 for delete using (acme_role() = 'admin');

create index articles_status_published_idx on public.articles(status, published_at desc);

-- === Admin enhancements: scheduling, images, SEO, audit trail, notifications ===
alter type public.article_status add value if not exists 'scheduled';

alter table public.articles
  add column if not exists cover_image_url text,
  add column if not exists meta_description text,
  add column if not exists scheduled_publish_at timestamptz;

-- Paying-client gate replaces the original "published articles public read"
-- policy — see is_paying_client() below. This is the final, current policy;
-- the original public-read version never shipped to a repo file, so there's
-- nothing to drop here on a fresh install.
create policy "published articles paying clients" on public.articles
 for select using (
   acme_role() in ('admin','tutor')
   or (status = 'published' and public.is_paying_client())
 );

insert into storage.buckets(id, name, public) values ('article-images','article-images', true)
  on conflict (id) do nothing;
create policy "public read article images" on storage.objects
  for select using (bucket_id = 'article-images');
create policy "staff manage article images" on storage.objects
  for all using (bucket_id = 'article-images' and acme_role() in ('admin','tutor'))
  with check (bucket_id = 'article-images' and acme_role() in ('admin','tutor'));

-- Generic audit trail: snapshot every change to site_content / articles.
create or replace function public.log_audit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, before_data, after_data)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    (case when tg_op = 'DELETE' then old.id else new.id end)::text,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );
  return coalesce(new, old);
end $$;
revoke execute on function public.log_audit() from anon, authenticated;

create trigger site_content_audit after insert or update on public.site_content
  for each row execute procedure public.log_audit();
create trigger articles_audit after insert or update or delete on public.articles
  for each row execute procedure public.log_audit();

-- Notify every admin the moment an article is submitted for review.
create or replace function public.notify_admins_on_submission() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'submitted' and (old.status is distinct from 'submitted') then
    insert into public.in_app_notifications(user_id, title, body, kind, action_url)
    select id, 'Article submitted for review', new.title, 'article_review', '/content-admin/articles/' || new.id
    from public.profiles where role = 'admin';
  end if;
  return new;
end $$;
revoke execute on function public.notify_admins_on_submission() from anon, authenticated;

create trigger articles_notify_submission after update on public.articles
  for each row execute procedure public.notify_admins_on_submission();

-- === Rate limiting =====================================================
-- rate_limits(key, count, window_started_at) already existed in
-- phase_extensions.sql with RLS enabled but no policies (so no client can
-- read/write it directly) — check_rate_limit is the only sanctioned access
-- path, and even that is restricted to the service role below.
create or replace function public.check_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  insert into public.rate_limits(key, count, window_started_at)
  values (p_key, 1, now())
  on conflict (key) do update set
    count = case
      when rate_limits.window_started_at < now() - make_interval(secs => p_window_seconds)
        then 1
      else rate_limits.count + 1
    end,
    window_started_at = case
      when rate_limits.window_started_at < now() - make_interval(secs => p_window_seconds)
        then now()
      else rate_limits.window_started_at
    end
  returning count into v_count;
  return v_count <= p_limit;
end;
$$;
-- Direct client calls could pre-fill another user's/IP's bucket to deny
-- them service; only our own Edge Functions (via the service role) may call it.
revoke execute on function public.check_rate_limit(text, int, int) from anon, authenticated;

-- === Paid-client gate for Resources ====================================
create or replace function public.is_paying_client() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.orders where user_id = auth.uid() and status = 'paid')
      or exists(select 1 from public.subscriptions where user_id = auth.uid() and status = 'active')
$$;

-- === AI feedback columns ===============================================
alter table public.writing_submissions
  add column if not exists ai_criterion_scores jsonb,
  add column if not exists ai_overall_band numeric(2,1),
  add column if not exists ai_feedback text;

alter table public.speaking_attempts
  add column if not exists transcript text,
  add column if not exists ai_criterion_scores jsonb,
  add column if not exists ai_overall_band numeric(2,1),
  add column if not exists ai_feedback text;

alter table public.support_tickets
  add column if not exists ai_suggested_reply text;

-- === Protect staff/system-only fields from self-editing ================
-- writing_submissions/speaking_attempts/support_tickets each have an "own
-- row, ALL commands" RLS policy so students can edit their own drafts —
-- but that also let them directly PATCH scores, marking metadata, AI
-- feedback and ticket triage state. RLS is row-level only, so these
-- triggers snap those specific columns back to their previous value
-- unless the actor is staff or our own service-role Edge Functions.
create or replace function public.protect_writing_submission_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'service_role' or public.acme_role() in ('admin','tutor') then
    return new;
  end if;
  new.overall_band := old.overall_band;
  new.criterion_scores := old.criterion_scores;
  new.marked_by := old.marked_by;
  new.ai_overall_band := old.ai_overall_band;
  new.ai_criterion_scores := old.ai_criterion_scores;
  new.ai_feedback := old.ai_feedback;
  return new;
end $$;
revoke execute on function public.protect_writing_submission_fields() from anon, authenticated;
create trigger writing_submissions_protect_fields before update on public.writing_submissions
  for each row execute procedure public.protect_writing_submission_fields();

create or replace function public.protect_speaking_attempt_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'service_role' or public.acme_role() in ('admin','tutor') then
    return new;
  end if;
  new.criterion_scores := old.criterion_scores;
  new.tutor_notes := old.tutor_notes;
  new.ai_overall_band := old.ai_overall_band;
  new.ai_criterion_scores := old.ai_criterion_scores;
  new.ai_feedback := old.ai_feedback;
  return new;
end $$;
revoke execute on function public.protect_speaking_attempt_fields() from anon, authenticated;
create trigger speaking_attempts_protect_fields before update on public.speaking_attempts
  for each row execute procedure public.protect_speaking_attempt_fields();

create or replace function public.protect_support_ticket_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'service_role' or public.acme_role() in ('admin','tutor') then
    return new;
  end if;
  new.status := old.status;
  new.priority := old.priority;
  new.assigned_to := old.assigned_to;
  new.ai_suggested_reply := old.ai_suggested_reply;
  return new;
end $$;
revoke execute on function public.protect_support_ticket_fields() from anon, authenticated;
create trigger support_tickets_protect_fields before update on public.support_tickets
  for each row execute procedure public.protect_support_ticket_fields();

-- === Admin-editable plan pricing and staff role management =============
create policy "admin manage products" on public.products
  for all using (acme_role() = 'admin') with check (acme_role() = 'admin');

create policy "admin manage staff roles" on public.profiles
  for update using (acme_role() = 'admin') with check (acme_role() = 'admin');
