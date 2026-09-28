-- Ticket 22: allow the assigned lister to confirm, reschedule, complete, or
-- cancel a viewing request without exposing another lister's bookings.

alter table public.inspection_bookings
  add column if not exists confirmed_date date,
  add column if not exists confirmed_time time,
  add column if not exists lister_response text,
  add column if not exists responded_at timestamptz;

-- The RPC return shape gains the four response fields, so replace the existing
-- wrapper before replacing its private implementation.
drop function if exists public.fetch_my_inspection_bookings();
drop function if exists private.fetch_my_inspection_bookings();

create function private.fetch_my_inspection_bookings()
returns table (
  id uuid, property_id text, property_title text, property_location text,
  property_price numeric, name text, email text, phone text,
  preferred_date date, preferred_time time, notes text, status text,
  lister_id uuid, created_at timestamptz, confirmed_date date,
  confirmed_time time, lister_response text, responded_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select b.id, b.property_id, b.property_title, b.property_location,
    b.property_price, b.name, b.email, b.phone, b.preferred_date,
    b.preferred_time, b.notes, b.status, b.lister_id, b.created_at,
    b.confirmed_date, b.confirmed_time, b.lister_response, b.responded_at
  from public.inspection_bookings b
  where b.lister_id = (select auth.uid())
    and (select public.is_lister())
  order by b.created_at desc;
$$;

create function public.fetch_my_inspection_bookings()
returns table (
  id uuid, property_id text, property_title text, property_location text,
  property_price numeric, name text, email text, phone text,
  preferred_date date, preferred_time time, notes text, status text,
  lister_id uuid, created_at timestamptz, confirmed_date date,
  confirmed_time time, lister_response text, responded_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$ select * from private.fetch_my_inspection_bookings(); $$;

revoke all on function private.fetch_my_inspection_bookings() from public, anon;
grant execute on function private.fetch_my_inspection_bookings() to authenticated;
revoke all on function public.fetch_my_inspection_bookings() from public, anon;
grant execute on function public.fetch_my_inspection_bookings() to authenticated;

create or replace function private.update_my_viewing_request(
  target_booking_id uuid,
  next_status text,
  next_confirmed_date date default null,
  next_confirmed_time time default null,
  next_lister_response text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if next_status not in ('confirmed', 'rescheduled', 'completed', 'cancelled') then
    raise exception 'Invalid viewing status';
  end if;

  if next_status in ('confirmed', 'rescheduled')
    and (next_confirmed_date is null or next_confirmed_time is null) then
    raise exception 'A confirmed date and time are required';
  end if;

  if not (select public.is_lister()) then
    raise exception 'Not authorized to manage viewing requests';
  end if;

  update public.inspection_bookings
  set status = next_status,
      confirmed_date = case
        when next_status in ('confirmed', 'rescheduled') then next_confirmed_date
        else confirmed_date
      end,
      confirmed_time = case
        when next_status in ('confirmed', 'rescheduled') then next_confirmed_time
        else confirmed_time
      end,
      lister_response = nullif(trim(next_lister_response), ''),
      responded_at = timezone('utc'::text, now())
  where id = target_booking_id
    and lister_id = (select auth.uid());

  return found;
end;
$$;

create or replace function public.update_my_viewing_request(
  target_booking_id uuid,
  next_status text,
  next_confirmed_date date default null,
  next_confirmed_time time default null,
  next_lister_response text default null
)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.update_my_viewing_request(
    target_booking_id,
    next_status,
    next_confirmed_date,
    next_confirmed_time,
    next_lister_response
  );
$$;

revoke all on function private.update_my_viewing_request(uuid, text, date, time, text) from public, anon;
grant execute on function private.update_my_viewing_request(uuid, text, date, time, text) to authenticated;
revoke all on function public.update_my_viewing_request(uuid, text, date, time, text) from public, anon;
grant execute on function public.update_my_viewing_request(uuid, text, date, time, text) to authenticated;
