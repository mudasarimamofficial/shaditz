alter table public.leads alter column phone drop not null;

create table if not exists public.homepage_content (
  id bigint primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists homepage_content_set_updated_at on public.homepage_content;
create trigger homepage_content_set_updated_at
before update on public.homepage_content
for each row execute procedure public.set_updated_at();

insert into public.homepage_content (id, content)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.homepage_content enable row level security;

drop policy if exists "public can read homepage content" on public.homepage_content;
create policy "public can read homepage content"
on public.homepage_content
for select
to anon, authenticated
using (true);

drop policy if exists "admins can update homepage content" on public.homepage_content;
create policy "admins can update homepage content"
on public.homepage_content
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

drop policy if exists "admins can insert homepage content" on public.homepage_content;
create policy "admins can insert homepage content"
on public.homepage_content
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

insert into storage.buckets (id, name, public)
values ('homepage', 'homepage', true)
on conflict (id) do update set public = true;

drop policy if exists "public can read homepage media" on storage.objects;
create policy "public can read homepage media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'homepage');

drop policy if exists "admins can manage homepage media" on storage.objects;
create policy "admins can manage homepage media"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'homepage' and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
)
with check (
  bucket_id = 'homepage' and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

