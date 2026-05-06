update public.homepage_content
set
  content = (
    replace(
      replace(
        replace(
          replace(content::text, 'ΓÇö', '—'),
          'ΓÇô', '–'
        ),
        '┬⌐', '©'
      ),
      '$$', '$'
    )
  )::jsonb,
  updated_at = now()
where id = 1;

update public.homepage_content_drafts
set
  content = (
    replace(
      replace(
        replace(
          replace(coalesce(content, '{}'::jsonb)::text, 'ΓÇö', '—'),
          'ΓÇô', '–'
        ),
        '┬⌐', '©'
      ),
      '$$', '$'
    )
  )::jsonb,
  updated_at = now()
where id = 1;

update public.site_pages
set
  draft_content = (
    replace(
      replace(
        replace(
          replace(draft_content::text, 'ΓÇö', '—'),
          'ΓÇô', '–'
        ),
        '┬⌐', '©'
      ),
      '$$', '$'
    )
  )::jsonb,
  published_content = (
    replace(
      replace(
        replace(
          replace(published_content::text, 'ΓÇö', '—'),
          'ΓÇô', '–'
        ),
        '┬⌐', '©'
      ),
      '$$', '$'
    )
  )::jsonb,
  meta_title = case
    when meta_title is null then null
    else replace(replace(replace(replace(meta_title, 'ΓÇö', '—'), 'ΓÇô', '–'), '┬⌐', '©'), '$$', '$')
  end,
  meta_description = case
    when meta_description is null then null
    else replace(replace(replace(replace(meta_description, 'ΓÇö', '—'), 'ΓÇô', '–'), '┬⌐', '©'), '$$', '$')
  end,
  title = replace(replace(replace(replace(title, 'ΓÇö', '—'), 'ΓÇô', '–'), '┬⌐', '©'), '$$', '$'),
  nav_label = case
    when nav_label is null then null
    else replace(replace(replace(replace(nav_label, 'ΓÇö', '—'), 'ΓÇô', '–'), '┬⌐', '©'), '$$', '$')
  end,
  updated_at = now();

