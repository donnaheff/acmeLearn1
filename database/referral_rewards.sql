-- The referral system previously only let a student generate a code and
-- display it — nothing captured who signed up with it, nothing computed a
-- reward, and reward_minor sat permanently at its default of 0. This closes
-- that loop:
--   1. Signup passes ?ref=CODE through as auth metadata (referral_code);
--      handle_new_user() links it to referrals.referred_user_id.
--   2. payment-webhook credits the referrer once the referred user's first
--      payment is verified, using referral_reward_percent from
--      platform_settings (admin-editable, defaults to 10%).
-- OAuth signups aren't covered here — the identity provider populates
-- raw_user_meta_data, not our custom signUp() options, so there's no
-- referral_code to read at that point.
--
-- Both the trigger and payment-webhook check the 'referrals' feature flag
-- before doing anything — disabling that flag fully stops the system
-- (no new links, no new rewards), not just the student-facing pages.

insert into public.platform_settings(key, value) values
  ('referral_reward_percent', '10')
on conflict (key) do nothing;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,first_name,last_name,phone,whatsapp_opt_in,target_band)
  values(new.id,coalesce(new.raw_user_meta_data->>'first_name',''),coalesce(new.raw_user_meta_data->>'last_name',''),nullif(new.raw_user_meta_data->>'phone',''),coalesce((new.raw_user_meta_data->>'whatsapp_opt_in')::boolean,false),nullif(new.raw_user_meta_data->>'target_band','')::numeric);
  if new.raw_user_meta_data->>'referral_code' is not null
     and exists(select 1 from public.feature_flags where flag='referrals' and enabled=true) then
    update public.referrals
      set referred_user_id = new.id, status = 'signed_up'
      where code = upper(new.raw_user_meta_data->>'referral_code')
        and referred_user_id is null
        and referrer_id <> new.id;
  end if;
  return new;
end $$;
