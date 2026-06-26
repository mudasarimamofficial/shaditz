-- Final Shaditz portfolio seed. Run after 001-018 for the independent Shaditz Supabase project.

insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do update set public = true;

insert into public.settings (id, admin_email)
values (1, 'theshaheryarportfolio@gmail.com')
on conflict (id) do update set admin_email = excluded.admin_email;

insert into public.secret_settings (id)
values (1)
on conflict (id) do nothing;

insert into public.homepage_content (id, content)
values (1, '{
  "shaditz": {
    "nav": {
      "logo": "SY",
      "links": [
        {
          "label": "Work",
          "href": "#work"
        },
        {
          "label": "Services",
          "href": "#services"
        },
        {
          "label": "Process",
          "href": "#process"
        },
        {
          "label": "Pricing",
          "href": "#pricing"
        },
        {
          "label": "Contact",
          "href": "#contact"
        }
      ],
      "cta": {
        "label": "Hire Me",
        "href": "#contact"
      }
    },
    "hero": {
      "eyebrow": "Freelance Video Editor — Available Worldwide",
      "titleLine1": "SHAHER",
      "titleHighlight": "YAR",
      "subtitle": "Turning raw footage into cinematic stories that move people.",
      "primaryCta": {
        "label": "View My Work",
        "href": "#work"
      },
      "secondaryCta": {
        "label": "Let''s Talk",
        "href": "#contact"
      },
      "stats": [
        {
          "value": "50+",
          "label": "Projects Done"
        },
        {
          "value": "20+",
          "label": "Happy Clients"
        },
        {
          "value": "3+",
          "label": "Years Experience"
        }
      ],
      "scrollText": "Scroll to Explore"
    },
    "showreel": {
      "label": "Showreel",
      "title": "MY LATEST\nREEL",
      "videoUrl": "",
      "placeholderText": "SHOWREEL 2024",
      "note": "📌 Yahan apna YouTube ya Vimeo link paste karo — iframe se replace karo"
    },
    "services": {
      "label": "What I Offer",
      "title": "SERVICES",
      "items": [
        {
          "icon": "🎬",
          "number": "01",
          "title": "Video Editing",
          "description": "Professional cuts, pacing, and storytelling for YouTube, documentaries, vlogs, and branded content.",
          "tags": [
            "Premiere Pro",
            "YouTube",
            "Vlogs"
          ]
        },
        {
          "icon": "✨",
          "number": "02",
          "title": "Motion Graphics",
          "description": "Eye-catching titles, lower thirds, animated logos, and visual effects that elevate your content.",
          "tags": [
            "After Effects",
            "Motion Graphics",
            "VFX"
          ]
        },
        {
          "icon": "🎵",
          "number": "03",
          "title": "Reels & Short Form",
          "description": "High-retention Instagram Reels, TikToks, and YouTube Shorts designed to go viral.",
          "tags": [
            "Reels",
            "TikTok",
            "Shorts"
          ]
        },
        {
          "icon": "🎨",
          "number": "04",
          "title": "Color Grading",
          "description": "Cinematic color correction and grading to give your footage a professional, consistent look.",
          "tags": [
            "DaVinci Resolve",
            "LUTs",
            "Color"
          ]
        },
        {
          "icon": "🔊",
          "number": "05",
          "title": "Audio Design",
          "description": "Sound design, music sync, dialogue cleanup, and audio mixing for a polished final product.",
          "tags": [
            "Audio Mix",
            "SFX",
            "Music Sync"
          ]
        },
        {
          "icon": "🏢",
          "number": "06",
          "title": "Corporate Videos",
          "description": "Brand films, product promos, testimonials, and event highlight reels for businesses.",
          "tags": [
            "Brand Film",
            "Promo",
            "Corporate"
          ]
        }
      ]
    },
    "portfolio": {
      "label": "Selected Work",
      "title": "PORTFOLIO",
      "items": [
        {
          "category": "Brand Film",
          "title": "Featured Project Title Here",
          "meta": "Brand Film · 2024",
          "icon": "🎬",
          "wide": true
        },
        {
          "category": "Motion Graphics",
          "title": "Project Two",
          "meta": "Motion Graphics · 2024",
          "icon": "✨"
        },
        {
          "category": "Social Media",
          "title": "Project Three",
          "meta": "Reels · 2024",
          "icon": "📱"
        },
        {
          "category": "Color Grading",
          "title": "Project Four",
          "meta": "Color Grade · 2024",
          "icon": "🎨"
        },
        {
          "category": "Corporate",
          "title": "Project Five",
          "meta": "Corporate · 2024",
          "icon": "🏢"
        }
      ]
    },
    "tools": {
      "label": "My Arsenal",
      "title": "TOOLS &\nSOFTWARE",
      "items": [
        {
          "icon": "🎞️",
          "name": "Premiere Pro"
        },
        {
          "icon": "✨",
          "name": "After Effects"
        },
        {
          "icon": "🎨",
          "name": "DaVinci Resolve"
        },
        {
          "icon": "🔊",
          "name": "Audition"
        },
        {
          "icon": "📐",
          "name": "Photoshop"
        },
        {
          "icon": "🎵",
          "name": "Audacity"
        }
      ]
    },
    "process": {
      "label": "How I Work",
      "title": "MY PROCESS",
      "steps": [
        {
          "number": "01",
          "title": "Brief & Discovery",
          "description": "We discuss your vision, goals, target audience, and deadlines to get on the same page."
        },
        {
          "number": "02",
          "title": "Edit & Craft",
          "description": "I edit with precision — every cut, transition, and sound is intentional and on-brand."
        },
        {
          "number": "03",
          "title": "Review & Revise",
          "description": "You review via Frame.io, leave comments, and I implement revisions quickly."
        },
        {
          "number": "04",
          "title": "Final Delivery",
          "description": "Polished final files delivered in your required format, on time, every time."
        }
      ]
    },
    "testimonials": {
      "label": "Client Love",
      "title": "TESTIMONIALS",
      "items": [
        {
          "quote": "Shaher Yar delivered exactly what I envisioned. His attention to detail and quick turnaround made the whole process seamless.",
          "author": "Client Name Here",
          "role": "CEO, Company Name",
          "avatar": "👤",
          "stars": "★★★★★"
        },
        {
          "quote": "The motion graphics work was outstanding. Our brand video got incredible engagement. Will definitely work together again!",
          "author": "Client Name Here",
          "role": "Content Creator",
          "avatar": "👤",
          "stars": "★★★★★"
        },
        {
          "quote": "Professional, creative, and responsive. The reels he edited consistently hit 100k+ views. Highly recommend!",
          "author": "Client Name Here",
          "role": "Brand Manager",
          "avatar": "👤",
          "stars": "★★★★★"
        }
      ]
    },
    "pricing": {
      "label": "Investment",
      "title": "PRICING",
      "tiers": [
        {
          "name": "Starter",
          "price": "$99",
          "unit": "per video",
          "features": [
            "Up to 3 min video",
            "Basic cuts & transitions",
            "Color correction",
            "Audio cleanup",
            "2 revisions",
            "3-day delivery"
          ],
          "cta": {
            "label": "Get Started",
            "href": "#contact"
          }
        },
        {
          "name": "Professional",
          "price": "$249",
          "unit": "per video",
          "features": [
            "Up to 10 min video",
            "Motion graphics & titles",
            "Full color grading",
            "Sound design",
            "Unlimited revisions",
            "5-day delivery"
          ],
          "cta": {
            "label": "Get Started",
            "href": "#contact"
          },
          "featured": true
        },
        {
          "name": "Premium",
          "price": "$499",
          "unit": "per video",
          "features": [
            "Any length video",
            "Full VFX & compositing",
            "Cinematic color grade",
            "Custom music & SFX",
            "Unlimited revisions",
            "Priority delivery"
          ],
          "cta": {
            "label": "Get Started",
            "href": "#contact"
          }
        }
      ]
    },
    "contact": {
      "label": "Get In Touch",
      "title": "LET''S\nCREATE\nTOGETHER",
      "info": [
        {
          "icon": "📧",
          "label": "Email",
          "value": "your@email.com",
          "href": "mailto:your@email.com"
        },
        {
          "icon": "💼",
          "label": "Upwork / Fiverr",
          "value": "Your Profile Link",
          "href": "#"
        },
        {
          "icon": "📍",
          "label": "Location",
          "value": "Pakistan — Available Worldwide"
        },
        {
          "icon": "⏰",
          "label": "Response Time",
          "value": "Within 24 hours"
        }
      ],
      "formLabel": "Send a Message",
      "fields": {
        "nameLabel": "Your Name",
        "namePlaceholder": "John Smith",
        "emailLabel": "Email Address",
        "emailPlaceholder": "john@company.com",
        "projectLabel": "Project Type",
        "projectPlaceholder": "YouTube Video, Reels, Corporate...",
        "messageLabel": "Message",
        "messagePlaceholder": "Tell me about your project..."
      },
      "submitText": "Send Message →",
      "loadingText": "Sending...",
      "successText": "Message sent. Shaher Yar will reply soon.",
      "errorText": "Something went wrong. Please try again."
    },
    "footer": {
      "logo": "SHAHER YAR",
      "copyright": "© 2024 Shaher Yar. All rights reserved.",
      "socialLinks": [
        {
          "label": "IG",
          "href": "#"
        },
        {
          "label": "YT",
          "href": "#"
        },
        {
          "label": "LI",
          "href": "#"
        },
        {
          "label": "BE",
          "href": "#"
        }
      ]
    }
  },
  "site": {
    "favicon": {
      "type": "image",
      "url": "/favicon.png"
    },
    "designPreset": "landing_html_v1",
    "customCss": "",
    "customJs": ""
  },
  "page": {
    "sections": [
      {
        "id": "nav",
        "type": "nav",
        "enabled": true
      },
      {
        "id": "hero",
        "type": "hero",
        "enabled": true
      },
      {
        "id": "showreel",
        "type": "showreel",
        "enabled": true
      },
      {
        "id": "services",
        "type": "services",
        "enabled": true
      },
      {
        "id": "work",
        "type": "portfolio",
        "enabled": true
      },
      {
        "id": "tools",
        "type": "tools",
        "enabled": true
      },
      {
        "id": "process",
        "type": "process",
        "enabled": true
      },
      {
        "id": "testimonials",
        "type": "testimonials",
        "enabled": true
      },
      {
        "id": "pricing",
        "type": "pricing",
        "enabled": true
      },
      {
        "id": "contact",
        "type": "contact",
        "enabled": true
      },
      {
        "id": "footer",
        "type": "footer",
        "enabled": true
      }
    ]
  },
  "header": {
    "brandText": "Shaditz",
    "brandIcon": {
      "type": "image",
      "url": "/favicon.png"
    },
    "nav": [
      {
        "label": "Work",
        "href": "#work"
      },
      {
        "label": "Services",
        "href": "#services"
      },
      {
        "label": "Process",
        "href": "#process"
      },
      {
        "label": "Pricing",
        "href": "#pricing"
      },
      {
        "label": "Contact",
        "href": "#contact"
      }
    ],
    "primaryCta": {
      "text": "Hire Me",
      "href": "#contact"
    }
  },
  "footer": {
    "brandText": "Shaditz",
    "brandIcon": {
      "type": "image",
      "url": "/favicon.png"
    },
    "links": [
      {
        "label": "Privacy Policy",
        "href": "/p/privacy-policy"
      },
      {
        "label": "Terms of Service",
        "href": "/p/terms-of-service"
      },
      {
        "label": "Contact",
        "href": "/p/contact"
      }
    ],
    "copyright": "© 2024 Shaher Yar. All rights reserved."
  },
  "whatsapp": {
    "enabled": false,
    "phone": "",
    "message": "",
    "tooltip": "",
    "modalTitle": "Shaditz",
    "modalSubtitle": "",
    "buttonText": "",
    "headerColorHex": "#25D366"
  }
}'::jsonb)
on conflict (id) do nothing;
-- ^ Insert-if-missing only. NEVER overwrite live homepage content on a re-run.
--   To restore the seed content intentionally, use Admin > JSON or restore a snapshot
--   from homepage_content_versions. See docs/PROJECT_BIBLE.md §14.

