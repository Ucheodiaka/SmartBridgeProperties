begin;

-- Remove legacy policies that make RLS ineffective by allowing every role
-- to perform every operation.
drop policy if exists "Enable all access for properties" on public.properties;
drop policy if exists "Public read for verified properties" on public.properties;
drop policy if exists "Enable all access for submissions" on public.property_submissions;
drop policy if exists "Enable all access for inquiries" on public.property_inquiries;
drop policy if exists "Enable all access for bookings" on public.inspection_bookings;

-- The public catalogue is exposed through a security-invoker view and the
-- underlying RLS policy only permits approved rows.
alter view public.public_properties set (security_invoker = true);
grant select on public.properties to anon, authenticated;
grant select on public.public_properties to anon, authenticated;

drop policy if exists properties_select_approved on public.properties;
create policy properties_select_approved
on public.properties
for select
to anon, authenticated
using (status = 'approved');

-- Trigger/helper functions are not public RPC endpoints.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_submission_status_transition() from public, anon, authenticated;
revoke all on function public.protect_profile_security_fields() from public, anon, authenticated;
revoke all on function public.protect_submission_admin_fields() from public, anon, authenticated;
revoke all on function public.is_approved_property(text) from public, anon, authenticated;

-- Role helpers are used by authenticated RLS policies only.
revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_lister() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_lister() to authenticated;

alter function public.handle_updated_at() set search_path = public;

commit;
