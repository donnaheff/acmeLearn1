-- AcmeLearn phases 1–4: commerce, assessment, communication, analytics and multi-tenancy.
-- Run after schema.sql.
create type public.payment_status as enum ('pending','paid','failed','refunded');
create type public.submission_status as enum ('draft','submitted','marked','returned');
create type public.consent_kind as enum ('terms','privacy','recording','academic_email','whatsapp','marketing');

create table public.organizations(id uuid primary key default gen_random_uuid(),name text not null,slug text unique not null,logo_path text,settings jsonb not null default '{}',created_at timestamptz default now());
create table public.organization_members(id uuid primary key default gen_random_uuid(),organization_id uuid references organizations on delete cascade,user_id uuid references profiles on delete cascade,role app_role not null default 'student',unique(organization_id,user_id));
alter table courses add column if not exists organization_id uuid references organizations(id);
create table public.products(id uuid primary key default gen_random_uuid(),course_id uuid references courses on delete cascade,name text not null,amount_minor int not null,currency text not null default 'NGN',billing_type text check(billing_type in ('one_time','monthly')),active boolean default true);
create table public.orders(id uuid primary key default gen_random_uuid(),user_id uuid references profiles on delete cascade,product_id uuid references products,provider text check(provider in ('paystack','stripe')),provider_reference text unique,status payment_status default 'pending',amount_minor int not null,currency text not null,created_at timestamptz default now(),paid_at timestamptz);
create table public.subscriptions(id uuid primary key default gen_random_uuid(),user_id uuid references profiles on delete cascade,product_id uuid references products,provider text,provider_subscription_id text unique,status text,renews_at timestamptz,cancel_at_period_end boolean default false);
create table public.payment_events(id uuid primary key default gen_random_uuid(),provider text,event_id text unique,payload jsonb,processed_at timestamptz default now());

create table public.diagnostic_attempts(id uuid primary key default gen_random_uuid(),user_id uuid references profiles on delete cascade,started_at timestamptz default now(),completed_at timestamptz,exam_date date,weekly_hours int,target_band numeric(2,1),responses jsonb default '{}',scores jsonb default '{}');
create table public.skill_scores(id uuid primary key default gen_random_uuid(),user_id uuid references profiles on delete cascade,skill text check(skill in ('listening','reading','writing','speaking')),criterion text,score numeric(3,1),source text,recorded_at timestamptz default now());
create table public.recommendations(id uuid primary key default gen_random_uuid(),user_id uuid references profiles on delete cascade,skill text,title text not null,reason text not null,activity_url text,priority int default 50,status text default 'active',created_by uuid references profiles,expires_at timestamptz,created_at timestamptz default now());
create table public.writing_submissions(id uuid primary key default gen_random_uuid(),user_id uuid references profiles on delete cascade,task_type text,question text,response text,word_count int,status submission_status default 'draft',submitted_at timestamptz,marked_by uuid references profiles,criterion_scores jsonb default '{}',overall_band numeric(2,1),created_at timestamptz default now(),updated_at timestamptz default now());
create table public.writing_comments(id uuid primary key default gen_random_uuid(),submission_id uuid references writing_submissions on delete cascade,author_id uuid references profiles,selection_start int,selection_end int,comment text not null,created_at timestamptz default now());
create table public.speaking_attempts(id uuid primary key default gen_random_uuid(),user_id uuid references profiles on delete cascade,part int,question text,audio_path text,duration_seconds int,status submission_status default 'draft',criterion_scores jsonb default '{}',tutor_notes text,created_at timestamptz default now());
create table public.mock_attempts(id uuid primary key default gen_random_uuid(),user_id uuid references profiles on delete cascade,started_at timestamptz default now(),completed_at timestamptz,current_section text,responses jsonb default '{}',scores jsonb default '{}',accommodations jsonb default '{}');
create table public.assignments(id uuid primary key default gen_random_uuid(),course_id uuid references courses on delete cascade,student_id uuid references profiles,title text not null,instructions text,due_at timestamptz,created_by uuid references profiles,status text default 'assigned',submission_id uuid references writing_submissions,created_at timestamptz default now());

create table public.in_app_notifications(id uuid primary key default gen_random_uuid(),user_id uuid references profiles on delete cascade,title text not null,body text,kind text,action_url text,read_at timestamptz,created_at timestamptz default now());
create table public.communication_preferences(user_id uuid primary key references profiles on delete cascade,academic_email boolean default true,whatsapp boolean default false,marketing boolean default false,quiet_start time,quiet_end time,timezone text default 'Africa/Lagos');
create table public.consent_events(id uuid primary key default gen_random_uuid(),user_id uuid references profiles on delete cascade,kind consent_kind,granted boolean not null,policy_version text,ip_hash text,created_at timestamptz default now());
create table public.support_tickets(id uuid primary key default gen_random_uuid(),user_id uuid references profiles on delete cascade,assigned_to uuid references profiles,category text,subject text not null,body text,status text default 'open',priority text default 'normal',created_at timestamptz default now(),updated_at timestamptz default now());
create table public.interventions(id uuid primary key default gen_random_uuid(),student_id uuid references profiles on delete cascade,assigned_to uuid references profiles,reason text,action text,outcome text,status text default 'open',due_at timestamptz,created_at timestamptz default now());
create table public.certificates(id uuid primary key default gen_random_uuid(),user_id uuid references profiles on delete cascade,course_id uuid references courses,verification_code text unique default encode(gen_random_bytes(9),'hex'),issued_at timestamptz default now(),revoked_at timestamptz);
create table public.audit_logs(id bigint generated always as identity primary key,actor_id uuid,action text not null,entity_type text,entity_id text,before_data jsonb,after_data jsonb,created_at timestamptz default now());
create table public.error_events(id bigint generated always as identity primary key,user_id uuid,page text,error_code text,message text,user_agent text,created_at timestamptz default now());
create table public.site_content(id uuid primary key default gen_random_uuid(),content_key text unique not null,value jsonb not null default '{}',published boolean default false,updated_by uuid references profiles,updated_at timestamptz default now());
create table public.usability_feedback(id uuid primary key default gen_random_uuid(),user_id uuid references profiles,journey text,rating int check(rating between 1 and 5),difficulty text,comments text,consent_followup boolean default false,created_at timestamptz default now());

