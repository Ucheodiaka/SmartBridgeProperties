-- Ticket 10: route public enquiries and viewing requests to the verified
-- property lister while retaining complete admin oversight.

alter table public.properties
  add column if not exists owner_company_name text;

alter table public.property_inquiries
  add column if not exists lister_id uuid references auth.users(id) on delete set null,
  add column if not exists owner_name text;

alter table public.inspection_bookings
  add column if not exists lister_id uuid references auth.users(id) on delete set null;

update public.properties p
set owner_company_name = coalesce(nullif(trim(p.owner_company_name), ''), nullif(trim(pr.company_name), ''), nullif(trim(pr.full_name), ''), nullif(trim(p.owner_name), '')),
    owner_phone = coalesce(nullif(trim(p.owner_phone), ''), nullif(trim(pr.phone), ''))
from public.profiles pr
where pr.id = p.owner_id
  and (nullif(trim(p.owner_company_name), '') is null or nullif(trim(p.owner_phone), '') is null);

update public.property_inquiries i
set lister_id = p.owner_id,
    owner_id = p.owner_id::text,
    owner_email = coalesce(pr.email, p.owner_email),
    owner_name = coalesce(nullif(trim(pr.company_name), ''), nullif(trim(pr.full_name), ''), nullif(trim(p.owner_name), ''))
from public.properties p
left join public.profiles pr on pr.id = p.owner_id
where p.id = i.property_id
  and i.lister_id is null;

update public.inspection_bookings b
set lister_id = p.owner_id
from public.properties p
where p.id = b.property_id
  and b.lister_id is null;

create index if not exists property_inquiries_lister_id_idx
  on public.property_inquiries (lister_id, created_at desc);
create index if not exists inspection_bookings_lister_id_idx
  on public.inspection_bookings (lister_id, created_at desc);

create or replace function private.route_property_inquiry_to_lister()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_property public.properties%rowtype;
  target_profile public.profiles%rowtype;
begin
  select * into target_property
  from public.properties
  where id = new.property_id and status = 'approved';

  if not found or target_property.owner_id is null then
    raise exception 'This property is not available for lister enquiries';
  end if;

  select * into target_profile from public.profiles where id = target_property.owner_id;
  new.lister_id := target_property.owner_id;
  new.owner_id := target_property.owner_id::text;
  new.owner_email := coalesce(target_profile.email, target_property.owner_email);
  new.owner_name := coalesce(nullif(trim(target_profile.company_name), ''), nullif(trim(target_profile.full_name), ''), nullif(trim(target_property.owner_name), ''), 'Verified Property Lister');
  return new;
end;
$$;

create or replace function private.route_viewing_to_lister()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_lister uuid;
begin
  select owner_id into target_lister
  from public.properties
  where id = new.property_id and status = 'approved';

  if target_lister is null then
    raise exception 'This property is not available for viewing requests';
  end if;

  new.lister_id := target_lister;
  return new;
end;
$$;

drop trigger if exists route_property_inquiry_to_lister on public.property_inquiries;
create trigger route_property_inquiry_to_lister
before insert on public.property_inquiries
for each row execute function private.route_property_inquiry_to_lister();

drop trigger if exists route_viewing_to_lister on public.inspection_bookings;
create trigger route_viewing_to_lister
before insert on public.inspection_bookings
for each row execute function private.route_viewing_to_lister();

create or replace function private.sync_lister_public_contact()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.properties
  set owner_company_name = coalesce(nullif(trim(new.company_name), ''), nullif(trim(new.full_name), ''), owner_name),
      owner_phone = coalesce(nullif(trim(new.phone), ''), owner_phone)
  where owner_id = new.id;
  return new;
end;
$$;

drop trigger if exists sync_lister_public_contact on public.profiles;
create trigger sync_lister_public_contact
after update of full_name, company_name, phone on public.profiles
for each row execute function private.sync_lister_public_contact();

