export type ShaditzLink = {
  label: string;
  href: string;
};

export type ShaditzMedia = {
  url: string;
  path?: string;
};

export type ShaditzLandingContent = {
  whatsapp?: {
    enabled?: boolean;
    number?: string;
    message?: string;
    bubbleText?: string;
    navLabel?: string;
    contactLabel?: string;
    heroLabel?: string;
    openInNewTab?: boolean;
  };
  marqueeItems?: string[];
  nav: {
    logo: string;
    links: ShaditzLink[];
    cta: ShaditzLink;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleHighlight: string;
    subtitle: string;
    primaryCta: ShaditzLink;
    secondaryCta: ShaditzLink;
    stats: { value: string; label: string }[];
    scrollText: string;
    background?: ShaditzMedia;
  };
  about?: {
    label?: string;
    title?: string;
    paragraphs?: string[];
    skills?: string[];
    availabilityText?: string;
  };
  showreel: {
    label: string;
    title: string;
    videoUrl: string;
    placeholderText: string;
    note: string;
  };
  services: {
    label: string;
    title: string;
    items: {
      icon: string;
      number: string;
      title: string;
      description: string;
      price?: string;
      tags: string[];
    }[];
  };
  portfolio: {
    label: string;
    title: string;
    items: {
      category: string;
      title: string;
      meta: string;
      icon: string;
      wide?: boolean;
      image?: ShaditzMedia;
      href?: string;
    }[];
  };
  tools: {
    label: string;
    title: string;
    items: { icon: string; name: string }[];
  };
  process: {
    label: string;
    title: string;
    steps: { number: string; title: string; description: string }[];
  };
  testimonials: {
    label: string;
    title: string;
    items: {
      quote: string;
      author: string;
      role: string;
      avatar: string;
      stars: string;
    }[];
  };
  pricing: {
    label: string;
    title: string;
    tiers: {
      name: string;
      price: string;
      unit: string;
      features: string[];
      cta: ShaditzLink;
      featured?: boolean;
    }[];
  };
  contact: {
    label: string;
    title: string;
    info: {
      icon: string;
      label: string;
      value: string;
      href?: string;
    }[];
    formLabel: string;
    fields: {
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      projectLabel: string;
      projectPlaceholder: string;
      budgetPlaceholder?: string;
      messageLabel: string;
      messagePlaceholder: string;
    };
    submitText: string;
    loadingText: string;
    successText: string;
    errorText: string;
  };
  footer: {
    logo: string;
    copyright: string;
    socialLinks: ShaditzLink[];
  };
};

