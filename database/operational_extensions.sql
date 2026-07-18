-- AcmeLearn pilot and operational controls. Run after launch_extensions.sql.
create table public.feature_flags(
 flag text primary key,enabled boolean not null default false,audience text not null default 'all' check(audience in ('all','student','tutor','admin','pilot')),
 rollout_percentage int not null default 100 check(rollout_percentage between 0 and 100),description text,updated_by uuid references profiles,updated_at timestamptz default now());
create table public.capacity_rules(
 id uuid primary key default gen_random_uuid(),course_id uuid references courses,max_active_students int,max_weekly_marking int,max_weekly_speaking_reviews int,
 max_weekly_live_hours numeric,min_booking_buffer_minutes int default 10,sales_pause_percent int default 90,active boolean default true,updated_at timestamptz default now());
create table public.service_levels(
 service_key text primary key,label text not null,target_hours numeric,policy_text text,active boolean default true,updated_at timestamptz default now());
create table public.marketing_claims(
 claim_key text primary key,public_text text not null,metric_definition text,sample_size int,date_from date,date_to date,exclusions text,calculation_method text,
 approved_by uuid references profiles,approved_at timestamptz,publish_from timestamptz,publish_until timestamptz,status text default 'draft' check(status in ('draft','approved','expired','rejected')));
create table public.content_review_events(
 id uuid primary key default gen_random_uuid(),question_id uuid references question_items on delete cascade,stage text check(stage in ('authoring','language','answer_key','difficulty','licensing','accessibility','publication','post_use')),
 reviewer_id uuid references profiles,external_reviewer_name text,outcome text check(outcome in ('pending','pass','revise','reject')),notes text,created_at timestamptz default now());
create table public.release_records(
 id uuid primary key default gen_random_uuid(),version text unique not null,environment text check(environment in ('staging','production')),status text default 'planned',
 migration_check boolean default false,tests_passed boolean default false,accessibility_passed boolean default false,backup_verified boolean default false,rollback_plan text,release_notes text,approved_by uuid references profiles,released_at timestamptz,created_at timestamptz default now());
create table public.launch_checks(
 check_key text primary key,label text not null,required boolean default true,status text default 'pending',evidence text,checked_by uuid references profiles,checked_at timestamptz);
create table public.analytics_definitions(
 metric_key text primary key,label text,decision_supported text,definition text,retention_days int default 365,enabled boolean default true);
create table public.pilot_applications(id uuid primary key default gen_random_uuid(),email text not null,first_name text,target_band numeric(2,1),exam_date date,device_type text,accessibility_needs text,status text default 'applied',created_at timestamptz default now());

insert into feature_flags(flag,enabled,audience,description) values
('core_learning',true,'all','Diagnostic, lessons and assignments'),('live_classes',true,'all','Zoom lectures'),('payments',true,'all','One-time Paystack checkout'),
('subscriptions',false,'pilot','Recurring coaching'),('referrals',false,'pilot','Referral rewards'),('scholarships',false,'pilot','Scholarship applications'),
('tutor_marketplace',false,'pilot','Additional tutor marketplace'),('whatsapp',false,'pilot','WhatsApp reminders'),('readiness_forecast',false,'pilot','Statistical readiness forecast'),
('multi_organization',false,'admin','Organization tenancy'),('ai_recommendations',false,'pilot','Automated recommendations') on conflict(flag) do nothing;
insert into service_levels(service_key,label,target_hours,policy_text) values
('writing_feedback','Writing feedback',24,'Target measured from submission to published tutor feedback.'),('speaking_feedback','Speaking feedback',48,'Target measured from submitted audio to published comments.'),
('support_standard','Standard support',24,'Business-hours response target.'),('lecture_access','Lecture access support',0.17,'Ten-minute response target during scheduled class windows.'),
('refund_processing','Approved refunds',120,'Provider processing normally completes within five business days.') on conflict(service_key) do nothing;
insert into launch_checks(check_key,label) values
('demo_off','Demo mode disabled'),('supabase','Supabase production configured'),('zoom','Zoom meeting test passed'),('paystack','Paystack signed webhook verified'),
('staff_mfa','Tutor and admin MFA verified'),('support','Real support address configured'),('legal','Legal documents approved'),('restore','Backup restoration tested'),('https','HTTPS and production domain active') on conflict(check_key) do nothing;
insert into analytics_definitions(metric_key,label,decision_supported,definition) values
('registration_completion','Registration completion','Improve onboarding','Completed registrations divided by initiated registrations'),('diagnostic_completion','Diagnostic completion','Assess diagnostic value','Completed diagnostics divided by starts'),
('payment_conversion','Payment conversion','Plan/pricing decisions','Verified paid orders divided by checkout starts'),('first_lesson','First lesson completion','Activation','Learners completing one lesson within seven days'),
('assignment_submission','Assignment submission','Workload/engagement','Assigned work submitted by deadline'),('feedback_turnaround','Feedback turnaround','Tutor capacity','Median hours to published feedback'),
('lecture_attendance','Lecture attendance','Schedule quality','Valid attendees divided by enrolled learners'),('refund_rate','Refund rate','Product fit','Refunded orders divided by paid orders'),
('support_volume','Support volume','Usability priorities','Tickets per 100 active learners'),('course_completion','Course completion','Learning retention','Completed active enrollments') on conflict(metric_key) do nothing;

