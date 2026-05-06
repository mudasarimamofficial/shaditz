update public.homepage_content
set content = (
  $$
  {
    "site": {
      "favicon": {
        "type": "image",
        "url": "/favicon.png"
      },
      "designPreset": "landing_html_v1",
      "customCss": "",
      "customJs": ""
    },
    "header": {
      "brandText": "Shaditz",
      "brandIcon": { "type": "material", "name": "psychology" },
      "nav": [
        { "label": "How It Works", "href": "#workflow" },
        { "label": "What We Do", "href": "#features" },
        { "label": "Pricing", "href": "#pricing" }
      ],
      "primaryCta": { "text": "Apply Now", "href": "#lead-form" }
    },
    "hero": {
      "badge": { "icon": "auto_awesome", "text": "Client Acquisition Infrastructure" },
      "heading": { "prefix": "Predictable Booked Calls For ", "highlight": "Masculinity Coaches" },
      "subcopy": "We install a client acquisition infrastructure that generates qualified sales conversations consistently — so you stop relying on content, referrals, or luck.",
      "note": "Every campaign is personally overseen by our team — AI handles the scale, humans handle the strategy.",
      "trust": {
        "text": "Built exclusively for",
        "pills": ["Masculinity coaches", "$1k–$5k programmes", "High-ticket scale"]
      },
      "primaryCta": { "text": "Apply for Partnership", "href": "#lead-form", "icon": "arrow_forward" },
      "secondaryCta": { "text": "See How It Works", "href": "#workflow" }
    },
    "features": {
      "id": "features",
      "heading": "How Shaditz fills your calendar",
      "subcopy": "Three core capabilities working together to turn cold prospects into booked sales calls — consistently, every month.",
      "cards": [
        {
          "icon": "search",
          "title": "Precision Prospect Identification",
          "copy": "We identify men actively seeking transformation and growth — the exact people your coaching programme is built for. No guesswork. No wasted outreach."
        },
        {
          "icon": "chat",
          "title": "Real Conversations. Not Spam.",
          "copy": "Our team starts genuine, personalised conversations on your behalf across Instagram, LinkedIn, and email — building trust before a single sales call happens."
        },
        {
          "icon": "pulse",
          "title": "Full Pipeline Visibility",
          "copy": "Real-time dashboards showing your prospect pipeline, booked calls, and revenue trajectory. You always know exactly what is working and what is being optimised."
        }
      ]
    },
    "workflow": {
      "id": "workflow",
      "heading": "A systematic path to predictable revenue",
      "subcopy": "Five steps that transform your coaching business from inconsistent leads to a structured client acquisition machine.",
      "expandIcon": "expand_more",
      "steps": [
        {
          "title": "Offer and niche calibration",
          "copy": "We start by auditing your current offer and deeply defining your ideal client avatar. Every message, every outreach sequence, every campaign is built around the specific man your coaching programme transforms.",
          "open": true
        },
        {
          "title": "Targeted prospect database build",
          "copy": "We build a hyper-targeted list of coaches' ideal clients using behavioural and interest signals — men who are actively searching for the transformation you provide. Quality over volume at every stage."
        },
        {
          "title": "Strategic multi-channel outreach",
          "copy": "Our team executes personalised outreach campaigns across Instagram, LinkedIn, and email — starting real conversations that feel human, not automated. We handle every reply, every objection, every follow-up."
        },
        {
          "title": "Qualified call delivery to your calendar",
          "copy": "Prospects are qualified, pre-framed, and booked directly onto your calendar. You show up to calls with men who already understand your offer and are ready to invest — not cold strangers."
        },
        {
          "title": "Weekly optimisation and scaling",
          "copy": "Every campaign is analysed weekly. Scripts are tested. Targeting is refined. Conversion rates improve continuously. The system gets stronger every single month you are with us."
        }
      ]
    },
    "pricing": {
      "id": "pricing",
      "heading": "Transparent pricing for serious coaches",
      "subcopy": "Three tiers built around where you are right now and where you want to go. No hidden fees. No long-term lock-in.",
      "note": "Currently onboarding 5 new coaches this month — apply to see if you qualify.",
      "bulletIcon": "check_circle",
      "tiers": [
        {
          "name": "Starter",
          "tagline": "For coaches building their first consistent lead flow.",
          "price": "$900",
          "priceSuffix": "/mo",
          "outcome": "Expected 8–15 qualified conversations per month",
          "bullets": [
            "Targeted prospect identification",
            "Instagram + email outreach",
            "Lead qualification",
            "Appointment setting"
          ],
          "ctaText": "Apply for Starter",
          "ctaHref": "#lead-form"
        },
        {
          "name": "Growth",
          "tagline": "For coaches ready for predictable $20k+ months.",
          "price": "$1,400",
          "priceSuffix": "/mo",
          "highlight": { "badge": "Most Popular", "accentHex": "#b58a2f" },
          "outcome": "Expected 20–35 booked calls per month",
          "bullets": [
            "Everything in Starter",
            "Multi-channel outreach",
            "CRM setup and management",
            "Weekly campaign optimisation",
            "Dedicated account manager"
          ],
          "ctaText": "Apply for Growth",
          "ctaHref": "#lead-form"
        },
        {
          "name": "Scale",
          "tagline": "For established coaches scaling aggressively.",
          "price": "$2,000",
          "priceSuffix": "/mo",
          "outcome": "Expected 40+ calls with full pipeline visibility",
          "bullets": [
            "Everything in Growth",
            "Full funnel automation",
            "Sales pipeline optimisation",
            "Priority support and strategy calls"
          ],
          "ctaText": "Apply for Scale",
          "ctaHref": "#lead-form"
        }
      ]
    },
    "application": {
      "id": "lead-form",
      "heading": "Let's build your system",
      "subcopy": "We only work with 5 new coaches per month to ensure delivery quality. Tell us about your business and we will be in touch within 24 hours.",
      "fields": {
        "firstNameLabel": "First name",
        "lastNameLabel": "Last name",
        "emailLabel": "Email address",
        "firstNamePlaceholder": "Hamza",
        "lastNamePlaceholder": "Mukhtar",
        "emailPlaceholder": "you@example.com",
        "revenueLabel": "Current monthly revenue",
        "revenuePlaceholder": "Select your range",
        "bottleneckLabel": "What is your biggest bottleneck right now?",
        "bottleneckPlaceholder": "e.g. I get engagement on my content but no one books a call...",
        "revenueOptions": [
          { "value": "Under $3k/mo", "label": "Under $3k/mo" },
          { "value": "$3k–$8k/mo", "label": "$3k–$8k/mo" },
          { "value": "$8k–$20k/mo", "label": "$8k–$20k/mo" },
          { "value": "$20k–$50k/mo", "label": "$20k–$50k/mo" },
          { "value": "$50k+/mo", "label": "$50k+/mo" }
        ]
      },
      "submitText": "Submit Application",
      "successTitle": "Application received.",
      "successBody": "We review every application personally and will be in touch within 24 hours if it is a fit. Check your email — including your spam folder.",
      "submitAnotherText": "Submit another",
      "footnote": "We review every application personally and respond within 24 hours."
    },
    "footer": {
      "brandText": "Shaditz",
      "brandIcon": { "type": "material", "name": "psychology" },
      "links": [
        { "label": "Privacy Policy", "href": "/p/privacy-policy" },
        { "label": "Terms of Service", "href": "/p/terms-of-service" },
        { "label": "Contact", "href": "/p/contact" }
      ],
      "copyright": "© 2026 Shaditz. All rights reserved."
    },
    "whatsapp": {
      "enabled": false,
      "phone": "+923191106310",
      "message": "Hi, I want to learn more about your services",
      "tooltip": "Chat with us!",
      "modalTitle": "Shaditz",
      "modalSubtitle": "Usually replies instantly",
      "buttonText": "Start Chat",
      "headerColorHex": "#25D366",
      "position": "right",
      "delayMs": 1200,
      "autoOpen": false
    }
  }
  $$::jsonb
),
updated_at = now()
where id = 1;

notify pgrst, 'reload schema';

