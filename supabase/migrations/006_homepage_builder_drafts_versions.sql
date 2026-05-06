create table if not exists public.homepage_content_drafts (
  id bigint primary key,
  content jsonb not null default '{}'::jsonb,
  published_updated_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_content_versions (
  id bigserial primary key,
  homepage_id bigint not null,
  content jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid
);

create index if not exists homepage_content_versions_homepage_id_idx
on public.homepage_content_versions (homepage_id, created_at desc);

create or replace function public.set_updated_at_any()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists homepage_content_drafts_set_updated_at on public.homepage_content_drafts;
create trigger homepage_content_drafts_set_updated_at
before update on public.homepage_content_drafts
for each row execute procedure public.set_updated_at_any();

alter table public.homepage_content_drafts enable row level security;
alter table public.homepage_content_versions enable row level security;

drop policy if exists "admins can read drafts" on public.homepage_content_drafts;
create policy "admins can read drafts"
on public.homepage_content_drafts
for select
to authenticated
using (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "admins can upsert drafts" on public.homepage_content_drafts;
create policy "admins can upsert drafts"
on public.homepage_content_drafts
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

drop policy if exists "admins can read versions" on public.homepage_content_versions;
create policy "admins can read versions"
on public.homepage_content_versions
for select
to authenticated
using (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "admins can insert versions" on public.homepage_content_versions;
create policy "admins can insert versions"
on public.homepage_content_versions
for insert
to authenticated
with check (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

insert into public.homepage_content_drafts (id, content)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

notify pgrst, 'reload schema';

