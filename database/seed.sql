-- Optional starter catalogue. Safe to run repeatedly.
insert into public.courses(slug,title,description) values
 ('complete-ielts-accelerator','Complete IELTS Accelerator','Eight-week preparation across all four IELTS skills.'),
 ('writing-task-2','Writing Task 2 Masterclass','Focused academic essay preparation.'),
 ('speaking-fluency-lab','Speaking Fluency Lab','Live speaking practice and tutor feedback.')
on conflict(slug) do update set title=excluded.title,description=excluded.description;

-- Run after phase_extensions.sql.
insert into public.products(id,course_id,name,amount_minor,currency,billing_type) values
 ('10000000-0000-4000-8000-000000000001',(select id from courses where slug='complete-ielts-accelerator'),'Practice Essentials',1900000,'NGN','one_time'),
 ('10000000-0000-4000-8000-000000000002',(select id from courses where slug='complete-ielts-accelerator'),'Complete IELTS Accelerator',7400000,'NGN','one_time'),
 ('10000000-0000-4000-8000-000000000003',(select id from courses where slug='complete-ielts-accelerator'),'Pro Coaching',3800000,'NGN','monthly')
on conflict(id) do update set amount_minor=excluded.amount_minor,active=true;