drop view if exists public.public_properties;
create view public.public_properties
with (security_invoker = true) as
select
  id, title, slug, location, neighborhood, price, price_display, price_period,
  type, property_type, bedrooms, bathrooms, parking_spaces, size_sq_ft,
  is_verified, is_featured, status, images, videos, video_url, description,
  features, amenities, created_at, updated_at,
  coalesce(nullif(trim(owner_company_name), ''), nullif(trim(owner_name), ''), 'Verified Property Lister') as owner_company_name,
  owner_phone
from public.properties
where status = 'approved';

grant select on public.public_properties to anon, authenticated;

drop policy if exists inquiries_lister_select on public.property_inquiries;
create policy inquiries_lister_select
on public.property_inquiries
for select
to authenticated
using (lister_id = (select auth.uid()) and (select public.is_lister()));

drop policy if exists inquiries_lister_update on public.property_inquiries;
create policy inquiries_lister_update
on public.property_inquiries
for update
to authenticated
using (lister_id = (select auth.uid()) and (select public.is_lister()))
with check (lister_id = (select auth.uid()) and (select public.is_lister()));

drop policy if exists bookings_lister_select on public.inspection_bookings;
create policy bookings_lister_select
on public.inspection_bookings
for select
to authenticated
using (lister_id = (select auth.uid()) and (select public.is_lister()));

create or replace function private.limit_lister_inquiry_updates()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select public.is_admin()) then
    return new;
  end if;

  if old.lister_id = (select auth.uid()) and (select public.is_lister()) then
    if new.id is distinct from old.id
      or new.property_id is distinct from old.property_id
      or new.property_title is distinct from old.property_title
      or new.property_location is distinct from old.property_location
      or new.property_price is distinct from old.property_price
      or new.owner_id is distinct from old.owner_id
      or new.owner_email is distinct from old.owner_email
      or new.owner_name is distinct from old.owner_name
      or new.lister_id is distinct from old.lister_id
      or new.buyer_name is distinct from old.buyer_name
      or new.buyer_email is distinct from old.buyer_email
      or new.buyer_phone is distinct from old.buyer_phone
      or new.inquiry_type is distinct from old.inquiry_type
      or new.offered_price is distinct from old.offered_price
      or new.payment_method is distinct from old.payment_method
      or new.timeline is distinct from old.timeline
      or new.message is distinct from old.message
      or new.created_at is distinct from old.created_at
      or new.admin_notes is distinct from old.admin_notes
      or new.assigned_staff_id is distinct from old.assigned_staff_id
      or new.assigned_staff_name is distinct from old.assigned_staff_name
      or new.follow_up_at is distinct from old.follow_up_at
      or new.contact_attempts is distinct from old.contact_attempts
      or new.last_contacted_at is distinct from old.last_contacted_at then
      raise exception 'Listers may only update the enquiry status';
    end if;
    if new.status not in ('new', 'contacted', 'tour_scheduled', 'closed') then
      raise exception 'Invalid enquiry status';
    end if;
    return new;
  end if;

  raise exception 'Not authorized to update this enquiry';
end;
$$;

drop trigger if exists limit_lister_inquiry_updates on public.property_inquiries;
create trigger limit_lister_inquiry_updates
before update on public.property_inquiries
for each row execute function private.limit_lister_inquiry_updates();

revoke all on function private.route_property_inquiry_to_lister() from public, anon, authenticated;
revoke all on function private.route_viewing_to_lister() from public, anon, authenticated;
revoke all on function private.sync_lister_public_contact() from public, anon, authenticated;
revoke all on function private.limit_lister_inquiry_updates() from public, anon, authenticated;

-- Listers read through safe, owner-filtered views so private admin follow-up
-- notes and assignments are never returned to the lister's browser.
drop policy if exists inquiries_lister_select on public.property_inquiries;
drop policy if exists inquiries_lister_update on public.property_inquiries;
drop policy if exists bookings_lister_select on public.inspection_bookings;
drop trigger if exists limit_lister_inquiry_updates on public.property_inquiries;
drop function if exists private.limit_lister_inquiry_updates();

