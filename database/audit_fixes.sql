-- Migrations applied directly to the live project after the second
-- site-wide audit (fabricated data + RLS gaps). Mirrored here so
-- database/ stays reproducible.

-- referrals had a SELECT-only RLS policy, so ReferralsClient's direct
-- client insert (generating a referral code) always failed RLS.
create policy "own referrals insert" on public.referrals
  for insert with check (referrer_id = auth.uid());

-- cohort_members had RLS enabled with zero policies at all, so
-- tutor-operations' cohort-capacity read always silently returned 0
-- rows regardless of real membership.
create policy "staff cohort members read" on public.cohort_members
  for select using (acme_role() in ('admin','tutor'));

-- coupon_redemptions had RLS enabled with zero policies at all, so
-- commerce's "discounted this month" admin stat always silently
-- resolved to an empty set.
create policy "admin coupon redemptions read" on public.coupon_redemptions
  for select using (acme_role() = 'admin');
