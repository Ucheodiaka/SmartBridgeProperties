-- Ticket 19: flexible multi-year leases and transparent itemized charges.

alter table public.property_submissions
  drop constraint if exists property_submissions_listing_type_check;
alter table public.property_submissions
  add constraint property_submissions_listing_type_check
  check (listing_type in ('sale', 'rent', 'lease'));

alter table public.properties
  add column if not exists lease_term_years integer,
  add column if not exists agency_fee numeric(14,2) not null default 0,
  add column if not exists caution_fee numeric(14,2) not null default 0,
  add column if not exists service_charge numeric(14,2) not null default 0,
  add column if not exists legal_fee numeric(14,2) not null default 0,
  add column if not exists other_charges numeric(14,2) not null default 0,
  add column if not exists other_charges_description text;

alter table public.property_submissions
  add column if not exists lease_term_years integer,
  add column if not exists agency_fee numeric(14,2) not null default 0,
  add column if not exists caution_fee numeric(14,2) not null default 0,
  add column if not exists service_charge numeric(14,2) not null default 0,
  add column if not exists legal_fee numeric(14,2) not null default 0,
  add column if not exists other_charges numeric(14,2) not null default 0,
  add column if not exists other_charges_description text;

alter table public.property_submissions
  add constraint submissions_lease_term_valid
  check ((listing_type <> 'lease' and lease_term_years is null) or (listing_type = 'lease' and lease_term_years between 1 and 99));

alter table public.properties
  add constraint properties_charges_nonnegative
  check (agency_fee >= 0 and caution_fee >= 0 and service_charge >= 0 and legal_fee >= 0 and other_charges >= 0);
alter table public.property_submissions
  add constraint submissions_charges_nonnegative
  check (agency_fee >= 0 and caution_fee >= 0 and service_charge >= 0 and legal_fee >= 0 and other_charges >= 0);

drop view if exists public.public_properties;
create view public.public_properties
with (security_invoker = true) as
select
  id, title, slug, location, neighborhood, address, price, price_display,
  price_period, is_negotiable, lease_term_years, agency_fee, caution_fee,
  service_charge, legal_fee, other_charges, other_charges_description,
  type, property_type, bedrooms, bathrooms, parking_spaces, size_sq_ft,
  is_verified, is_featured, status, images, videos, video_url, description,
  features, amenities, created_at, updated_at,
  coalesce(nullif(trim(owner_company_name), ''), nullif(trim(owner_name), ''), 'Verified Property Lister') as owner_company_name,
  owner_phone
from public.properties
where status = 'approved';

grant select on public.public_properties to anon, authenticated;

create or replace function public.sync_approved_property_negotiable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'approved'
     and new.approved_property_id is not null
     and old.status is distinct from new.status then
    update public.properties
    set is_negotiable = new.is_negotiable,
        lease_term_years = new.lease_term_years,
        agency_fee = new.agency_fee,
        caution_fee = new.caution_fee,
        service_charge = new.service_charge,
        legal_fee = new.legal_fee,
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
