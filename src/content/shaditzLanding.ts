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
      platform?: string;
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
                "category": "Video Editing",
                "title": "I will do professional video editing for tiktok, reels and youtube shorts",
                "meta": "2024",
                "icon": "video",
                "image": { "url": "https://fiverr-res.cloudinary.com/video/upload/so_13.582504,t_gig_cards_web/nre3aoooqhuzkzaagwek.png" }
        },
        {
                "category": "Text Animation",
                "title": "I will make eye catching text animation and kinetic typography",
                "meta": "2024",
                "icon": "video",
                "image": { "url": "https://fiverr-res.cloudinary.com/video/upload/t_gig_cards_web/kygrp2iojlbrbogol02z.png" }
        },
        {
                "category": "Video Editing",
                "title": "I will do professional video editing for tiktok, reels and youtube shorts",
                "meta": "2024",
                "icon": "video",
                "image": { "url": "https://fiverr-res.cloudinary.com/video/upload/f_auto,q_auto,t_portfolio_project_grid/v1/video-attachments/delivery/asset/f3df85130dec14af94d44cc760060459-1750248077/PAWS%20Shelter.png" }
        },
        {
                "category": "Text Animation",
                "title": "I will make eye catching text animation and kinetic typography",
                "meta": "2024",
                "icon": "video",
                "image": { "url": "https://fiverr-res.cloudinary.com/video/upload/f_auto,q_auto,t_portfolio_project_grid/v1/video-attachments/delivery/asset/f9841e7d30f716dce7db35c0b9b539eb-1743797955/Video%20Alternative%20to%20Elevenlabs%20Luv%20voice_01.png" }
        },
        {
                "category": "Video Editing",
                "title": "I will do classic and professional video editing",
                "meta": "2024",
                "icon": "video",
                "image": { "url": "https://fiverr-res.cloudinary.com/video/upload/so_13.582504,t_gig_cards_web/nre3aoooqhuzkzaagwek.png" }
        },
        {
                "category": "Video Editing",
                "title": "I will be your professional capcut pro editor for viral video editing",
                "meta": "2024",
                "icon": "video",
                "image": { "url": "https://fiverr-res.cloudinary.com/video/upload/so_13.582504,t_gig_cards_web/nre3aoooqhuzkzaagwek.png" }
        },
        {
                "category": "Subtitles",
                "title": "I will add subtitles and translations in any language with perfect sync",
                "meta": "2024",
                "icon": "video",
                "image": { "url": "https://fiverr-res.cloudinary.com/video/upload/so_13.582504,t_gig_cards_web/nre3aoooqhuzkzaagwek.png" }
        },
        {
                "category": "Social Media Videos",
                "title": "I will create powerful crowdfunding or fundraising videos that inspire action",
                "meta": "2024",
                "icon": "video",
                "image": { "url": "https://fiverr-res.cloudinary.com/video/upload/so_13.582504,t_gig_cards_web/nre3aoooqhuzkzaagwek.png" }
        }

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
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Another amazing video, thanks again!",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Thank you so much 😊",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Very happy with the final video created very quickly as it was an urgent video",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Thank you...",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Very happy once again with the final video :)",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Thank you so much again...",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Very happy once again with the final delivery, great communication and great at implementing my changes. A+!",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Thank you so much...",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Excellent work",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Great work!",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Thanks you",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Great work",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Awesome work",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Thanks 😊",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Beast mode!",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Thanks you 😊",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "thank you so much...",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "thank you 😊",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Very happy with the final videos, could not be happier! Thank-you!",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Thank you so much Emily.",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Quick delivery, very happy with the final video",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Would recommend!",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Very happy with the video! Thankyou!",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Thanks again...",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Loved working with Shaditz. He did exceptional work and went above and beyond with what we asked for. 10/10 would recommend. We will definitely be working with him in the future.",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Very quick delivery and communication could not be happier!",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Great and easy to work with. Was able to provide a quick delivery and also make the requested edits.",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Very happy with the final videos provided, thank-you!",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Thank you soo much....",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Very happy with the final piece!",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Thanks a lot... 😊",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Thanks a lot... 👍",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Looks good!",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Very prompt but the quality just isn’t there",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Thank you for the feedback! I’m always open to suggestions and would be happy to improve the quality based on your preferences.",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Another great delivery by Shaditz. I've worked with him multiple times, and he consistently provides what I need. I've returned to him for several edits, and it's always easy to collaborate with him.",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Very happy with the final video. Quick communication and very open to the revisions I provided. A+ video support once again!",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Amazing work as always, thanks so much!!",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        },
        {
                "author": "Fiverr Client",
                "role": "Client",
                "quote": "Very happy with the final video - thanks so much!",
                "avatar": "",
                "country": "International",
                "duration": "Recently",
                "platform": "Fiverr",
                "stars": 5
        }

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
