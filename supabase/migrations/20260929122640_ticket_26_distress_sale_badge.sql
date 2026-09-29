-- Ticket 26: lister-selected distress sale status, published only after
-- the existing administrator approval workflow succeeds.
alter table public.property_submissions
  add column if not exists is_distress_sale boolean not null default false;

alter table public.properties
  add column if not exists is_distress_sale boolean not null default false;

comment on column public.property_submissions.is_distress_sale is
  'Lister-selected distress sale flag pending administrator approval.';
comment on column public.properties.is_distress_sale is
  'Administrator-approved distress sale flag displayed publicly for sale listings.';

create or replace function public.sync_approved_property_negotiable()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status = 'approved'
     and new.approved_property_id is not null
     and old.status is distinct from new.status then
    update public.properties
    set is_negotiable = new.is_negotiable,
        is_distress_sale = case when new.listing_type = 'sale' then new.is_distress_sale else false end,
        lease_term_years = new.lease_term_years,
        agency_fee_percentage = new.agency_fee_percentage,
        caution_fee = new.caution_fee,
        service_charge = new.service_charge,
        legal_fee_percentage = new.legal_fee_percentage,
        other_charges = new.other_charges,
        other_charges_description = new.other_charges_description,
        price_period = case when new.listing_type = 'rent' then '/yr' when new.listing_type = 'lease' then '/lease' else null end,
        updated_at = timezone('utc', now())
    where id = new.approved_property_id
      and owner_id = new.owner_id;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_approved_property_negotiable on public.property_submissions;
create trigger sync_approved_property_negotiable
after update of status, approved_property_id, is_negotiable, is_distress_sale
on public.property_submissions
for each row execute function public.sync_approved_property_negotiable();

drop view if exists public.public_properties;
create view public.public_properties
with (security_invoker = true) as
select id, title, slug, location, neighborhood, address, price, price_display,
 price_period, is_negotiable, is_distress_sale, lease_term_years,
 agency_fee_percentage, caution_fee, service_charge, legal_fee_percentage,
 other_charges, other_charges_description, type, property_type, bedrooms,
 bathrooms, parking_spaces, size_sq_ft, total_units, available_units,
 is_verified, is_featured, status, images, videos, video_url, description,
 features, amenities, created_at, updated_at,
 coalesce(nullif(trim(owner_company_name), ''), nullif(trim(owner_name), ''), 'Verified Property Lister') as owner_company_name,
 owner_phone, owner_email, owner_business_address, owner_business_description,
 owner_lister_type, owner_logo_url
from public.properties
where status in ('approved', 'sold', 'rented');

grant select on public.public_properties to anon, authenticated;
