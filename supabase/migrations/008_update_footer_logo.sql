update public.homepage_content
set
  content = jsonb_set(
    jsonb_set(
      jsonb_set(
        content,
        '{footer,brandIcon}',
        '{"type":"image","url":"/favicon.png"}'::jsonb,
        true
      ),
      '{site,customCss}',
      to_jsonb(
        coalesce(content #>> '{site,customCss}', '')
        || E'\n/* cf-footer-logo */\n.footer-logo{display:inline-flex;align-items:center;gap:10px;}\n.footer-logo img{width:20px;height:20px;border-radius:6px;object-fit:contain;}'
      ),
      true
    ),
    '{site,customJs}',
    to_jsonb(
      coalesce(content #>> '{site,customJs}', '')
      || E'\n/* cf-footer-logo */\n(function(){\n  function apply(){\n    try{\n      if(location.pathname.startsWith("/admin")) return;\n      var el=document.querySelector(".footer-logo");\n      if(!el) return;\n      if(el.querySelector("img[data-cf-footer-logo]")) return;\n      var img=document.createElement("img");\n      img.setAttribute("data-cf-footer-logo","1");\n      img.alt="Shaditz";\n      img.src="/favicon.png";\n      img.width=20; img.height=20;\n      el.prepend(img);\n    }catch(e){}\n  }\n  if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",apply);}else{apply();}\n})();'
    ),
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
        '{footer,brandIcon}',
        '{"type":"image","url":"/favicon.png"}'::jsonb,
        true
      ),
      '{site,customCss}',
      to_jsonb(
        coalesce(content #>> '{site,customCss}', '')
        || E'\n/* cf-footer-logo */\n.footer-logo{display:inline-flex;align-items:center;gap:10px;}\n.footer-logo img{width:20px;height:20px;border-radius:6px;object-fit:contain;}'
      ),
      true
    ),
    '{site,customJs}',
    to_jsonb(
      coalesce(content #>> '{site,customJs}', '')
      || E'\n/* cf-footer-logo */\n(function(){\n  function apply(){\n    try{\n      if(location.pathname.startsWith("/admin")) return;\n      var el=document.querySelector(".footer-logo");\n      if(!el) return;\n      if(el.querySelector("img[data-cf-footer-logo]")) return;\n      var img=document.createElement("img");\n      img.setAttribute("data-cf-footer-logo","1");\n      img.alt="Shaditz";\n      img.src="/favicon.png";\n      img.width=20; img.height=20;\n      el.prepend(img);\n    }catch(e){}\n  }\n  if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",apply);}else{apply();}\n})();'
    ),
    true
  ),
  updated_at = now()
where id = 1;