create or replace view public.data_quality_findings as
select 'paid_without_enrollment' finding,o.id::text entity_id,o.created_at detected_at from orders o join products p on p.id=o.product_id where o.status='paid' and p.course_id is not null and not exists(select 1 from enrollments e where e.user_id=o.user_id and e.course_id=p.course_id and e.status='active')
union all select 'active_enrollment_without_paid_order',e.id::text,e.enrolled_at from enrollments e where e.status='active' and not exists(select 1 from orders o join products p on p.id=o.product_id where o.user_id=e.user_id and p.course_id=e.course_id and o.status='paid')
union all select 'attendance_without_student',a.id::text,coalesce(a.joined_at,now()) from attendance a where a.user_id is null
union all select 'expired_recording_published',r.id::text,r.created_at from recordings r where r.published and r.available_until<now()
union all select 'notification_without_consent',n.id::text,n.scheduled_for from notifications n left join communication_preferences c on c.user_id=n.user_id where n.channel='whatsapp' and coalesce(c.whatsapp,false)=false
union all select 'booking_outside_availability',b.id::text,b.created_at from coaching_bookings b where b.status in ('pending','confirmed') and not exists(select 1 from tutor_availability a where a.tutor_id=b.tutor_id and a.weekday=extract(dow from b.starts_at)::int and b.starts_at::time>=a.starts_at and b.ends_at::time<=a.ends_at);
alter view public.data_quality_findings set (security_invoker=true);
revoke all on public.data_quality_findings from anon,authenticated;grant select on public.data_quality_findings to service_role;

alter table feature_flags enable row level security;alter table pilot_applications enable row level security;alter table capacity_rules enable row level security;alter table service_levels enable row level security;alter table marketing_claims enable row level security;alter table content_review_events enable row level security;alter table release_records enable row level security;alter table launch_checks enable row level security;alter table analytics_definitions enable row level security;
create policy "pilot apply" on pilot_applications for insert to anon,authenticated with check(true);create policy "pilot admin read" on pilot_applications for select using(acme_role()='admin');
create policy "flags read" on feature_flags for select using(true);create policy "flags admin" on feature_flags for all using(acme_role()='admin') with check(acme_role()='admin');
create policy "service levels read" on service_levels for select using(active);create policy "approved claims read" on marketing_claims for select using(status='approved' and now() between publish_from and publish_until);create policy "admin claims" on marketing_claims for all using(acme_role()='admin') with check(acme_role()='admin');
create policy "staff content review" on content_review_events for all using(acme_role() in ('admin','tutor')) with check(acme_role() in ('admin','tutor'));
create policy "admin release controls" on release_records for all using(acme_role()='admin') with check(acme_role()='admin');create policy "admin launch checks" on launch_checks for all using(acme_role()='admin') with check(acme_role()='admin');
create policy "analytics definitions read" on analytics_definitions for select using(acme_role() in ('admin','tutor'));
create policy "capacity staff" on capacity_rules for select using(acme_role() in ('admin','tutor'));create policy "capacity admin" on capacity_rules for all using(acme_role()='admin') with check(acme_role()='admin');
