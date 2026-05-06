create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (lower(email));

alter table public.profiles enable row level security;

drop policy if exists "authenticated can read own profile" on public.profiles;
create policy "authenticated can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (id, email)
select u.id, u.email
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

drop policy if exists "admins can read leads" on public.leads;
create policy "admins can read leads"
on public.leads
for select
to authenticated
using (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

drop policy if exists "admins can update leads" on public.leads;
create policy "admins can update leads"
on public.leads
for update
to authenticated
using (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
)
with check (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

drop policy if exists "admins can read settings" on public.settings;
create policy "admins can read settings"
on public.settings
for select
to authenticated
using (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

drop policy if exists "admins can update settings" on public.settings;
create policy "admins can update settings"
on public.settings
for update
to authenticated
using (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
)
with check (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

drop policy if exists "admins can update homepage content" on public.homepage_content;
create policy "admins can update homepage content"
on public.homepage_content
for update
to authenticated
using (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
)
with check (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (
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
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

drop policy if exists "admins can manage homepage media" on storage.objects;
create policy "admins can manage homepage media"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'homepage'
  and (
    coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  )
)
with check (
  bucket_id = 'homepage'
  and (
    coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  )
);

