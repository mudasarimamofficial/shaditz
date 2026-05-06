update public.homepage_content
set
  content = jsonb_set(
    jsonb_set(
      jsonb_set(
        content,
        '{site,favicon}',
        '{"type":"image","url":"/favicon.png"}'::jsonb,
        true
      ),
      '{header,brandIcon}',
      '{"type":"image","url":"/apple-touch-icon.png"}'::jsonb,
      true
    ),
    '{footer,brandIcon}',
    '{"type":"image","url":"/apple-touch-icon.png"}'::jsonb,
    true
  ),
  updated_at = now()
where id = 1;

update public.homepage_content_drafts
set
  content = jsonb_set(
    jsonb_set(
      jsonb_set(
        coalesce(content, '{}'::jsonb),
        '{site,favicon}',
        '{"type":"image","url":"/favicon.png"}'::jsonb,
        true
      ),
      '{header,brandIcon}',
      '{"type":"image","url":"/apple-touch-icon.png"}'::jsonb,
      true
    ),
    '{footer,brandIcon}',
    '{"type":"image","url":"/apple-touch-icon.png"}'::jsonb,
    true
  ),
  updated_at = now()
where id = 1;

