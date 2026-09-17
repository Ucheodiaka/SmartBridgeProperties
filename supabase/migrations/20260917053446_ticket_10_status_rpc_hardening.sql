-- Ticket 10 follow-up: keep the privileged status update implementation out
-- of the exposed public schema. The public RPC remains SECURITY INVOKER.
drop function if exists public.update_my_inquiry_status(uuid, text);

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