insert into public.homepage_content_drafts (id, content, published_updated_at)
values (1, '{}'::jsonb, null)
on conflict (id) do nothing;
-- ^ Insert-if-missing only. Re-running must not clobber an in-flight draft.

insert into public.site_pages (slug, title, nav_label, show_in_header_nav, show_in_footer_nav, status, meta_title, meta_description, draft_content, published_content, published_at)
values
  ('privacy-policy', 'Privacy Policy', 'Privacy Policy', false, true, 'published', 'Privacy Policy', 'Privacy Policy for Shaditz.', '{
  "sections": [
    {
      "id": "privacy-policy",
      "type": "rich_text",
      "enabled": true,
      "settings": {
        "title": "Privacy Policy",
        "content": "<p>Update this content in Admin ? Pages.</p>"
      }
    }
  ]
}'::jsonb, '{
  "sections": [
    {
      "id": "privacy-policy",
      "type": "rich_text",
      "enabled": true,
      "settings": {
        "title": "Privacy Policy",
        "content": "<p>Update this content in Admin ? Pages.</p>"
      }
    }
  ]
}'::jsonb, now()),
  ('terms-of-service', 'Terms of Service', 'Terms of Service', false, true, 'published', 'Terms of Service', 'Terms of Service for Shaditz.', '{
  "sections": [
    {
      "id": "terms-of-service",
      "type": "rich_text",
      "enabled": true,
      "settings": {
        "title": "Terms of Service",
        "content": "<p>Update this content in Admin ? Pages.</p>"
      }
    }
  ]
}'::jsonb, '{
  "sections": [
    {
      "id": "terms-of-service",
      "type": "rich_text",
      "enabled": true,
      "settings": {
        "title": "Terms of Service",
        "content": "<p>Update this content in Admin ? Pages.</p>"
      }
    }
  ]
}'::jsonb, now()),
  ('contact', 'Contact', 'Contact', false, true, 'published', 'Contact', 'Contact Shaditz.', '{
  "sections": [
    {
      "id": "contact",
      "type": "rich_text",
      "enabled": true,
      "settings": {
        "title": "Contact",
        "content": "<p>Use the contact form on the homepage, or update this page in Admin ? Pages.</p>"
      }
    }
  ]
}'::jsonb, '{
  "sections": [
    {
      "id": "contact",
      "type": "rich_text",
      "enabled": true,
      "settings": {
        "title": "Contact",
        "content": "<p>Use the contact form on the homepage, or update this page in Admin ? Pages.</p>"
      }
    }
  ]
}'::jsonb, now())
on conflict (slug) do nothing;
-- ^ Insert-if-missing only. Re-running must not overwrite live page content/metadata
--   that the admin may have edited. To reset a page intentionally, use Admin > Pages.

notify pgrst, 'reload schema';
