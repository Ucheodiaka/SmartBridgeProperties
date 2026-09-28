-- Ticket 23: keep sold and rented listings visible for marketplace trust and
-- history while continuing to block enquiries and viewings for them.

drop policy if exists properties_select_approved on public.properties;
drop policy if exists properties_select_marketplace on public.properties;
create policy properties_select_marketplace
on public.properties
for select
to anon, authenticated
using (status in ('approved', 'sold', 'rented'));

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
  owner_phone, owner_email, owner_business_address,
  owner_business_description, owner_lister_type, owner_logo_url
from public.properties
where status in ('approved', 'sold', 'rented');

grant select on public.public_properties to anon, authenticated;