create or replace function private.fetch_my_property_inquiries()
returns table (
  id uuid, property_id text, property_title text, property_location text,
  property_price numeric, owner_id text, owner_email text, owner_name text,
  lister_id uuid, buyer_name text, buyer_email text, buyer_phone text,
  inquiry_type text, offered_price numeric, timeline text, message text,
  status text, created_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select i.id, i.property_id, i.property_title, i.property_location,
    i.property_price, i.owner_id, i.owner_email, i.owner_name, i.lister_id,
    i.buyer_name, i.buyer_email, i.buyer_phone, i.inquiry_type,
    i.offered_price, i.timeline, i.message, i.status, i.created_at
  from public.property_inquiries i
  where i.lister_id = (select auth.uid())
    and (select public.is_lister())
  order by i.created_at desc;
$$;

create or replace function private.fetch_my_inspection_bookings()
returns table (
  id uuid, property_id text, property_title text, property_location text,
  property_price numeric, name text, email text, phone text,
  preferred_date date, preferred_time time, notes text, status text,
  lister_id uuid, created_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select b.id, b.property_id, b.property_title, b.property_location,
    b.property_price, b.name, b.email, b.phone, b.preferred_date,
    b.preferred_time, b.notes, b.status, b.lister_id, b.created_at
  from public.inspection_bookings b
  where b.lister_id = (select auth.uid())
    and (select public.is_lister())
  order by b.created_at desc;
$$;

create or replace function public.fetch_my_property_inquiries()
returns table (
  id uuid, property_id text, property_title text, property_location text,
  property_price numeric, owner_id text, owner_email text, owner_name text,
  lister_id uuid, buyer_name text, buyer_email text, buyer_phone text,
  inquiry_type text, offered_price numeric, timeline text, message text,
  status text, created_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$ select * from private.fetch_my_property_inquiries(); $$;

create or replace function public.fetch_my_inspection_bookings()
returns table (
  id uuid, property_id text, property_title text, property_location text,
  property_price numeric, name text, email text, phone text,
  preferred_date date, preferred_time time, notes text, status text,
  lister_id uuid, created_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$ select * from private.fetch_my_inspection_bookings(); $$;

revoke all on function private.fetch_my_property_inquiries() from public, anon;
revoke all on function private.fetch_my_inspection_bookings() from public, anon;
grant execute on function private.fetch_my_property_inquiries() to authenticated;
grant execute on function private.fetch_my_inspection_bookings() to authenticated;
revoke all on function public.fetch_my_property_inquiries() from public, anon;
revoke all on function public.fetch_my_inspection_bookings() from public, anon;
grant execute on function public.fetch_my_property_inquiries() to authenticated;
grant execute on function public.fetch_my_inspection_bookings() to authenticated;

create or replace function private.update_my_inquiry_status(
  target_inquiry_id uuid,
  next_status text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if next_status not in ('new', 'contacted', 'tour_scheduled', 'closed') then
    raise exception 'Invalid enquiry status';
  end if;

  if (select public.is_admin()) then
    update public.property_inquiries set status = next_status where id = target_inquiry_id;
  elsif (select public.is_lister()) then
    update public.property_inquiries
    set status = next_status
    where id = target_inquiry_id and lister_id = (select auth.uid());
  else
    raise exception 'Not authorized to update enquiries';
  end if;

  return found;
end;
$$;

create or replace function public.update_my_inquiry_status(
  target_inquiry_id uuid,
  next_status text
)
returns boolean
language sql
security invoker
set search_path = ''
as $$ select private.update_my_inquiry_status(target_inquiry_id, next_status); $$;

revoke all on function private.update_my_inquiry_status(uuid, text) from public, anon;
grant execute on function private.update_my_inquiry_status(uuid, text) to authenticated;
revoke all on function public.update_my_inquiry_status(uuid, text) from public, anon;
grant execute on function public.update_my_inquiry_status(uuid, text) to authenticated;
