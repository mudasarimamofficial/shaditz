import { createDefaultTypographyScale, type TypographyScale } from "@/utils/typographyScale";
import { shaditzLandingDefaults, type ShaditzLandingContent } from "@/content/shaditzLanding";

export type HomepageContent = {
  shaditz?: ShaditzLandingContent;
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
        | "loader"
        | "nav"
        | "whatsapp"
        | "hero"
        | "marquee"
        | "about"
        | "showreel"
        | "services"
        | "portfolio"
        | "process"
        | "reviews"
        | "tools"
        | "contact"
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
  shaditz: shaditzLandingDefaults,
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
    enabled: false,
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
  rebuilt: undefined,
  page: {
    sections: [
      { id: "loader", type: "loader", enabled: true },
      { id: "nav", type: "nav", enabled: true },
      { id: "whatsapp", type: "whatsapp", enabled: false },
      { id: "hero", type: "hero", enabled: true },
      { id: "marquee", type: "marquee", enabled: true },
      { id: "about", type: "about", enabled: true },
      { id: "showreel", type: "showreel", enabled: true },
      { id: "portfolio", type: "portfolio", enabled: true },
      { id: "services", type: "services", enabled: true },
      { id: "process", type: "process", enabled: true },
      { id: "reviews", type: "reviews", enabled: true },
      { id: "tools", type: "tools", enabled: true },
      { id: "contact", type: "contact", enabled: true },
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
      { label: "Work", href: "#work" },
      { label: "Process", href: "#process" },
      { label: "Pricing", href: "#pricing" },
    ],
    primaryCta: { text: "Hire Me", href: "#contact" },
  },
  hero: {
    badge: { icon: "auto_awesome", text: "Client Acquisition Infrastructure" },
    heading: {
      prefix: "Cinematic Editing For ",
      highlight: "Brands, Creators & Businesses",
    },
    subcopy:
      "We install a client acquisition infrastructure that generates qualified sales conversations consistently — so you stop relying on content, referrals, or luck.",
    note: "Every project is edited with pacing, sound, color, and story in mind.",
    trust: {
      text: "Built exclusively for",
      pills: ["Video clients", "Short-form and long-form edits", "Cinematic delivery"],
    },
    proof: {
      title: "Built for polished video delivery",
      eyebrow: "A portfolio-first editing workflow",
      avatars: [],
    },
    metrics: [
      { title: "Projects", value: "50+", icon: "movie", tone: "gold" },
      { title: "Clients", value: "20+", icon: "users", tone: "blue" },
      { title: "Experience", value: "3+ years", icon: "calendar", tone: "green" },
    ],
    revenueVisual: {
      value: "",
      label: "Cinematic editing",
    },
    primaryCta: { text: "Hire Me", href: "#contact", icon: "arrow_forward" },
    secondaryCta: { text: "See Process", href: "#process" },
  },
  trust: {
    eyebrow: "Built for creators and businesses that need cinematic editing.",
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
        ctaHref: "#contact",
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
        ctaHref: "#contact",
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
        ctaHref: "#contact",
      },
    ],
  },
  application: {
    id: "lead-form",
    headingTag: "Hire Me",
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
