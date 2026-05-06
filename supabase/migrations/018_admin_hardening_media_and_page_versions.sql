insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do update set public = true;

drop policy if exists "public can read assets" on storage.objects;
create policy "public can read assets"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'assets');

drop policy if exists "admins can manage assets" on storage.objects;
create policy "admins can manage assets"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'assets'
  and (
    coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  )
)
with check (
  bucket_id = 'assets'
  and (
    coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  )
);

create table if not exists public.site_page_versions (
  id bigserial primary key,
  page_id uuid not null references public.site_pages(id) on delete cascade,
  content jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid
);

create index if not exists site_page_versions_page_id_idx
on public.site_page_versions (page_id, created_at desc);

alter table public.site_page_versions enable row level security;

drop policy if exists "admins can read site page versions" on public.site_page_versions;
create policy "admins can read site page versions"
on public.site_page_versions
for select
to authenticated
using (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "admins can insert site page versions" on public.site_page_versions;
create policy "admins can insert site page versions"
on public.site_page_versions
for insert
to authenticated
with check (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists site_pages_select_published_authenticated on public.site_pages;
drop policy if exists site_pages_write_authenticated on public.site_pages;

drop policy if exists "site_pages_select_admins" on public.site_pages;
create policy "site_pages_select_admins"
on public.site_pages
for select
to authenticated
using (
  status = 'published'
  or coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "site_pages_write_admins" on public.site_pages;
create policy "site_pages_write_admins"
on public.site_pages
for all
to authenticated
using (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
)
with check (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

grant select, insert on public.site_page_versions to authenticated;

notify pgrst, 'reload schema';

