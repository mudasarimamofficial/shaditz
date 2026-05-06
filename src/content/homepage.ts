import { createDefaultTypographyScale, type TypographyScale } from "@/utils/typographyScale";

export type HomepageContent = {
  branding?: {
    enabled?: boolean;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      surface: string;
      border: string;
      navy?: string;
      navy2?: string;
      navy3?: string;
      navy4?: string;
      white?: string;
      muted?: string;
      off?: string;
      gold?: string;
      gold2?: string;
      gold3?: string;
      borderGold?: string;
      border2?: string;
    };
    typography?: {
      headingFont?: string;
      bodyFont?: string;
      scale?: TypographyScale;
    };
  };
  site: {
    favicon: { type: "ico" | "image"; url: string; path?: string };
    designPreset?: "landing_html_v1" | "classic";
    theme?: {
      enabled?: boolean;
      colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
        surface: string;
        border: string;
        navy?: string;
        navy2?: string;
        navy3?: string;
        navy4?: string;
        white?: string;
        muted?: string;
        off?: string;
        gold?: string;
        gold2?: string;
        gold3?: string;
        borderGold?: string;
        border2?: string;
      };
      typography?: {
        headingFont?: string;
        bodyFont?: string;
        scale?: TypographyScale;
      };
    };
    customCss?: string;
    customJs?: string;
  };
  socialLinks?: {
    label: string;
    href: string;
    icon?: { type: "material" | "image"; name?: string; url?: string; path?: string };
  }[];
  socialLinksV2?: {
    id: string;
    platform: string;
    url: string;
    enabled: boolean;
    icon?: { type: "library" | "upload"; value: string } | null;
  }[];
  whatsapp?: {
    enabled: boolean;
    phone: string;
    message: string;
    avatar?: { url: string; path?: string };
    tooltip: string;
    modalTitle: string;
    modalSubtitle: string;
    buttonText: string;
    headerColorHex?: string;
    position?: "left" | "right";
    delayMs?: number;
    autoOpen?: boolean;
  };
  rebuilt?: {
    hero?: {
      tag: string;
      headlineLine1: string;
      headlineLine2Prefix: string;
      headlineHighlight: string;
      subcopyBeforeStrong: string;
      subcopyStrong: string;
      subcopyAfterStrong: string;
      note: string;
    };
    trustStrip?: {
      items: string[];
    };
    founder?: {
      label: string;
      avatarText: string;
      name: string;
      title: string;
      quote: string;
      paragraphs: string[];
    };
    promise?: {
      tag: string;
      heading: string;
      subcopy: string;
      cards: { title: string; body: string }[];
    };
    how?: {
      tag: string;
      heading: string;
      subcopy: string;
      steps: { title: string; body: string }[];
    };
    honest?: {
      tag: string;
      quote: string;
      paragraphs: string[];
      pledgeTitle: string;
      pledgeItems: string[];
    };
  };
  page?: {
    sections: {
      id: string;
      type:
        | "hero"
        | "trust_strip"
        | "founder"
        | "promise"
        | "how"
        | "honest"
        | "trust"
        | "features"
        | "workflow"
        | "pricing"
        | "audit_bridge"
        | "application"
        | "footer"
        | "custom"
        | "testimonials"
        | "custom_html"
        | "rich_text";
      enabled: boolean;
      settings?: Record<string, unknown>;
      blocks?: {
        id: string;
        type: string;
        content: Record<string, unknown>;
      }[];
    }[];
  };
  customSections?: {
    id: string;
    enabled: boolean;
    html: string;
    css?: string;
    js?: string;
  }[];
  header: {
    brandText: string;
    brandIcon: { type: "material" | "image"; name?: string; url?: string; path?: string };
    nav: { label: string; href: string }[];
    primaryCta: { text: string; href: string };
  };
  hero: {
    badge: { icon: string; text: string };
    heading: { prefix: string; highlight: string };
    subcopy: string;
    note?: string;
    trust?: { text: string; pills: string[] };
    proof?: {
      title: string;
      eyebrow: string;
      avatars?: { url: string; alt?: string }[];
    };
    metrics?: {
      title: string;
      value: string;
      change?: string;
      icon?: string;
      tone?: "gold" | "blue" | "green";
    }[];
    revenueVisual?: {
      value: string;
      label: string;
    };
    primaryCta: { text: string; href: string; icon: string };
    secondaryCta: { text: string; href: string };
    backgroundImage?: { url: string; path?: string };
  };
  trust: {
    eyebrow: string;
    icons: { type: "material" | "image"; name?: string; url?: string; path?: string }[];
  };
  features: {
    id: string;
    heading: string;
    subcopy: string;
    cards: { icon?: string; iconRef?: { type: "library" | "upload"; value: string }; title: string; copy: string }[];
    backgroundImage?: { url: string; path?: string };
  };
  workflow: {
    id: string;
    heading: string;
    subcopy: string;
    expandIcon: string;
    steps: { title: string; copy: string; open?: boolean }[];
    backgroundImage?: { url: string; path?: string };
  };
  pricing: {
    id: string;
    tag?: string;
    heading: string;
    subcopy: string;
    note?: string;
    bulletIcon: string;
    tiers: {
      badge?: string;
      name: string;
      tagline: string;
      price: string;
      priceWas?: string;
      priceSuffix?: string;
      highlight?: { badge: string; accentHex: string };
      outcome?: string;
      bullets: string[];
      ctaText: string;
      ctaHref: string;
    }[];
    backgroundImage?: { url: string; path?: string };
  };
  application: {
    id: string;
    headingTag?: string;
    heading: string;
    subcopy: string;
    formTitle?: string;
    formSubtitle?: string;
    promiseItems?: { title: string; body: string }[];
    fields: {
      firstNameLabel: string;
      lastNameLabel: string;
      emailLabel: string;
      firstNamePlaceholder?: string;
      lastNamePlaceholder?: string;
      emailPlaceholder?: string;
      revenueLabel: string;
      revenuePlaceholder?: string;
      bottleneckLabel: string;
      bottleneckPlaceholder: string;
      revenueOptions: { value: string; label: string }[];
    };
    submitText: string;
    successTitle: string;
    successBody: string;
    submitAnotherText: string;
    footnote?: string;
    backgroundImage?: { url: string; path?: string };
  };
  footer: {
    brandText: string;
    brandIcon: { type: "material" | "image"; name?: string; url?: string; path?: string };
    links: { label: string; href: string }[];
    copyright: string;
  };
};

