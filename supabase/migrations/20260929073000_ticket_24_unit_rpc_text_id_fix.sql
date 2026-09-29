-- Property identifiers are stored as text, so the unit-management RPC must
-- accept and return text identifiers as well.
drop function if exists public.update_property_units(uuid, integer);
drop function if exists private.update_property_units(uuid, integer);

create or replace function private.update_property_units(
  p_property_id text,
  p_available_units integer
)
returns table(property_id text, total_units integer, available_units integer, new_status text)
language plpgsql security definer set search_path = '' as $$
begin
  if not (select public.is_admin()) then
    raise exception 'Administrator access required';
  end if;

  update public.properties p
  set available_units = p_available_units
  where p.id = p_property_id
    and p_available_units between 0 and p.total_units;

  if not found then
    raise exception 'Invalid property or unit quantity';
  end if;

  return query
  select p.id, p.total_units, p.available_units, p.status
  from public.properties p
  where p.id = p_property_id;
end;
$$;

revoke all on function private.update_property_units(text, integer) from public, anon;
grant execute on function private.update_property_units(text, integer) to authenticated;

create function public.update_property_units(
  p_property_id text,
  p_available_units integer
)
returns table(property_id text, total_units integer, available_units integer, new_status text)
language sql security invoker set search_path = '' as $$
  select * from private.update_property_units(p_property_id, p_available_units);
$$;

revoke all on function public.update_property_units(text, integer) from public, anon;
grant execute on function public.update_property_units(text, integer) to authenticated;
