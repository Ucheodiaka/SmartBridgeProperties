-- Ticket 7: approved property edits require administrator approval.
-- The published property remains unchanged while its linked submission is pending.

drop policy if exists "submissions_update_owner" on public.property_submissions;
create policy "submissions_update_owner"
on public.property_submissions for update to authenticated
using (
  owner_id = (select auth.uid())
  and public.is_lister()
  and status in ('draft', 'pending', 'rejected', 'approved')
)
with check (
  owner_id = (select auth.uid())
  and public.is_lister()
  and status in ('draft', 'pending', 'rejected')
);

create or replace function public.handle_submission_status_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.owner_id is distinct from old.owner_id then
    raise exception 'Property submission ownership cannot be changed.';
  end if;

  if new.approved_property_id is distinct from old.approved_property_id then
    raise exception 'The approved property link cannot be changed.';
  end if;

  if old.status = 'approved' and old.approved_property_id is not null then
    new.status := 'pending';
    new.submitted_at := timezone('utc'::text, now());
    return new;
  end if;

  if new.status in ('approved', 'sold', 'rented', 'unpublished') then
    raise exception 'Only SmartBridge administrators can publish a property submission.';
  end if;

  if old.status = 'rejected' and new.status <> 'draft' then
    new.status := 'pending';
  end if;

  if new.status not in ('draft', 'pending') then
    new.status := 'pending';
  end if;

  return new;
end;
$$;

revoke all on function public.handle_submission_status_transition() from public;

create or replace function public.approve_property_update(
  p_submission_id uuid,
  p_audit_score integer default 100
)
returns table(property_id text, already_approved boolean)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_submission public.property_submissions%rowtype;
  v_property_id text;
  v_score integer := greatest(0, least(100, coalesce(p_audit_score, 100)));
begin
  if (select auth.uid()) is null or not public.is_admin() then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;

  select * into v_submission
  from public.property_submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception 'Property submission was not found.' using errcode = 'P0002';
  end if;

  if v_submission.status <> 'pending' then
    raise exception 'Only pending submissions can be approved.' using errcode = '22023';
  end if;

  if v_submission.approved_property_id is null then
    raise exception 'This submission is not linked to an approved property.' using errcode = '22023';
  end if;

  update public.properties
    set title = v_submission.title,
        slug = trim(both '-' from regexp_replace(lower(v_submission.title), '[^a-z0-9]+', '-', 'g')) || '-' || left(v_submission.id::text, 8),
        price = v_submission.price,
        price_display = '₦' || trim(to_char(v_submission.price, 'FM999,999,999,999,990')),
        period = case when v_submission.listing_type = 'rent' then '/yr' else null end,
        price_period = case when v_submission.listing_type = 'rent' then '/yr' else null end,
        for_rent = v_submission.listing_type = 'rent',
        type = v_submission.listing_type,
        location = v_submission.location,
        neighborhood = coalesce(nullif(trim(v_submission.neighborhood), ''), nullif(trim(v_submission.location), ''), 'Port Harcourt'),
        address = coalesce(nullif(trim(v_submission.address), ''), v_submission.location),
        property_type = v_submission.property_type,
        bedrooms = coalesce(v_submission.bedrooms, 0),
        bathrooms = coalesce(v_submission.bathrooms, 0),
        description = coalesce(nullif(trim(v_submission.description), ''), 'Verified property in ' || v_submission.location || ', Port Harcourt.'),
        images = coalesce(v_submission.images, '{}'::text[]),
        videos = coalesce(v_submission.videos, '{}'::text[]),
        video_url = v_submission.video_url,
        title_document_type = coalesce(v_submission.title_doc_type, v_submission.title_document_type, 'Certificate of Occupancy (C of O)'),
        status = 'approved',
        updated_at = timezone('utc'::text, now())
    where id = v_submission.approved_property_id
      and owner_id = v_submission.owner_id;

  if not found then
    raise exception 'The linked approved property was not found.' using errcode = '23503';
  end if;

  update public.property_submissions
    set status = 'approved',
        audit_notes = 'Property update approved and published to the marketplace.',
        structural_score = v_score,
        updated_at = timezone('utc'::text, now())
    where id = p_submission_id;

  property_id := v_submission.approved_property_id;
  already_approved := true;
  return next;
end;
$$;

revoke all on function public.approve_property_update(uuid, integer) from public, anon;
grant execute on function public.approve_property_update(uuid, integer) to authenticated;
