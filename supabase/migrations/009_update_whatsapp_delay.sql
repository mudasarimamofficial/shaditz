update public.homepage_content
set
  content = jsonb_set(content, '{whatsapp,delayMs}', '1200'::jsonb, true),
  updated_at = now()
where id = 1;

update public.homepage_content_drafts
set
  content = jsonb_set(coalesce(content, '{}'::jsonb), '{whatsapp,delayMs}', '1200'::jsonb, true),
  updated_at = now()
where id = 1;

