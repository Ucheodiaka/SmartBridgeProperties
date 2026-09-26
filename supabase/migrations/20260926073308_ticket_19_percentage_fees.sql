-- Ticket 19 correction: agency and legal fees are percentages of listed price.

alter table public.properties
  rename column agency_fee to agency_fee_percentage;
alter table public.properties
  rename column legal_fee to legal_fee_percentage;
alter table public.property_submissions
  rename column agency_fee to agency_fee_percentage;
alter table public.property_submissions
  rename column legal_fee to legal_fee_percentage;

alter table public.properties
  add constraint properties_percentage_fees_valid
  check (agency_fee_percentage between 0 and 100 and legal_fee_percentage between 0 and 100);
alter table public.property_submissions
  add constraint submissions_percentage_fees_valid
  check (agency_fee_percentage between 0 and 100 and legal_fee_percentage between 0 and 100);

comment on column public.properties.agency_fee_percentage is 'Agency fee percentage calculated from the listed property price.';
comment on column public.properties.legal_fee_percentage is 'Legal fee percentage calculated from the listed property price.';
comment on column public.property_submissions.agency_fee_percentage is 'Lister-provided agency fee percentage pending admin approval.';
comment on column public.property_submissions.legal_fee_percentage is 'Lister-provided legal fee percentage pending admin approval.';

drop view if exists public.public_properties;
create view public.public_properties
with (security_invoker = true) as
select
  id, title, slug, location, neighborhood, address, price, price_display,
  price_period, is_negotiable, lease_term_years, agency_fee_percentage,
  caution_fee, service_charge, legal_fee_percentage, other_charges,
  other_charges_description, type, property_type, bedrooms, bathrooms,
  parking_spaces, size_sq_ft, is_verified, is_featured, status, images,
  videos, video_url, description, features, amenities, created_at, updated_at,
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