-- Private learner media.
insert into storage.buckets(id,name,public) values('speaking-attempts','speaking-attempts',false) on conflict(id) do nothing;

-- RLS: sensitive learner records remain owner/staff only.
alter table organizations enable row level security;alter table organization_members enable row level security;alter table products enable row level security;alter table orders enable row level security;alter table subscriptions enable row level security;alter table payment_events enable row level security;alter table diagnostic_attempts enable row level security;alter table skill_scores enable row level security;alter table recommendations enable row level security;alter table writing_submissions enable row level security;alter table writing_comments enable row level security;alter table speaking_attempts enable row level security;alter table mock_attempts enable row level security;alter table assignments enable row level security;alter table in_app_notifications enable row level security;alter table communication_preferences enable row level security;alter table consent_events enable row level security;alter table support_tickets enable row level security;alter table interventions enable row level security;alter table certificates enable row level security;alter table audit_logs enable row level security;alter table error_events enable row level security;alter table site_content enable row level security;alter table usability_feedback enable row level security;
create policy "products public read" on products for select using(active);
create policy "own orders" on orders for select using(user_id=auth.uid() or acme_role()='admin');
create policy "own subscriptions" on subscriptions for select using(user_id=auth.uid() or acme_role()='admin');
create policy "own diagnostics" on diagnostic_attempts for all using(user_id=auth.uid() or acme_role() in ('admin','tutor')) with check(user_id=auth.uid() or acme_role() in ('admin','tutor'));
create policy "own scores" on skill_scores for select using(user_id=auth.uid() or acme_role() in ('admin','tutor'));
create policy "own recommendations" on recommendations for select using(user_id=auth.uid() or acme_role() in ('admin','tutor'));
create policy "own writing" on writing_submissions for all using(user_id=auth.uid() or acme_role() in ('admin','tutor')) with check(user_id=auth.uid() or acme_role() in ('admin','tutor'));
create policy "writing comments access" on writing_comments for select using(exists(select 1 from writing_submissions s where s.id=submission_id and (s.user_id=auth.uid() or acme_role() in ('admin','tutor'))));
create policy "own speaking" on speaking_attempts for all using(user_id=auth.uid() or acme_role() in ('admin','tutor')) with check(user_id=auth.uid() or acme_role() in ('admin','tutor'));
create policy "own mocks" on mock_attempts for all using(user_id=auth.uid() or acme_role() in ('admin','tutor')) with check(user_id=auth.uid());
create policy "assignment audience" on assignments for select using(student_id=auth.uid() or student_id is null and is_course_member(course_id) or can_manage_course(course_id));
create policy "staff assignments" on assignments for all using(can_manage_course(course_id)) with check(can_manage_course(course_id));
create policy "own notifications r" on in_app_notifications for select using(user_id=auth.uid());
create policy "own notifications u" on in_app_notifications for update using(user_id=auth.uid());
create policy "own preferences" on communication_preferences for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "own consent" on consent_events for select using(user_id=auth.uid() or acme_role()='admin');
create policy "own tickets" on support_tickets for all using(user_id=auth.uid() or acme_role() in ('admin','tutor')) with check(user_id=auth.uid() or acme_role() in ('admin','tutor'));
create policy "intervention staff" on interventions for all using(acme_role() in ('admin','tutor')) with check(acme_role() in ('admin','tutor'));
create policy "own certificate" on certificates for select using(user_id=auth.uid() or acme_role() in ('admin','tutor'));
create policy "audit admins" on audit_logs for select using(acme_role()='admin');
create policy "errors insert" on error_events for insert to anon,authenticated with check(user_id is null or user_id=auth.uid());
create policy "errors admin read" on error_events for select using(acme_role()='admin');
create policy "published content read" on site_content for select using(published or acme_role()='admin');
create policy "admin content manage" on site_content for all using(acme_role()='admin') with check(acme_role()='admin');
create policy "feedback submit" on usability_feedback for insert to anon,authenticated with check(user_id is null or user_id=auth.uid());
create policy "feedback admin read" on usability_feedback for select using(acme_role()='admin');
create policy "speaking upload own" on storage.objects for insert to authenticated with check(bucket_id='speaking-attempts' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "speaking read own" on storage.objects for select to authenticated using(bucket_id='speaking-attempts' and ((storage.foldername(name))[1]=auth.uid()::text or acme_role() in ('admin','tutor')));

create index rec_user_priority on recommendations(user_id,priority desc) where status='active';create index assignment_due on assignments(due_at) where status<>'completed';create index notification_unread on in_app_notifications(user_id,created_at desc) where read_at is null;
