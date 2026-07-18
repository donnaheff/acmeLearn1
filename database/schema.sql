-- AcmeLearn production schema for Supabase/Postgres
create extension if not exists pgcrypto;
create type public.app_role as enum ('student','tutor','admin');
create type public.lecture_status as enum ('draft','scheduled','live','completed','cancelled');
create type public.platform_type as enum ('zoom','google_meet');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 first_name text not null default '', last_name text not null default '',
 role app_role not null default 'student', phone text, timezone text not null default 'Africa/Lagos',
 target_band numeric(2,1), whatsapp_opt_in boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.courses (
 id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
 description text, tutor_id uuid references public.profiles(id), active boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.enrollments (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 course_id uuid not null references public.courses(id) on delete cascade,
 status text not null default 'active' check(status in ('pending','active','completed','cancelled')),
 enrolled_at timestamptz not null default now(), unique(user_id,course_id)
);
create table public.lectures (
 id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
 title text not null, description text, tutor_id uuid not null references public.profiles(id),
 starts_at timestamptz not null, duration_minutes int not null default 60,
 platform platform_type not null default 'zoom', status lecture_status not null default 'draft',
 zoom_meeting_id text, zoom_start_url_encrypted text, access_opens_at timestamptz, access_closes_at timestamptz,
 created_at timestamptz not null default now()
);
-- access_opens_at/access_closes_at can't be Postgres GENERATED columns: timestamptz +/- interval
-- is STABLE (timezone-dependent), not IMMUTABLE, which generated column expressions require.
create or replace function public.set_lecture_access_window() returns trigger language plpgsql set search_path=public as $$
begin
 new.access_opens_at := new.starts_at - interval '15 minutes';
 new.access_closes_at := new.starts_at + make_interval(mins => new.duration_minutes + 30);
 return new;
end $$;
create trigger lectures_access_window before insert or update of starts_at,duration_minutes on public.lectures
 for each row execute procedure public.set_lecture_access_window();
create table public.lecture_registrations (
 id uuid primary key default gen_random_uuid(), lecture_id uuid not null references public.lectures(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 zoom_registrant_id text, join_url_encrypted text, registered_at timestamptz not null default now(),
 unique(lecture_id,user_id)
);
create table public.attendance (
 id uuid primary key default gen_random_uuid(), lecture_id uuid not null references public.lectures(id) on delete cascade,
 user_id uuid references public.profiles(id) on delete set null, zoom_participant_id text,
 joined_at timestamptz, left_at timestamptz, duration_minutes int not null default 0,
 unique(lecture_id,user_id)
);
create table public.recordings (
 id uuid primary key default gen_random_uuid(), lecture_id uuid not null references public.lectures(id) on delete cascade,
 title text not null, storage_path text not null, duration_seconds int, published boolean not null default false,
 available_until timestamptz, created_at timestamptz not null default now()
);
create table public.notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 lecture_id uuid references public.lectures(id) on delete cascade, channel text not null check(channel in ('email','whatsapp')),
 kind text not null, scheduled_for timestamptz not null, sent_at timestamptz, provider_id text, error text,
 unique(user_id,lecture_id,channel,kind)
);

-- Profile creation on every email/social registration.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,first_name,last_name,phone,whatsapp_opt_in,target_band)
values(new.id,coalesce(new.raw_user_meta_data->>'first_name',''),coalesce(new.raw_user_meta_data->>'last_name',''),nullif(new.raw_user_meta_data->>'phone',''),coalesce((new.raw_user_meta_data->>'whatsapp_opt_in')::boolean,false),nullif(new.raw_user_meta_data->>'target_band','')::numeric);
return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.acme_role() returns app_role language sql stable security definer set search_path=public as $$
 select coalesce((select role from profiles where id=auth.uid()),'student'::app_role)
$$;
create or replace function public.is_course_member(cid uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from enrollments where course_id=cid and user_id=auth.uid() and status='active')
$$;
create or replace function public.can_manage_course(cid uuid) returns boolean language sql stable security definer set search_path=public as $$
 select public.acme_role()='admin' or exists(select 1 from courses where id=cid and tutor_id=auth.uid())
$$;

alter table profiles enable row level security; alter table courses enable row level security;
alter table enrollments enable row level security; alter table lectures enable row level security;
alter table lecture_registrations enable row level security; alter table attendance enable row level security;
alter table recordings enable row level security; alter table notifications enable row level security;
create policy "profile own read" on profiles for select using(id=auth.uid() or acme_role() in ('admin','tutor'));
create policy "profile own update" on profiles for update using(id=auth.uid()) with check(id=auth.uid() and role=acme_role());
create policy "courses visible" on courses for select using(active or can_manage_course(id));
create policy "courses admin write" on courses for all using(acme_role()='admin') with check(acme_role()='admin');
create policy "own or managed enrollments" on enrollments for select using(user_id=auth.uid() or can_manage_course(course_id));
create policy "admins manage enrollment" on enrollments for all using(acme_role()='admin') with check(acme_role()='admin');
create policy "enrolled lectures" on lectures for select using(is_course_member(course_id) or can_manage_course(course_id));
create policy "staff manage lectures" on lectures for all using(can_manage_course(course_id)) with check(can_manage_course(course_id));
create policy "own registrations" on lecture_registrations for select using(user_id=auth.uid() or exists(select 1 from lectures l where l.id=lecture_id and can_manage_course(l.course_id)));
create policy "own attendance" on attendance for select using(user_id=auth.uid() or exists(select 1 from lectures l where l.id=lecture_id and can_manage_course(l.course_id)));
create policy "enrolled recordings" on recordings for select using(published and (available_until is null or available_until>now()) and exists(select 1 from lectures l where l.id=lecture_id and is_course_member(l.course_id)) or exists(select 1 from lectures l where l.id=lecture_id and can_manage_course(l.course_id)));
create policy "staff recordings write" on recordings for all using(exists(select 1 from lectures l where l.id=lecture_id and can_manage_course(l.course_id))) with check(exists(select 1 from lectures l where l.id=lecture_id and can_manage_course(l.course_id)));
create policy "own notifications" on notifications for select using(user_id=auth.uid() or acme_role()='admin');

-- Private recording bucket. Signed URLs are issued only by authenticated edge functions.
insert into storage.buckets(id,name,public) values('lecture-recordings','lecture-recordings',false) on conflict(id) do nothing;
create policy "staff uploads recordings" on storage.objects for insert to authenticated with check(bucket_id='lecture-recordings' and acme_role() in ('admin','tutor'));

-- Used by the verified Zoom webhook to map participant email to a profile. Not callable by clients.
create or replace function public.profile_id_by_email(lookup_email text) returns uuid language sql security definer set search_path=public,auth as $$
 select p.id from public.profiles p join auth.users u on u.id=p.id where lower(u.email)=lower(lookup_email) limit 1
$$;
revoke all on function public.profile_id_by_email(text) from public,anon,authenticated;
grant execute on function public.profile_id_by_email(text) to service_role;

create index lectures_start_idx on lectures(starts_at); create index enrollments_user_idx on enrollments(user_id);
create index notifications_due_idx on notifications(scheduled_for) where sent_at is null;