export const homepageDefaults: HomepageContent = {
  branding: {
    enabled: false,
    colors: {
      primary: "#C9982A",
      secondary: "#0F1629",
      accent: "#E8B84B",
      background: "#0A0F1E",
      text: "#FFFFFF",
      surface: "#141D35",
      border: "rgba(255,255,255,0.07)",
      navy: "#0A0F1E",
      navy2: "#0F1629",
      navy3: "#141D35",
      navy4: "#1A2444",
      white: "#FFFFFF",
      muted: "#8A8F9E",
      off: "#F0EDE6",
      gold: "#C9982A",
      gold2: "#E8B84B",
      gold3: "#F5CC6E",
      borderGold: "rgba(201,152,42,0.18)",
      border2: "rgba(255,255,255,0.07)",
    },
    typography: {
      headingFont: "var(--font-heading)",
      bodyFont: "var(--font-body)",
      scale: createDefaultTypographyScale(),
    },
  },
  site: {
    favicon: {
      type: "image",
      url: "/favicon.png",
    },
    designPreset: "landing_html_v1",
    theme: {
      enabled: false,
      colors: {
        primary: "#C9982A",
        secondary: "#0F1629",
        accent: "#E8B84B",
        background: "#0A0F1E",
        text: "#FFFFFF",
        surface: "#141D35",
        border: "rgba(255,255,255,0.07)",
        navy: "#0A0F1E",
        navy2: "#0F1629",
        navy3: "#141D35",
        navy4: "#1A2444",
        white: "#FFFFFF",
        muted: "#8A8F9E",
        off: "#F0EDE6",
        gold: "#C9982A",
        gold2: "#E8B84B",
        gold3: "#F5CC6E",
        borderGold: "rgba(201,152,42,0.18)",
        border2: "rgba(255,255,255,0.07)",
      },
      typography: {
        headingFont: "var(--font-heading)",
        bodyFont: "var(--font-body)",
        scale: createDefaultTypographyScale(),
      },
    },
    customCss: "",
    customJs: "",
  },
  socialLinks: [
    {
      label: "Instagram",
      href: "https://instagram.com/",
      icon: { type: "material", name: "photo_camera" },
    },
    {
      label: "YouTube",
      href: "https://youtube.com/",
      icon: { type: "material", name: "smart_display" },
    },
    {
      label: "X",
      href: "https://x.com/",
      icon: { type: "material", name: "tag" },
    },
  ],
  socialLinksV2: [
    {
      id: "instagram",
      platform: "instagram",
      url: "https://instagram.com/",
      enabled: true,
      icon: { type: "library", value: "instagram" },
    },
    {
      id: "facebook",
      platform: "facebook",
      url: "https://facebook.com/",
      enabled: false,
      icon: { type: "library", value: "facebook" },
    },
    {
      id: "youtube",
      platform: "youtube",
      url: "https://youtube.com/",
      enabled: true,
      icon: { type: "library", value: "youtube" },
    },
    {
      id: "x",
      platform: "x",
      url: "https://x.com/",
      enabled: true,
      icon: { type: "library", value: "x" },
    },
    {
      id: "linkedin",
      platform: "linkedin",
      url: "https://linkedin.com/",
      enabled: true,
      icon: { type: "library", value: "linkedin" },
    },
    {
      id: "tiktok",
      platform: "tiktok",
      url: "https://tiktok.com/",
      enabled: false,
      icon: { type: "library", value: "tiktok" },
    },
    {
      id: "whatsapp",
      platform: "whatsapp",
      url: "https://wa.me/",
      enabled: false,
      icon: { type: "library", value: "whatsapp" },
    },
    {
      id: "telegram",
      platform: "telegram",
      url: "https://t.me/",
      enabled: false,
      icon: { type: "library", value: "telegram" },
    },
    {
      id: "email",
      platform: "email",
      url: "mailto:",
      enabled: false,
      icon: { type: "library", value: "email" },
    },
    {
      id: "website",
      platform: "website",
      url: "https://",
      enabled: false,
      icon: { type: "library", value: "website" },
    },
  ],
  whatsapp: {
    enabled: true,
    phone: "+923191106310",
    message: "Hi, I want to learn more about your services",
    tooltip: "Chat with us!",
    modalTitle: "Shaditz",
    modalSubtitle: "Usually replies instantly",
    buttonText: "Start Chat",
    headerColorHex: "#25D366",
    position: "right",
    delayMs: 1200,
    autoOpen: false,
  },
  rebuilt: {
    hero: {
      tag: "Client Acquisition For Masculinity Coaches",
      headlineLine1: "Stop Guessing.",
      headlineLine2Prefix: "Start ",
      headlineHighlight: "Closing.",
      subcopyBeforeStrong: "You've built a real coaching business. ",
      subcopyStrong: "Your calendar shouldn't depend on content going viral or a referral showing up.",
      subcopyAfterStrong: " We install a system that fills it — month after month, without ads.",
      note: "Applications reviewed personally. No automated responses.",
    },
    trustStrip: {
      items: [
        "Fit-first — we turn away wrong clients",
        "Human outreach — no bots, no spam",
        "Brand-safe — your reputation is protected",
        "Weekly optimisation — the system improves every month",
        "No lock-in contracts",
      ],
    },
    founder: {
      label: "Who Is Behind This",
      avatarText: "H",
      name: "Hamza",
      title: "Founder, Shaditz · Masculinity Coach",
      quote: `"I didn't build this for coaches. I built it because I was one."`,
      paragraphs: [
        "I spent years in the masculinity coaching space — developing men, running programmes, trying to figure out how to fill my calendar without becoming a content machine. I know the frustration of having a life-changing offer and not being able to get it in front of the right men consistently.",
        "Most client acquisition agencies <strong>have never coached anyone.</strong> They sell outreach systems built for SaaS companies and slap them onto coaches. It doesn't work — because they don't understand the buyer, the conversation, or what it takes to earn trust with men who are already sceptical.",
        "Shaditz is built differently. Every system, every message, every piece of outreach is designed specifically for masculinity coaches — because I know your world from the inside.",
        "<strong>That's not a marketing line. That's why this works.</strong>",
      ],
    },
    promise: {
      tag: "What You're Actually Getting",
      heading: "Four Things We Stand Behind",
      subcopy: "Not features. Not deliverables. Commitments — the things that make working with us feel different from day one.",
      cards: [
        {
          title: "We protect your brand like it's ours",
          body: "Every message we send goes out under your name. We write with your voice, your standards, and your reputation on the line. We would never send anything we wouldn't be proud to sign ourselves.",
        },
        {
          title: "No vanity metrics. Booked calls or nothing.",
          body: "We don't report follower growth, impressions, or reply rates. The only number that matters is qualified calls booked onto your calendar. That's the only thing we optimise for.",
        },
        {
          title: "You'll know exactly what's happening, always",
          body: "Real-time pipeline visibility. Weekly reporting. No black boxes. If something isn't working, we tell you before you ask — and we show you what we're changing.",
        },
        {
          title: "We only work with coaches we can genuinely help",
          body: "Every application is reviewed personally. If your offer, audience, or stage isn't right for our system, we'll tell you honestly — and point you toward what will actually work for you right now.",
        },
      ],
    },
    how: {
      tag: "The Framework",
      heading: "How We Fill Your Calendar",
      subcopy: "Five steps. No shortcuts. Built to compound — the longer you run it, the stronger it gets.",
      steps: [
        {
          title: "Offer and niche calibration",
          body: "We start by deeply auditing your offer and defining exactly who you're for. Not a broad ICA exercise — a precise, signal-based definition of the man your programme transforms. Every message we write for you starts here.",
        },
        {
          title: "Targeted prospect database build",
          body: "We build a hyper-targeted list using behavioural and interest signals — men who are actively searching for the transformation you provide. Quality over volume at every stage. A smaller, better list outperforms a large, cold one every time.",
        },
        {
          title: "Strategic multi-channel outreach",
          body: "Personalised outreach across Instagram, LinkedIn, and email — starting real conversations, not spray-and-pray sequences. We handle every reply, every objection, every follow-up. You never touch the cold side of the conversation.",
        },
        {
          title: "Qualified call delivery to your calendar",
          body: "Prospects are qualified, pre-framed, and booked directly. You show up to calls with men who already understand your offer and are ready to invest — not cold strangers who need convincing of the basics.",
        },
        {
          title: "Weekly optimisation and scaling",
          body: "Every campaign is analysed weekly. Scripts are tested. Targeting is refined. The system compounds — what works in month one is better in month three. We don't set it and leave it.",
        },
      ],
    },
    honest: {
      tag: "The Honest Part",
      quote: `"We're not the biggest agency. We're building something serious — and we want the right coaches to build it with."`,
      paragraphs: [
        "Shaditz is new. We don't have a wall of client logos or ten years of case studies to show you. What we do have is a founder who has lived your problem, a system built specifically for your world, and a commitment to prove ourselves through results — not through looking established on a website.",
        "That's why we're offering our first founding cohort a different arrangement: you get a reduced rate, we get to build the proof together. Full transparency. Weekly reporting. And if we don't deliver qualified conversations within the first 60 days, you don't pay for the second month.",
        "That's the deal. No fine print.",
      ],
      pledgeTitle: "Our Founding Partner Guarantee",
      pledgeItems: [
        "Qualified conversations started within 14 days of launch",
        "Weekly reporting — full visibility, no black boxes",
        "If no results in 60 days — month two is free",
        "Only 3 founding partner spots available",
      ],
    },
  },
  page: {
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "trust-strip", type: "trust_strip", enabled: true },
      { id: "founder", type: "founder", enabled: true },
      { id: "promise", type: "promise", enabled: true },
      { id: "how", type: "how", enabled: true },
      { id: "honest", type: "honest", enabled: true },
      { id: "pricing", type: "pricing", enabled: true },
      { id: "application", type: "application", enabled: true },
      { id: "footer", type: "footer", enabled: true },
    ],
  },
  customSections: [],
  header: {
    brandText: "Shaditz",
    brandIcon: {
      type: "image",
      url: "/favicon.png",
    },
    nav: [
      { label: "Our Story", href: "#founder" },
      { label: "How It Works", href: "#how" },
      { label: "Pricing", href: "#pricing" },
    ],
    primaryCta: { text: "Apply Now", href: "#apply" },
  },
  hero: {
    badge: { icon: "auto_awesome", text: "Client Acquisition Infrastructure" },
    heading: {
      prefix: "Predictable Booked Calls For ",
      highlight: "Masculinity Coaches",
    },
    subcopy:
      "We install a client acquisition infrastructure that generates qualified sales conversations consistently — so you stop relying on content, referrals, or luck.",
    note: "Every campaign is personally overseen by our team — AI handles the scale, humans handle the strategy.",
    trust: {
      text: "Built exclusively for",
      pills: ["Masculinity coaches", "$1k–$5k programmes", "High-ticket scale"],
    },
    proof: {
      title: "Built for premium coaching businesses",
      eyebrow: "A fit-first partnership process",
      avatars: [],
    },
    metrics: [
      { title: "Prospects Reached", value: "Consistent", icon: "users", tone: "gold" },
      { title: "Qualified Leads", value: "Qualified", icon: "target", tone: "blue" },
      { title: "Calls Booked", value: "Booked", icon: "calendar", tone: "green" },
    ],
    revenueVisual: {
      value: "",
      label: "Pipeline visibility",
    },
    primaryCta: { text: "Apply for Partnership", href: "#apply", icon: "arrow_forward" },
    secondaryCta: { text: "See How It Works", href: "#how" },
  },
  trust: {
    eyebrow: "Built exclusively for masculinity coaches selling $1k–$5k programmes.",
    icons: [
      { type: "material", name: "sports_martial_arts" },
      { type: "material", name: "fitness_center" },
      { type: "material", name: "self_improvement" },
      { type: "material", name: "mindfulness" },
      { type: "material", name: "psychology_alt" },
    ],
  },
  features: {
    id: "features",
    heading: "How Shaditz fills your calendar",
    subcopy:
      "Three core capabilities working together to turn cold prospects into booked sales calls — consistently, every month.",
    cards: [
      {
        icon: "search",
        title: "Precision Prospect Identification",
        copy: "We identify men actively seeking transformation and growth — the exact people your coaching programme is built for. No guesswork. No wasted outreach.",
      },
      {
        icon: "chat",
        title: "Real Conversations. Not Spam.",
        copy: "Our team starts genuine, personalised conversations on your behalf across Instagram, LinkedIn, and email — building trust before a single sales call happens.",
      },
      {
        icon: "pulse",
        title: "Full Pipeline Visibility",
        copy: "Real-time dashboards showing your prospect pipeline, booked calls, and revenue trajectory. You always know exactly what is working and what is being optimised.",
      },
    ],
  },
  workflow: {
    id: "workflow",
    heading: "A systematic path to predictable revenue",
    subcopy:
      "Five steps that transform your coaching business from inconsistent leads to a structured client acquisition machine.",
    expandIcon: "expand_more",
    steps: [
      {
        title: "Offer and niche calibration",
        copy: "We start by auditing your current offer and deeply defining your ideal client avatar. Every message, every outreach sequence, every campaign is built around the specific man your coaching programme transforms.",
        open: true,
      },
      {
        title: "Targeted prospect database build",
        copy: "We build a hyper-targeted list of coaches' ideal clients using behavioural and interest signals — men who are actively searching for the transformation you provide. Quality over volume at every stage.",
      },
      {
        title: "Strategic multi-channel outreach",
        copy: "Our team executes personalised outreach campaigns across Instagram, LinkedIn, and email — starting real conversations that feel human, not automated. We handle every reply, every objection, every follow-up.",
      },
      {
        title: "Qualified call delivery to your calendar",
        copy: "Prospects are qualified, pre-framed, and booked directly onto your calendar. You show up to calls with men who already understand your offer and are ready to invest — not cold strangers.",
      },
      {
        title: "Weekly optimisation and scaling",
        copy: "Every campaign is analysed weekly. Scripts are tested. Targeting is refined. Conversion rates improve continuously. The system gets stronger every single month you are with us.",
      },
    ],
  },
  pricing: {
    id: "pricing",
    tag: "Partnership Tiers",
    heading: "Transparent Pricing",
    subcopy: "Applications are reviewed for fit before onboarding begins. We say no when it's not the right match.",
    note: "Not sure which tier is right? Apply anyway — we'll recommend the right fit after reviewing your business.",
    bulletIcon: "check_circle",
    tiers: [
      {
        badge: "Founding Partner",
        name: "Starter",
        tagline: "For coaches building their first consistent lead flow. Founding rate — 3 spots only.",
        price: "$600",
        priceWas: "$900",
        priceSuffix: "per month · founding rate",
        bullets: [
          "Targeted prospect identification",
          "Instagram + email outreach",
          "Lead qualification",
          "Appointment setting",
          "Weekly reporting",
          "60-day results guarantee",
        ],
        ctaText: "Apply for Starter",
        ctaHref: "#apply",
      },
      {
        badge: "Most Selected",
        name: "Growth",
        tagline: "For coaches ready to scale beyond inconsistent lead flow into a proper acquisition machine.",
        price: "$1,400",
        priceSuffix: "per month",
        highlight: { badge: "Most Selected", accentHex: "#C9A84C" },
        bullets: [
          "Everything in Starter",
          "Multi-channel outreach (Instagram, LinkedIn, Email)",
          "CRM setup and management",
          "Weekly campaign optimisation",
          "Dedicated account manager",
          "Monthly strategy call",
        ],
        ctaText: "Apply for Growth",
        ctaHref: "#apply",
      },
      {
        badge: "For Established Coaches",
        name: "Scale",
        tagline: "For coaches with an established offer scaling their pipeline aggressively.",
        price: "$2,000",
        priceSuffix: "per month",
        bullets: [
          "Everything in Growth",
          "Full funnel automation",
          "Sales pipeline optimisation",
          "Priority support and strategy calls",
          "Quarterly audit and scale review",
        ],
        ctaText: "Apply for Scale",
        ctaHref: "#apply",
      },
    ],
  },
  application: {
    id: "lead-form",
    headingTag: "Apply for Partnership",
    heading: "Let's Build\nYour System",
    subcopy:
      "Tell us where you are and where you want to go. We review every application personally and only move forward when we're confident we can deliver results for you.",
    formTitle: "Your Application",
    formSubtitle: "Takes 2 minutes. No pressure, no pitch call unless it's a clear fit.",
    promiseItems: [
      { title: "Personal review", body: "Hamza reviews every application himself. No VA, no automation." },
      { title: "Honest fit assessment", body: "If we can't help you, we'll tell you directly — and explain why." },
      { title: "Response within 48 hours", body: "No ghosting. No automated drip sequence. A real reply." },
    ],
    fields: {
      firstNameLabel: "First Name",
      lastNameLabel: "Last Name",
      emailLabel: "Email Address",
      firstNamePlaceholder: "Hamza",
      lastNamePlaceholder: "Khan",
      emailPlaceholder: "you@yourcoaching.com",
      revenueLabel: "Current Monthly Revenue",
      revenuePlaceholder: "Select your range",
      bottleneckLabel: "What's your biggest bottleneck right now?",
      bottleneckPlaceholder: "Be honest — the more specific you are, the better we can assess fit.",
      revenueOptions: [
        { value: "Under $3k/mo", label: "Under $3k/mo" },
        { value: "$3k – $8k/mo", label: "$3k – $8k/mo" },
        { value: "$8k – $20k/mo", label: "$8k – $20k/mo" },
        { value: "$20k – $50k/mo", label: "$20k – $50k/mo" },
        { value: "$50k+/mo", label: "$50k+/mo" },
      ],
    },
    submitText: "Submit Application →",
    successTitle: "Application Received",
    successBody:
      "Hamza reviews every application personally. You'll hear back within 48 hours — check your inbox, including spam.",
    submitAnotherText: "Submit another",
    footnote: "No newsletter. No automated sales blast. Just a personal fit review from Hamza.",
  },
  footer: {
    brandText: "Shaditz",
    brandIcon: {
      type: "image",
      url: "/favicon.png",
    },
    links: [
      { label: "Privacy Policy", href: "/p/privacy-policy" },
      { label: "Terms of Service", href: "/p/terms-of-service" },
      { label: "Contact", href: "/p/contact" },
    ],
    copyright: "© 2026 Shaditz. All rights reserved.",
  },
};
