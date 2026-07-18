-- Run against staging with a transaction; replace UUIDs with seeded fixture identities.
begin;
-- Required manual/CI assertions:
-- 1. SET request.jwt.claim.sub to STUDENT_A and assert STUDENT_B writing_submissions returns zero rows.
-- 2. Assert STUDENT_A cannot select lectures without active enrollment.
-- 3. Assert STUDENT_A cannot select lecture_registrations belonging to STUDENT_B.
-- 4. Assert STUDENT_A cannot select unpublished or other-cohort recordings.
-- 5. Assert STUDENT_A cannot select zoom_start_url_encrypted or call get-host-access.
-- 6. Assert TUTOR_A can manage only courses assigned to TUTOR_A.
-- 7. Assert only ADMIN can read audit_logs, webhook_dead_letters and payment events.
-- 8. Assert a duplicated payment event_id cannot create a second enrollment or invoice.
-- 9. Assert overlapping confirmed coaching_bookings for the launch tutor fail.
-- 10. Assert expired coupon, over-capacity cohort and reused score review are rejected.
rollback;
