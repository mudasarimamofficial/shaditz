export type ShaditzLink = {
  label: string;
  href: string;
};

export type ShaditzMedia = {
  url: string;
  path?: string;
};

export type ShaditzLandingContent = {
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
  nav: {
    logo: "SY",
    links: [
      { label: "Work", href: "#work" },
      { label: "Services", href: "#services" },
      { label: "Process", href: "#process" },
      { label: "Pricing", href: "#pricing" },
      { label: "Contact", href: "#contact" },
    ],
    cta: { label: "Hire Me", href: "#contact" },
  },
  hero: {
    eyebrow: "Freelance Video Editor — Available Worldwide",
    titleLine1: "SHAHER",
    titleHighlight: "YAR",
    subtitle: "Turning raw footage into cinematic stories that move people.",
    primaryCta: { label: "View My Work", href: "#work" },
    secondaryCta: { label: "Let's Talk", href: "#contact" },
    stats: [
      { value: "50+", label: "Projects Done" },
      { value: "20+", label: "Happy Clients" },
      { value: "3+", label: "Years Experience" },
    ],
    scrollText: "Scroll to Explore",
  },
  showreel: {
    label: "Showreel",
    title: "MY LATEST\nREEL",
    videoUrl: "",
    placeholderText: "SHOWREEL 2024",
    note: "📌 Yahan apna YouTube ya Vimeo link paste karo — iframe se replace karo",
  },
  services: {
    label: "What I Offer",
    title: "SERVICES",
    items: [
      {
        icon: "🎬",
        number: "01",
        title: "Video Editing",
        description: "Professional cuts, pacing, and storytelling for YouTube, documentaries, vlogs, and branded content.",
        tags: ["Premiere Pro", "YouTube", "Vlogs"],
      },
      {
        icon: "✨",
        number: "02",
        title: "Motion Graphics",
        description: "Eye-catching titles, lower thirds, animated logos, and visual effects that elevate your content.",
        tags: ["After Effects", "Motion Graphics", "VFX"],
      },
      {
        icon: "🎵",
        number: "03",
        title: "Reels & Short Form",
        description: "High-retention Instagram Reels, TikToks, and YouTube Shorts designed to go viral.",
        tags: ["Reels", "TikTok", "Shorts"],
      },
      {
        icon: "🎨",
        number: "04",
        title: "Color Grading",
        description: "Cinematic color correction and grading to give your footage a professional, consistent look.",
        tags: ["DaVinci Resolve", "LUTs", "Color"],
      },
      {
        icon: "🔊",
        number: "05",
        title: "Audio Design",
        description: "Sound design, music sync, dialogue cleanup, and audio mixing for a polished final product.",
        tags: ["Audio Mix", "SFX", "Music Sync"],
      },
      {
        icon: "🏢",
        number: "06",
        title: "Corporate Videos",
        description: "Brand films, product promos, testimonials, and event highlight reels for businesses.",
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
    title: "TESTIMONIALS",
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
