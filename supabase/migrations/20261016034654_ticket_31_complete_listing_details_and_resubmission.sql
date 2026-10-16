-- Ticket 31: collect complete lister-supplied property details and publish
-- them only through the existing administrator approval workflow.

alter table public.property_submissions
  add column if not exists parking_spaces integer not null default 0,
  add column if not exists size_sq_ft integer not null default 0,
  add column if not exists features text[] not null default '{}',
  add column if not exists amenities text[] not null default '{}';

alter table public.property_submissions
  drop constraint if exists property_submissions_parking_spaces_nonnegative,
  add constraint property_submissions_parking_spaces_nonnegative check (parking_spaces >= 0),
  drop constraint if exists property_submissions_size_sq_ft_nonnegative,
  add constraint property_submissions_size_sq_ft_nonnegative check (size_sq_ft >= 0);

comment on column public.property_submissions.parking_spaces is
  'Lister-supplied number of parking bays, pending administrator approval.';
comment on column public.property_submissions.size_sq_ft is
  'Lister-supplied property floor or plot size in square feet, pending administrator approval.';
comment on column public.property_submissions.features is
  'Lister-supplied interior and structural features, pending administrator approval.';
comment on column public.property_submissions.amenities is
  'Lister-supplied estate amenities and utilities, pending administrator approval.';

-- The approval functions already set the approved property link and change
-- the submission status to approved. This trigger copies every lister-supplied
-- marketplace field only after that administrator action succeeds.
create or replace function public.sync_approved_property_negotiable()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status = 'approved'
     and new.approved_property_id is not null
     and old.status is distinct from new.status then
    update public.properties
    set parking_spaces = new.parking_spaces,
        size_sq_ft = new.size_sq_ft,
        features = coalesce(new.features, '{}'::text[]),
        amenities = coalesce(new.amenities, '{}'::text[]),
        is_negotiable = new.is_negotiable,
        is_distress_sale = case when new.listing_type = 'sale' then new.is_distress_sale else false end,
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

drop trigger if exists sync_approved_property_negotiable on public.property_submissions;
create trigger sync_approved_property_negotiable
after update of status, approved_property_id, is_negotiable, is_distress_sale,
  parking_spaces, size_sq_ft, features, amenities
on public.property_submissions
for each row execute function public.sync_approved_property_negotiable();