export const shaditzLandingDefaults: ShaditzLandingContent = {
  whatsapp: {
    enabled: true,
    number: "",
    message: "Hi Shaditz! I want to discuss a project.",
    bubbleText: "Chat on WhatsApp",
    navLabel: "📲 WhatsApp",
    contactLabel: "Chat on WhatsApp",
    heroLabel: "💬 WhatsApp Me",
    openInNewTab: true,
  },
  marqueeItems: [
    "Video Editing",
    "Motion Graphics",
    "Color Grading",
    "Reels & Shorts",
    "After Effects",
    "Premiere Pro",
    "Sound Design",
    "Brand Films",
  ],
  nav: {
    logo: "SHADITZ",
    links: [
      { label: "Work", href: "#work" },
      { label: "Services", href: "#services" },
      { label: "Reviews", href: "#reviews" },
      { label: "Contact", href: "#contact" },
    ],
    cta: { label: "📲 WhatsApp", href: "" },
  },
  hero: {
    eyebrow: "✦ Freelance Cinematic Editor — Available Worldwide",
    titleLine1: "SHA",
    titleHighlight: "DITZ",
    subtitle: "I don't just edit videos — I craft visual experiences that move people.",
    primaryCta: { label: "View My Work", href: "#work" },
    secondaryCta: { label: "💬 WhatsApp Me", href: "" },
    stats: [
      { value: "50+", label: "Projects" },
      { value: "25+", label: "Clients" },
      { value: "3+", label: "Years" },
      { value: "100%", label: "Satisfaction" },
    ],
    scrollText: "Scroll Down",
  },
  about: {
    label: "About Me",
    title: "THE\nEDITOR\nBEHIND\nTHE LENS",
    paragraphs: [
      "I'm Shaditz — a freelance video editor based in Pakistan, working with international clients across YouTube, Instagram, and brand campaigns.",
      "With 3+ years of experience in Premiere Pro & After Effects, I turn raw footage into stories that hook viewers, build brands, and drive real results.",
      "Every frame matters. Every cut is intentional. Every project is treated like a cinematic masterpiece.",
    ],
    skills: ["Premiere Pro", "After Effects", "DaVinci Resolve", "Color Grading", "Motion Design", "Sound Design", "Reels / Shorts", "Brand Films"],
    availabilityText: "Available for new projects",
  },
  showreel: {
    label: "Watch",
    title: "SHOWREEL\n2024",
    videoUrl: "",
    placeholderText: "PLAY SHOWREEL",
    note: "Add your YouTube or Vimeo embed URL in the admin builder to replace this placeholder.",
  },
  services: {
    label: "What I Do",
    title: "SERVICES",
    items: [
      {
        icon: "🎬",
        number: "01",
        title: "VIDEO EDITING",
        description: "YouTube, documentaries, vlogs, brand content",
        price: "From $99",
        tags: ["Premiere Pro", "YouTube", "Vlogs"],
      },
      {
        icon: "✨",
        number: "02",
        title: "MOTION GRAPHICS",
        description: "Titles, lower thirds, animated logos, VFX",
        price: "From $149",
        tags: ["After Effects", "Motion Graphics", "VFX"],
      },
      {
        icon: "🎵",
        number: "03",
        title: "REELS & SHORTS",
        description: "High-retention vertical content for all platforms",
        price: "From $49",
        tags: ["Reels", "TikTok", "Shorts"],
      },
      {
        icon: "🎨",
        number: "04",
        title: "COLOR GRADING",
        description: "Cinematic color correction & LUT application",
        price: "From $79",
        tags: ["DaVinci Resolve", "LUTs", "Color"],
      },
      {
        icon: "🔊",
        number: "05",
        title: "SOUND DESIGN",
        description: "Audio cleanup, music sync, SFX layering",
        price: "From $59",
        tags: ["Audio Mix", "SFX", "Music Sync"],
      },
      {
        icon: "🏢",
        number: "06",
        title: "CORPORATE FILMS",
        description: "Product promos, testimonials, event highlights",
        price: "From $249",
        tags: ["Brand Film", "Promo", "Corporate"],
      },
    ],
  },
  portfolio: {
    label: "Selected Work",
    title: "PORTFOLIO",
    items: [
      {
        category: "Brand Film",
        title: "Featured Project Title Here",
        meta: "Brand Film · 2024",
        icon: "🎬",
        wide: true,
      },
      {
        category: "Motion Graphics",
        title: "Project Two",
        meta: "Motion Graphics · 2024",
        icon: "✨",
      },
      {
        category: "Social Media",
        title: "Project Three",
        meta: "Reels · 2024",
        icon: "📱",
      },
      {
        category: "Color Grading",
        title: "Project Four",
        meta: "Color Grade · 2024",
        icon: "🎨",
      },
      {
        category: "Corporate",
        title: "Project Five",
        meta: "Corporate · 2024",
        icon: "🏢",
      },
    ],
  },
  tools: {
    label: "My Arsenal",
    title: "TOOLS &\nSOFTWARE",
    items: [
      { icon: "🎞️", name: "Premiere Pro" },
      { icon: "✨", name: "After Effects" },
      { icon: "🎨", name: "DaVinci Resolve" },
      { icon: "🔊", name: "Audition" },
      { icon: "📐", name: "Photoshop" },
      { icon: "🎵", name: "Audacity" },
    ],
  },
  process: {
    label: "How I Work",
    title: "MY PROCESS",
    steps: [
      {
        number: "01",
        title: "Brief & Discovery",
        description: "We discuss your vision, goals, target audience, and deadlines to get on the same page.",
      },
      {
        number: "02",
        title: "Edit & Craft",
        description: "I edit with precision — every cut, transition, and sound is intentional and on-brand.",
      },
      {
        number: "03",
        title: "Review & Revise",
        description: "You review via Frame.io, leave comments, and I implement revisions quickly.",
      },
      {
        number: "04",
        title: "Final Delivery",
        description: "Polished final files delivered in your required format, on time, every time.",
      },
    ],
  },
  testimonials: {
    label: "Client Love",
    title: "WHAT CLIENTS\nSAY",
    items: [
      {
        quote: "Shaher Yar delivered exactly what I envisioned. His attention to detail and quick turnaround made the whole process seamless.",
        author: "Client Name Here",
        role: "CEO, Company Name",
        avatar: "👤",
        stars: "★★★★★",
      },
      {
        quote: "The motion graphics work was outstanding. Our brand video got incredible engagement. Will definitely work together again!",
        author: "Client Name Here",
        role: "Content Creator",
        avatar: "👤",
        stars: "★★★★★",
      },
      {
        quote: "Professional, creative, and responsive. The reels he edited consistently hit 100k+ views. Highly recommend!",
        author: "Client Name Here",
        role: "Brand Manager",
        avatar: "👤",
        stars: "★★★★★",
      },
    ],
  },
  pricing: {
    label: "Investment",
    title: "PRICING",
    tiers: [
      {
        name: "Starter",
        price: "$99",
        unit: "per video",
        features: ["Up to 3 min video", "Basic cuts & transitions", "Color correction", "Audio cleanup", "2 revisions", "3-day delivery"],
        cta: { label: "Get Started", href: "#contact" },
      },
      {
        name: "Professional",
        price: "$249",
        unit: "per video",
        features: ["Up to 10 min video", "Motion graphics & titles", "Full color grading", "Sound design", "Unlimited revisions", "5-day delivery"],
        cta: { label: "Get Started", href: "#contact" },
        featured: true,
      },
      {
        name: "Premium",
        price: "$499",
        unit: "per video",
        features: ["Any length video", "Full VFX & compositing", "Cinematic color grade", "Custom music & SFX", "Unlimited revisions", "Priority delivery"],
        cta: { label: "Get Started", href: "#contact" },
      },
    ],
  },
  contact: {
    label: "Get In Touch",
    title: "LET'S\nCREATE\nTOGETHER",
    info: [
      { icon: "📧", label: "Email", value: "your@email.com", href: "mailto:your@email.com" },
      { icon: "💼", label: "Upwork / Fiverr", value: "Your Profile Link", href: "#" },
      { icon: "📍", label: "Location", value: "Pakistan — Available Worldwide" },
      { icon: "⏰", label: "Response Time", value: "Within 24 hours" },
    ],
    formLabel: "Send a Message",
    fields: {
      nameLabel: "Your Name",
      namePlaceholder: "John Smith",
      emailLabel: "Email Address",
      emailPlaceholder: "john@company.com",
      projectLabel: "Project Type",
      projectPlaceholder: "YouTube Video, Reels, Corporate...",
      budgetPlaceholder: "Budget Range",
      messageLabel: "Message",
      messagePlaceholder: "Tell me about your project...",
    },
    submitText: "Send Message →",
    loadingText: "Sending...",
    successText: "Message sent. Shaher Yar will reply soon.",
    errorText: "Something went wrong. Please try again.",
  },
  footer: {
    logo: "SHAHER YAR",
    copyright: "© 2024 Shaher Yar. All rights reserved.",
    socialLinks: [
      { label: "IG", href: "#" },
      { label: "YT", href: "#" },
      { label: "LI", href: "#" },
      { label: "BE", href: "#" },
    ],
  },
};
