update public.homepage_content
set
  content = jsonb_set(
    content,
    '{whatsapp,enabled}',
    'true'::jsonb,
    true
  ),
  updated_at = now()
where id = 1;

update public.homepage_content_drafts
set
  content = jsonb_set(
    coalesce(content, '{}'::jsonb),
    '{whatsapp,enabled}',
    'true'::jsonb,
    true
  ),
  updated_at = now()
where id = 1;

