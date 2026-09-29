-- Ticket 24: multiple similar units per listing.
alter table public.property_submissions
  add column if not exists total_units integer not null default 1,
  add column if not exists available_units integer not null default 1;

alter table public.properties
  add column if not exists total_units integer not null default 1,
  add column if not exists available_units integer not null default 1;

alter table public.property_submissions drop constraint if exists property_submissions_units_check;
alter table public.property_submissions add constraint property_submissions_units_check
  check (total_units >= 1 and available_units >= 0 and available_units <= total_units);
alter table public.properties drop constraint if exists properties_units_check;
alter table public.properties add constraint properties_units_check
  check (total_units >= 1 and available_units >= 0 and available_units <= total_units);

create or replace function private.normalize_property_unit_availability()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.status in ('approved', 'sold', 'rented') then
    if new.available_units = 0 then
      new.status := case when new.type = 'sale' then 'sold' else 'rented' end;
    elsif new.status in ('sold', 'rented') then
      new.status := 'approved';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.normalize_property_unit_availability() from public, anon, authenticated;

drop trigger if exists normalize_property_unit_availability on public.properties;
create trigger normalize_property_unit_availability
before insert or update of total_units, available_units on public.properties
for each row execute function private.normalize_property_unit_availability();

create or replace function private.sync_approved_submission_units()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'approved' and new.approved_property_id is not null then
    update public.properties
    set total_units = new.total_units, available_units = new.available_units
    where id = new.approved_property_id;
  end if;
  return new;
end;
$$;
revoke all on function private.sync_approved_submission_units() from public, anon, authenticated;
drop trigger if exists sync_approved_submission_units on public.property_submissions;
create trigger sync_approved_submission_units
after insert or update of status, total_units, available_units, approved_property_id on public.property_submissions
for each row execute function private.sync_approved_submission_units();

create or replace function public.update_property_units(p_property_id uuid, p_available_units integer)
returns table(property_id uuid, total_units integer, available_units integer, new_status text)
language plpgsql security definer set search_path = '' as $$
begin
  if not (select public.is_admin()) then raise exception 'Administrator access required'; end if;
  update public.properties p
  set available_units = p_available_units
  where p.id = p_property_id and p_available_units between 0 and p.total_units;
  if not found then raise exception 'Invalid property or unit quantity'; end if;
  return query select p.id, p.total_units, p.available_units, p.status from public.properties p where p.id=p_property_id;
end;
$$;
revoke all on function public.update_property_units(uuid, integer) from public, anon;
grant execute on function public.update_property_units(uuid, integer) to authenticated;

drop view if exists public.public_properties;
create view public.public_properties with (security_invoker = true) as
select id, title, slug, location, neighborhood, address, price, price_display,
 price_period, is_negotiable, lease_term_years, agency_fee_percentage, caution_fee,
 service_charge, legal_fee_percentage, other_charges, other_charges_description,
 type, property_type, bedrooms, bathrooms, parking_spaces, size_sq_ft, total_units,
 available_units, is_verified, is_featured, status, images, videos, video_url,
 description, features, amenities, created_at, updated_at,
 coalesce(nullif(trim(owner_company_name), ''), nullif(trim(owner_name), ''), 'Verified Property Lister') as owner_company_name,
 owner_phone, owner_email, owner_business_address, owner_business_description,
 owner_lister_type, owner_logo_url
from public.properties where status in ('approved','sold','rented');
grant select on public.public_properties to anon, authenticated;
