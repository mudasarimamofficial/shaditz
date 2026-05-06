update public.homepage_content
set content = (
  $$
  {
    "site": {
      "favicon": {
        "type": "image",
        "url": "/favicon.png",
        "path": "favicon/1774778592577-shaditz-favicon.png"
      },
      "customCss": "",
      "customJs": ""
    },
    "header": {
      "brandText": "Shaditz",
      "brandIcon": { "type": "material", "name": "psychology" },
      "nav": [
        { "label": "Workflow", "href": "#workflow" },
        { "label": "Features", "href": "#features" },
        { "label": "Pricing", "href": "#pricing" }
      ],
      "primaryCta": { "text": "Apply Now", "href": "#lead-form" }
    },
    "hero": {
      "badge": { "icon": "auto_awesome", "text": "Next-Gen B2B Lead Gen" },
      "heading": { "prefix": "Predictable Booked Calls For ", "highlight": "Masculinity Coaches" },
      "subcopy": "We install a client acquisition infrastructure that generates qualified sales conversations consistently — so you stop relying on content, referrals, or luck.",
      "note": "Every campaign is personally overseen by our team — AI handles the scale, humans handle the strategy.",
      "primaryCta": { "text": "Apply for Partnership", "href": "#lead-form", "icon": "arrow_forward" },
      "secondaryCta": { "text": "See How It Works", "href": "#workflow" }
    },
    "trust": {
      "eyebrow": "Built exclusively for masculinity coaches selling $1k–$5k programs.",
      "icons": [
        { "type": "material", "name": "sports_martial_arts" },
        { "type": "material", "name": "fitness_center" },
        { "type": "material", "name": "self_improvement" },
        { "type": "material", "name": "mindfulness" },
        { "type": "material", "name": "psychology_alt" }
      ]
    },
    "features": {
      "id": "features",
      "heading": "Built for High-Ticket Scale",
      "subcopy": "Everything you need to fill your pipeline with ideal prospects, automated through cutting-edge AI.",
      "cards": [
        {
          "icon": "radar",
          "title": "Hyper-Targeting AI",
          "copy": "We don't guess. Our models scrape millions of data points to identify men actively seeking growth and transformation."
        },
        {
          "icon": "forum",
          "title": "Conversational Agents",
          "copy": "Automated, empathetic outreach that sounds human. We handle the initial friction and book them straight to your calendar."
        },
        {
          "icon": "analytics",
          "title": "Conversion Tracking",
          "copy": "Real-time dashboards showing your pipeline health, cost per acquisition, and projected revenue growth."
        }
      ]
    },
    "workflow": {
      "id": "workflow",
      "heading": "The Shaditz Framework",
      "subcopy": "A systematic approach to scaling your coaching business predictably.",
      "expandIcon": "expand_more",
      "steps": [
        {
          "title": "Niche & Offer Calibration",
          "copy": "We start by auditing your current offer and deeply defining your ideal client avatar. We ensure your messaging resonates specifically with high-value male clients seeking transformation.",
          "open": true
        },
        {
          "title": "Intelligence Gathering",
          "copy": "Deploying our proprietary scraping infrastructure to build a hyper-targeted list of prospects who match your calibrated avatar perfectly."
        },
        {
          "title": "Omnichannel Outreach",
          "copy": "Executing personalized, conversational campaigns across Email, LinkedIn, and Instagram. Our AI agents handle objections and nurture leads."
        },
        {
          "title": "Calendar Delivery",
          "copy": "Qualified prospects are seamlessly booked directly onto your calendar, pre-framed and ready to invest in your coaching program."
        },
        {
          "title": "Optimization & Scale",
          "copy": "Continuous A/B testing of scripts, targeting, and follow-up sequences to lower acquisition costs and increase volume as you grow."
        }
      ]
    },
    "pricing": {
      "id": "pricing",
      "heading": "Pricing",
      "subcopy": "",
      "note": "Currently onboarding 5 new coaches this month. Apply to see if you qualify.",
      "bulletIcon": "check_circle",
      "tiers": [
        {
          "name": "Starter",
          "tagline": "For coaches building their first consistent lead flow.",
          "price": "$900",
          "priceSuffix": "/mo",
          "bullets": [
            "Targeted prospect identification",
            "Instagram + email outreach",
            "Lead qualification",
            "Appointment setting"
          ],
          "ctaText": "Select Starter",
          "ctaHref": "#lead-form"
        },
        {
          "name": "Growth",
          "tagline": "For coaches ready for predictable $20k+ months.",
          "price": "$1,400",
          "priceSuffix": "/mo",
          "highlight": { "badge": "Most Popular", "accentHex": "#b58a2f" },
          "bullets": [
            "Everything in Starter",
            "Multi-channel outreach",
            "CRM setup",
            "Weekly campaign optimization",
            "Dedicated account manager"
          ],
          "ctaText": "Select Growth",
          "ctaHref": "#lead-form"
        },
        {
          "name": "Scale",
          "tagline": "For established coaches scaling aggressively.",
          "price": "$2,000",
          "priceSuffix": "/mo",
          "bullets": [
            "Everything in Growth",
            "Full funnel automation",
            "Sales pipeline optimization",
            "Priority support"
          ],
          "ctaText": "Select Scale",
          "ctaHref": "#lead-form"
        }
      ]
    },
    "application": {
      "id": "lead-form",
      "heading": "Apply for Partnership",
      "subcopy": "We only work with 5 new coaches per month to ensure delivery quality. Tell us about your business.",
      "fields": {
        "firstNameLabel": "First Name",
        "lastNameLabel": "Last Name",
        "emailLabel": "Work Email",
        "revenueLabel": "Current Monthly Revenue",
        "bottleneckLabel": "What is your primary bottleneck right now?",
        "bottleneckPlaceholder": "",
        "revenueOptions": [
          { "value": "under_10k", "label": "Under $10k/mo" },
          { "value": "10k_30k", "label": "$10k–$30k/mo" },
          { "value": "30k_100k", "label": "$30k–$100k/mo" },
          { "value": "100k_plus", "label": "$100k+/mo" }
        ]
      },
      "submitText": "Submit Application",
      "successTitle": "Thanks — your application is in.",
      "successBody": "If it’s a fit, you’ll hear back soon.",
      "submitAnotherText": "Submit another"
    },
    "footer": {
      "brandText": "Shaditz",
      "brandIcon": { "type": "material", "name": "psychology" },
      "links": [
        { "label": "Privacy Policy", "href": "#" },
        { "label": "Terms of Service", "href": "#" },
        { "label": "Contact", "href": "#" }
      ],
      "copyright": "© 2026 Shaditz. All rights reserved."
    },
    "socialLinks": [
      { "label": "Instagram", "href": "https://instagram.com/", "icon": { "type": "material", "name": "photo_camera" } },
      { "label": "YouTube", "href": "https://youtube.com/", "icon": { "type": "material", "name": "smart_display" } },
      { "label": "X", "href": "https://x.com/", "icon": { "type": "material", "name": "tag" } }
    ],
    "whatsapp": {
      "enabled": true,
      "phone": "+923XXXXXXXXX",
      "message": "Hi, I want to learn more about your services",
      "tooltip": "Chat with us!",
      "modalTitle": "Shaditz",
      "modalSubtitle": "Usually replies instantly",
      "buttonText": "Start Chat",
      "headerColorHex": "#25D366"
    }
  }
  $$::jsonb
),
updated_at = now()
where id = 1;

notify pgrst, 'reload schema';
