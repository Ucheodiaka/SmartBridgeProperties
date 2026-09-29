create table if not exists public.business_promotions (
  id uuid primary key default gen_random_uuid(),
  business_name text not null check (char_length(trim(business_name)) between 2 and 120),
  category text not null check (category in (
    'Property Management',
    'Property Consulting',
    'Property Valuation',
    'Verified Partner',
    'Other Service'
  )),
  description text not null check (char_length(trim(description)) between 10 and 500),
  image_url text,
  link_url text,
  phone text,
  cta_label text not null default 'Learn More' check (char_length(trim(cta_label)) between 2 and 40),
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_promotions enable row level security;

grant select on table public.business_promotions to anon, authenticated;
grant insert, update, delete on table public.business_promotions to authenticated;

drop policy if exists "active_promotions_public_read" on public.business_promotions;
create policy "active_promotions_public_read"
on public.business_promotions for select
to anon, authenticated
using (is_active or public.is_admin());

drop policy if exists "admins_create_promotions" on public.business_promotions;
create policy "admins_create_promotions"
on public.business_promotions for insert
to authenticated
with check (public.is_admin());

drop policy if exists "admins_update_promotions" on public.business_promotions;
create policy "admins_update_promotions"
on public.business_promotions for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins_delete_promotions" on public.business_promotions;
create policy "admins_delete_promotions"
on public.business_promotions for delete
to authenticated
using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'homepage-promotions',
  'homepage-promotions',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "homepage_promotions_public_read" on storage.objects;
create policy "homepage_promotions_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'homepage-promotions');

drop policy if exists "homepage_promotions_admin_upload" on storage.objects;
create policy "homepage_promotions_admin_upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'homepage-promotions' and public.is_admin());

drop policy if exists "homepage_promotions_admin_update" on storage.objects;
create policy "homepage_promotions_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'homepage-promotions' and public.is_admin())
with check (bucket_id = 'homepage-promotions' and public.is_admin());

drop policy if exists "homepage_promotions_admin_delete" on storage.objects;
create policy "homepage_promotions_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'homepage-promotions' and public.is_admin());
