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
    image?: ShaditzMedia;
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
      country: string;
      role?: string;
      avatar: string;
      stars: number;
      duration: string;
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
    navLabel: "WhatsApp",
    contactLabel: "Chat on WhatsApp",
    heroLabel: "WhatsApp Me",
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
    cta: { label: "WhatsApp", href: "" },
  },
  hero: {
    eyebrow: "✦ Freelance Cinematic Editor — Available Worldwide",
    titleLine1: "SHA",
    titleHighlight: "DITZ",
    subtitle: "I don't just edit videos — I craft visual experiences that move people.",
    primaryCta: { label: "View My Work", href: "#work" },
    secondaryCta: { label: "Chat on WhatsApp", href: "" },
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
      "I'm Shaditz — a freelance video editor based in Pakistan, providing professional video editing services using Adobe Premiere Pro & After Effects.",
      "From YouTube videos, TikToks, Instagram Reels, Shorts, and fundraising campaigns to corporate projects and cinematic edits, I deliver high-quality, engaging content that brings your vision to life.",
      "Fluent in English, Hindi, French, and Hebrew. Available at an hourly rate of $10/hr.",
    ],
    skills: ["Real Estate expert", "Editor", "Instagram content creator", "Social media branding expert", "Short film editor", "Adobe Premiere Pro expert", "YouTube video editor", "Graphic designer"],
    availabilityText: "Available for new projects",
    image: { url: "https://fiverr-res.cloudinary.com/image/upload/f_auto,q_auto,t_profile_original/v1/attachments/profile/photo/e67ad75fad4b878f7540da1f0d450143-1724158558972/7ba22e19-db6d-493d-8683-c8c05ef0b388.jpg" }
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
        icon: "video",
        number: "01",
        title: "VIDEO EDITING",
        description: "YouTube, documentaries, vlogs, brand content",
        price: "From $99",
        tags: ["Premiere Pro", "YouTube", "Vlogs"],
      },
      {
        icon: "sparkles",
        number: "02",
        title: "MOTION GRAPHICS",
        description: "Titles, lower thirds, animated logos, VFX",
        price: "From $149",
        tags: ["After Effects", "Motion Graphics", "VFX"],
      },
      {
        icon: "music",
        number: "03",
        title: "REELS & SHORTS",
        description: "High-retention vertical content for all platforms",
        price: "From $49",
        tags: ["Reels", "TikTok", "Shorts"],
      },
      {
        icon: "palette",
        number: "04",
        title: "COLOR GRADING",
        description: "Cinematic color correction & LUT application",
        price: "From $79",
        tags: ["DaVinci Resolve", "LUTs", "Color"],
      },
      {
        icon: "volume",
        number: "05",
        title: "SOUND DESIGN",
        description: "Audio cleanup, music sync, SFX layering",
        price: "From $59",
        tags: ["Audio Mix", "SFX", "Music Sync"],
      },
      {
        icon: "building",
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
        icon: "video",
        wide: true,
      },
      {
        category: "Motion Graphics",
        title: "Project Two",
        meta: "Motion Graphics · 2024",
        icon: "sparkles",
      },
      {
        category: "Social Media",
        title: "Project Three",
        meta: "Reels · 2024",
        icon: "smartphone",
      },
      {
        category: "Color Grading",
        title: "Project Four",
        meta: "Color Grade · 2024",
        icon: "palette",
      },
      {
        category: "Corporate",
        title: "Project Five",
        meta: "Corporate · 2024",
        icon: "building",
      },
    ],
  },
  tools: {
    label: "My Arsenal",
    title: "TOOLS &\nSOFTWARE",
    items: [
      { icon: "film", name: "Premiere Pro" },
      { icon: "sparkles", name: "After Effects" },
      { icon: "palette", name: "DaVinci Resolve" },
      { icon: "volume", name: "Audition" },
      { icon: "pen", name: "Photoshop" },
      { icon: "music", name: "Audacity" },
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
        author: "ewoffindin44",
        country: "United States",
        role: "Content Creator",
        avatar: "https://fiverr-res.cloudinary.com/t_profile_thumb,q_auto,f_auto/attachments/profile/photo/dd908294b527e6e7bde13557c6e7052c-1702067980380/b2ff5541-be28-4926-b019-a53495605360.jpg",
        stars: 5,
        duration: "1 week ago"
      },
      {
        quote: "The motion graphics work was outstanding. Our brand video got incredible engagement. Will definitely work together again!",
        author: "kelseyhepples",
        country: "United Kingdom",
        role: "Brand Manager",
        avatar: "https://fiverr-res.cloudinary.com/t_profile_thumb,q_auto,f_auto/attachments/profile/photo/f8f6a41ad1ef1c8cac408b8c80b79435-1776680003581/8fe167a7-70d5-4ded-b882-1007d3ec3944.JPG",
        stars: 5,
        duration: "2 weeks ago"
      },
      {
        quote: "Professional, creative, and responsive. The reels he edited consistently hit 100k+ views. Highly recommend!",
        author: "cutaboveedits",
        country: "Australia",
        role: "Agency Owner",
        avatar: "https://fiverr-res.cloudinary.com/t_profile_thumb,q_auto,f_auto/attachments/profile/photo/b778f0075d24e06bc013e5e37a6d8258-1675574930448/3ebb4d5f-029d-4b72-a49c-42dfe8d393f3.jpg",
        stars: 5,
        duration: "1 month ago"
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
      { icon: "mail", label: "Email", value: "your@email.com", href: "mailto:your@email.com" },
      { icon: "briefcase", label: "Upwork / Fiverr", value: "Your Profile Link", href: "#" },
      { icon: "map", label: "Location", value: "Pakistan — Available Worldwide" },
      { icon: "clock", label: "Response Time", value: "Within 24 hours" },
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
