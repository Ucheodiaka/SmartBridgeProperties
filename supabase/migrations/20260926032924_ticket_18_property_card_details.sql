-- Ticket 18: richer public property cards and negotiable pricing.
-- The full address is intentionally public because it is now a marketplace
-- listing field requested for property seekers. Private owner fields remain
-- excluded from the view except the contact fields introduced in Ticket 10.

alter table public.properties
  add column if not exists is_negotiable boolean not null default false;

alter table public.property_submissions
  add column if not exists is_negotiable boolean not null default false;

comment on column public.properties.is_negotiable is
  'Whether the published asking price may be negotiated.';
comment on column public.property_submissions.is_negotiable is
  'Lister-provided negotiable choice pending administrator approval.';

drop view if exists public.public_properties;
create view public.public_properties
with (security_invoker = true) as
select
  id, title, slug, location, neighborhood, address, price, price_display,
  price_period, is_negotiable, type, property_type, bedrooms, bathrooms,
  parking_spaces, size_sq_ft, is_verified, is_featured, status, images,
  videos, video_url, description, features, amenities, created_at, updated_at,
  coalesce(
    nullif(trim(owner_company_name), ''),
    nullif(trim(owner_name), ''),
    'Verified Property Lister'
  ) as owner_company_name,
  owner_phone
from public.properties
where status = 'approved';

grant select on public.public_properties to anon, authenticated;

-- Approval remains the only point where a pending negotiable change reaches
-- the live property. This trigger complements both existing approval RPCs
-- without broadening their permissions.
create or replace function public.sync_approved_property_negotiable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'approved'
     and new.approved_property_id is not null
     and (
       old.status is distinct from new.status
       or old.is_negotiable is distinct from new.is_negotiable
       or old.approved_property_id is distinct from new.approved_property_id
     ) then
    update public.properties
    set is_negotiable = new.is_negotiable,
        updated_at = timezone('utc', now())
    where id = new.approved_property_id
      and owner_id = new.owner_id;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_approved_property_negotiable
on public.property_submissions;
create trigger sync_approved_property_negotiable
after update of status, approved_property_id, is_negotiable
on public.property_submissions
for each row execute function public.sync_approved_property_negotiable();
