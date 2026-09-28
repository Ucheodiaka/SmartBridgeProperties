-- Ticket 21: persist complete lister business profiles and carry approved
-- public-facing business details through to marketplace property pages.

alter table public.profiles
  add column if not exists lister_type text,
  add column if not exists business_address text,
  add column if not exists business_description text;

alter table public.properties
  add column if not exists owner_business_address text,
  add column if not exists owner_business_description text,
  add column if not exists owner_lister_type text;

update public.properties p
set owner_company_name = coalesce(nullif(trim(pr.company_name), ''), nullif(trim(pr.full_name), ''), p.owner_company_name, p.owner_name),
    owner_phone = coalesce(nullif(trim(pr.phone), ''), p.owner_phone),
    owner_email = coalesce(nullif(trim(pr.email), ''), p.owner_email),
    owner_business_address = nullif(trim(pr.business_address), ''),
    owner_business_description = nullif(trim(pr.business_description), ''),
    owner_lister_type = nullif(trim(pr.lister_type), '')
from public.profiles pr
where pr.id = p.owner_id;

create or replace function private.populate_property_lister_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  lister_profile public.profiles%rowtype;
begin
  if new.owner_id is null then
    return new;
  end if;

  select * into lister_profile
  from public.profiles
  where id = new.owner_id;

  if found then
    new.owner_company_name := coalesce(nullif(trim(lister_profile.company_name), ''), nullif(trim(lister_profile.full_name), ''), new.owner_company_name, new.owner_name);
    new.owner_phone := coalesce(nullif(trim(lister_profile.phone), ''), new.owner_phone);
    new.owner_email := coalesce(nullif(trim(lister_profile.email), ''), new.owner_email);
    new.owner_business_address := nullif(trim(lister_profile.business_address), '');
    new.owner_business_description := nullif(trim(lister_profile.business_description), '');
    new.owner_lister_type := nullif(trim(lister_profile.lister_type), '');
  end if;
  return new;
end;
$$;

revoke all on function private.populate_property_lister_profile() from public, anon, authenticated;

drop trigger if exists populate_property_lister_profile on public.properties;
create trigger populate_property_lister_profile
before insert or update of owner_id on public.properties
for each row execute function private.populate_property_lister_profile();

create or replace function private.sync_lister_public_contact()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.properties
  set owner_company_name = coalesce(nullif(trim(new.company_name), ''), nullif(trim(new.full_name), ''), owner_name),
      owner_phone = coalesce(nullif(trim(new.phone), ''), owner_phone),
      owner_email = coalesce(nullif(trim(new.email), ''), owner_email),
      owner_business_address = nullif(trim(new.business_address), ''),
      owner_business_description = nullif(trim(new.business_description), ''),
      owner_lister_type = nullif(trim(new.lister_type), '')
  where owner_id = new.id;
  return new;
end;
$$;

drop trigger if exists sync_lister_public_contact on public.profiles;
create trigger sync_lister_public_contact
after update of full_name, company_name, phone, email, business_address, business_description, lister_type
on public.profiles
for each row execute function private.sync_lister_public_contact();

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
  owner_business_description, owner_lister_type
from public.properties
where status = 'approved';

grant select on public.public_properties to anon, authenticated;
