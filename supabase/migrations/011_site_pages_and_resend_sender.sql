create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  nav_label text,
  show_in_header_nav boolean not null default false,
  show_in_footer_nav boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  meta_title text,
  meta_description text,
  draft_content jsonb not null default '{}'::jsonb,
  published_content jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_pages enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'site_pages' and policyname = 'site_pages_select_published_anon'
  ) then
    create policy site_pages_select_published_anon
      on public.site_pages
      for select
      to anon
      using (status = 'published');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'site_pages' and policyname = 'site_pages_select_published_authenticated'
  ) then
    create policy site_pages_select_published_authenticated
      on public.site_pages
      for select
      to authenticated
      using (status = 'published' or status = 'draft');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'site_pages' and policyname = 'site_pages_write_authenticated'
  ) then
    create policy site_pages_write_authenticated
      on public.site_pages
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

grant select on public.site_pages to anon;
grant all privileges on public.site_pages to authenticated;

alter table public.settings
  add column if not exists resend_from_email text,
  add column if not exists resend_sender_status text,
  add column if not exists resend_sender_message text,
  add column if not exists resend_sender_checked_at timestamptz;

insert into public.site_pages (slug, title, nav_label, show_in_header_nav, show_in_footer_nav, status, meta_title, meta_description, draft_content, published_content, published_at)
values
  (
    'privacy-policy',
    'Privacy Policy',
    'Privacy Policy',
    false,
    true,
    'published',
    'Privacy Policy',
    'Privacy Policy for Shaditz.',
    jsonb_build_object(
      'sections', jsonb_build_array(
        jsonb_build_object('id','legal_privacy','type','rich_text','enabled',true,'settings',jsonb_build_object('title','Privacy Policy','content','<p>Update this content in Admin → Pages.</p>'))
      )
    ),
    jsonb_build_object(
      'sections', jsonb_build_array(
        jsonb_build_object('id','legal_privacy','type','rich_text','enabled',true,'settings',jsonb_build_object('title','Privacy Policy','content','<p>Update this content in Admin → Pages.</p>'))
      )
    ),
    now()
  ),
  (
    'terms-of-service',
    'Terms of Service',
    'Terms of Service',
    false,
    true,
    'published',
    'Terms of Service',
    'Terms of Service for Shaditz.',
    jsonb_build_object(
      'sections', jsonb_build_array(
        jsonb_build_object('id','legal_terms','type','rich_text','enabled',true,'settings',jsonb_build_object('title','Terms of Service','content','<p>Update this content in Admin → Pages.</p>'))
      )
    ),
    jsonb_build_object(
      'sections', jsonb_build_array(
        jsonb_build_object('id','legal_terms','type','rich_text','enabled',true,'settings',jsonb_build_object('title','Terms of Service','content','<p>Update this content in Admin → Pages.</p>'))
      )
    ),
    now()
  ),
  (
    'contact',
    'Contact',
    'Contact',
    false,
    true,
    'published',
    'Contact',
    'Contact Shaditz.',
    jsonb_build_object(
      'sections', jsonb_build_array(
        jsonb_build_object('id','contact_rich','type','rich_text','enabled',true,'settings',jsonb_build_object('title','Contact','content','<p>Update this content in Admin → Pages.</p>'))
      )
    ),
    jsonb_build_object(
      'sections', jsonb_build_array(
        jsonb_build_object('id','contact_rich','type','rich_text','enabled',true,'settings',jsonb_build_object('title','Contact','content','<p>Update this content in Admin → Pages.</p>'))
      )
    ),
    now()
  )
on conflict (slug) do nothing;

