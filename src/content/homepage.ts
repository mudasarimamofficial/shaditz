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
    phone: "",
    message: "Hi Shaditz — I want to discuss a project.",
    tooltip: "Chat on WhatsApp",
    modalTitle: "Shaditz",
    modalSubtitle: "Usually replies within an hour",
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
    badge: { icon: "auto_awesome", text: "Freelance Cinematic Video Editor" },
    heading: {
      prefix: "Cinematic editing for ",
      highlight: "brands, creators & businesses",
    },
    subcopy:
      "I turn raw footage into stories that hold attention — paced, graded, scored, and finished to a cinematic standard.",
    note: "Every project is edited with pacing, sound, color, and story in mind.",
    trust: {
      text: "Available for",
      pills: ["Short-form & Reels", "Long-form & YouTube", "Brand films & promos"],
    },
    proof: {
      title: "Polished delivery, every project",
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
    eyebrow: "Trusted by creators and brands who care how their video looks.",
    icons: [
      { type: "material", name: "movie" },
      { type: "material", name: "videocam" },
      { type: "material", name: "palette" },
      { type: "material", name: "graphic_eq" },
      { type: "material", name: "auto_awesome" },
    ],
  },
  features: {
    id: "features",
    heading: "What I bring to every cut",
    subcopy:
      "A complete cinematic edit — pacing, color, sound, and story — handled end-to-end so your video lands.",
    cards: [
      {
        icon: "search",
        title: "Story-first editing",
        copy: "I structure your footage around the moments that matter — the hook, the payoff, the emotional beats — so viewers actually finish watching.",
      },
      {
        icon: "chat",
        title: "Cinematic look & color",
        copy: "Professional color grading, LUTs, and shot-matching that give your video the look of a film, not a feed.",
      },
      {
        icon: "pulse",
        title: "Sound that holds attention",
        copy: "Music sync, SFX layering, dialogue cleanup, and mixing — the difference between watchable and unmissable.",
      },
    ],
  },
  workflow: {
    id: "workflow",
    heading: "How a project moves from raw footage to final delivery",
    subcopy:
      "A clear, predictable process so you always know where the project stands.",
    expandIcon: "expand_more",
    steps: [
      {
        title: "Brief & discovery",
        copy: "We talk through the goal, audience, tone, references, and deadline. I review your raw footage and confirm scope before any work begins.",
        open: true,
      },
      {
        title: "Assembly cut",
        copy: "I build the story spine — selects, structure, and pacing — and share a first cut so we agree on the direction early.",
      },
      {
        title: "Refinement & motion",
        copy: "Tight cuts, motion graphics, transitions, on-screen text, and any VFX work. The edit starts feeling like a finished film here.",
      },
      {
        title: "Color & sound",
        copy: "Color grade, LUT application, audio mix, music sync, and sound design — the polish that separates pro work from amateur.",
      },
      {
        title: "Review & delivery",
        copy: "You leave comments via Frame.io (or your preferred tool). I implement revisions and deliver final files in the exact formats you need.",
      },
    ],
  },
  pricing: {
    id: "pricing",
    tag: "Project Tiers",
    heading: "Transparent pricing",
    subcopy: "Pick the tier closest to what your project needs — exact quote after a quick scope review.",
    note: "Not sure which tier fits? Send a brief — I'll recommend the right one.",
    bulletIcon: "check_circle",
    tiers: [
      {
        badge: "Short-Form",
        name: "Starter",
        tagline: "Reels, Shorts, TikToks, and short YouTube edits.",
        price: "$99",
        priceSuffix: "per video",
        bullets: [
          "Up to 3 minutes",
          "Cuts, pacing & transitions",
          "Color correction",
          "Audio cleanup",
          "2 revisions",
          "3-day delivery",
        ],
        ctaText: "Start Starter",
        ctaHref: "#contact",
      },
      {
        badge: "Most Booked",
        name: "Professional",
        tagline: "YouTube episodes, vlogs, and branded content.",
        price: "$249",
        priceSuffix: "per video",
        highlight: { badge: "Most Booked", accentHex: "#C9A84C" },
        bullets: [
          "Up to 10 minutes",
          "Motion graphics & titles",
          "Full color grade",
          "Sound design",
          "Unlimited revisions",
          "5-day delivery",
        ],
        ctaText: "Start Professional",
        ctaHref: "#contact",
      },
      {
        badge: "Cinematic",
        name: "Premium",
        tagline: "Brand films, promos, and long-form cinematic edits.",
        price: "$499",
        priceSuffix: "per video",
        bullets: [
          "Any length",
          "Full VFX & compositing",
          "Cinematic color grade",
          "Custom music & SFX",
          "Unlimited revisions",
          "Priority delivery",
        ],
        ctaText: "Start Premium",
        ctaHref: "#contact",
      },
    ],
  },
  application: {
    id: "lead-form",
    headingTag: "Hire Me",
    heading: "Let's create\nsomething great",
    subcopy:
      "Tell me about your project — the goal, the format, the deadline, and where you're stuck. I reply to every message personally.",
    formTitle: "Project enquiry",
    formSubtitle: "Takes 2 minutes. I'll only suggest working together if it's a clear fit.",
    promiseItems: [
      { title: "Personal review", body: "I read every project enquiry myself — no VA, no automation." },
      { title: "Honest fit", body: "If I'm not the right editor for your project, I'll tell you and recommend someone who is." },
      { title: "Reply within 24 hours", body: "No ghosting, no drip sequence — a real human reply." },
    ],
    fields: {
      firstNameLabel: "First name",
      lastNameLabel: "Last name",
      emailLabel: "Email address",
      firstNamePlaceholder: "Your first name",
      lastNamePlaceholder: "Your last name",
      emailPlaceholder: "you@yourcompany.com",
      revenueLabel: "Project budget",
      revenuePlaceholder: "Select a range",
      bottleneckLabel: "Tell me about your project",
      bottleneckPlaceholder: "Format, length, deadline, references, and where you're stuck. Be specific — it helps me give a useful first reply.",
      revenueOptions: [
        { value: "Under $300", label: "Under $300" },
        { value: "$300 – $800", label: "$300 – $800" },
        { value: "$800 – $2,000", label: "$800 – $2,000" },
        { value: "$2,000 – $5,000", label: "$2,000 – $5,000" },
        { value: "$5,000+", label: "$5,000+" },
      ],
    },
    submitText: "Send Enquiry →",
    successTitle: "Enquiry received",
    successBody:
      "Thanks — I'll review your project personally and reply within 24 hours. Please check your inbox (and spam folder, just in case).",
    submitAnotherText: "Send another",
    footnote: "No newsletter, no sales blast — just a personal reply from me.",
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
    copyright: "© Shaditz. All rights reserved.",
  },
};
