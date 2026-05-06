create table if not exists public.secret_settings (
  id bigint primary key,
  resend_api_key text,
  updated_at timestamptz not null default now()
);

alter table public.secret_settings enable row level security;

insert into public.secret_settings (id, resend_api_key)
values (1, null)
on conflict (id) do nothing;

alter table public.settings
add column if not exists resend_api_key_masked text;

