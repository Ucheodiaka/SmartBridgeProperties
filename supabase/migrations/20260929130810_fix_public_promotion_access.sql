-- Restore anonymous homepage access to active promotions without allowing
-- anonymous callers to execute the administrator authorization function.
drop policy if exists "active_promotions_public_read" on public.business_promotions;
drop policy if exists "admins_read_all_promotions" on public.business_promotions;

create policy "active_promotions_public_read"
on public.business_promotions for select
to anon, authenticated
using (is_active);

create policy "admins_read_all_promotions"
on public.business_promotions for select
to authenticated
using ((select public.is_admin()));
