-- Ticket 21 enhancement: give each lister a deliberately public marketplace
-- logo/photo while keeping the existing profile avatar private.

alter table public.profiles
  add column if not exists public_logo_url text;

alter table public.properties
  add column if not exists owner_logo_url text;

update public.properties p
set owner_logo_url = nullif(trim(pr.public_logo_url), '')
from public.profiles pr
where pr.id = p.owner_id;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lister-public-images',
  'lister-public-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lister_public_images_select" on storage.objects;
create policy "lister_public_images_select"
on storage.objects for select to anon, authenticated
using (bucket_id = 'lister-public-images');

drop policy if exists "lister_public_images_upload" on storage.objects;
create policy "lister_public_images_upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'lister-public-images'
  and public.is_lister()
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "lister_public_images_owner_update" on storage.objects;
create policy "lister_public_images_owner_update"
on storage.objects for update to authenticated
using (
  bucket_id = 'lister-public-images'
  and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
)
with check (
  bucket_id = 'lister-public-images'
  and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
);

drop policy if exists "lister_public_images_owner_delete" on storage.objects;
create policy "lister_public_images_owner_delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'lister-public-images'
  and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
);

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
    new.owner_logo_url := nullif(trim(lister_profile.public_logo_url), '');
  end if;
  return new;
end;
$$;

revoke all on function private.populate_property_lister_profile() from public, anon, authenticated;

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
      owner_lister_type = nullif(trim(new.lister_type), ''),
      owner_logo_url = nullif(trim(new.public_logo_url), '')
  where owner_id = new.id;
  return new;
end;
$$;

drop trigger if exists sync_lister_public_contact on public.profiles;
create trigger sync_lister_public_contact
after update of full_name, company_name, phone, email, business_address,
  business_description, lister_type, public_logo_url
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
  owner_business_description, owner_lister_type, owner_logo_url
from public.properties
where status = 'approved';

grant select on public.public_properties to anon, authenticated;
