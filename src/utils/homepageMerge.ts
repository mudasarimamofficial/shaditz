import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import { mergePageSectionsWithDefaults } from "@/utils/homepageSections";
import { mergeTypographyScale } from "@/utils/typographyScale";

type Link = { label: string; href: string };

function mergeScale(base: any, extra: any) {
  return mergeTypographyScale(extra, mergeTypographyScale(base));
}

function mergeTheme(base: any, extra: any) {
  const b = base || homepageDefaults.site.theme;
  const e = extra || {};
  return {
    ...b,
    ...e,
    colors: { ...(b?.colors || {}), ...(e.colors || {}) },
    typography: {
      ...(b?.typography || {}),
      ...(e.typography || {}),
      scale: mergeScale(b?.typography?.scale, e.typography?.scale),
    },
  };
}

function mergeBranding(base: any, extra: any) {
  const b = base || homepageDefaults.branding;
  const e = extra || {};
  return {
    ...b,
    ...e,
    colors: { ...(b?.colors || {}), ...(e.colors || {}) },
    typography: {
      ...(b?.typography || {}),
      ...(e.typography || {}),
      scale: mergeScale(b?.typography?.scale, e.typography?.scale),
    },
  };
}

export function mergeLinks(base: Link[] | undefined, extra?: Link[] | null) {
  const seen = new Set<string>();
  const out: Link[] = [];
  const all = [...(Array.isArray(base) ? base : []), ...(Array.isArray(extra) ? extra : [])];

  for (const item of all) {
    const label = typeof item?.label === "string" ? item.label.trim() : "";
    const href = typeof item?.href === "string" ? item.href.trim() : "";
    if (!label || !href) continue;
    const key = `${label}:${href}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label, href });
  }

  return out;
}

export function mergeSocialLinksV2(
  base: HomepageContent["socialLinksV2"] | undefined,
  extra: HomepageContent["socialLinksV2"] | undefined,
) {
  const b = Array.isArray(base) ? base : [];
  const e = Array.isArray(extra) ? extra : [];
  const byId = new Map<string, any>();
  for (const item of e) {
    const id = String((item as any)?.id || "").trim();
    if (!id) continue;
    byId.set(id, item);
  }
  const out: any[] = [];
  for (const preset of b) {
    const id = String((preset as any)?.id || "").trim();
    const override = id ? byId.get(id) : null;
    out.push(override ? { ...(preset as any), ...(override as any) } : preset);
    if (id) byId.delete(id);
  }
  for (const rest of byId.values()) out.push(rest);
  return out as HomepageContent["socialLinksV2"];
}

function neutralPricingNote(value: string) {
  if (/onboarding\s+\d+\s+new coaches/i.test(value)) {
    return "Applications are reviewed for fit before onboarding begins.";
  }
  return value;
}

function neutralTierTagline(value: string) {
  if (/predictable\s+\$?\d+k\+?\s+months/i.test(value)) {
    return "For coaches ready to scale beyond ad hoc lead flow.";
  }
  return value;
}

function neutralTierOutcome(name: string, value: string) {
  if (!/expected\s+\d|expected\s+.*booked|expected\s+.*qualified|\d+\+\s+calls/i.test(value)) return value;
  const key = name.toLowerCase();
  if (key.includes("starter")) return "Built to establish a consistent qualified-conversation workflow.";
  if (key.includes("growth")) return "Built to scale multi-channel booked-call delivery with weekly optimization.";
  if (key.includes("scale")) return "Built for full pipeline visibility and priority optimization.";
  return "Built around qualified conversations, follow-up discipline, and pipeline visibility.";
}

function neutralApplicationCopy(value: string, fallback: string) {
  if (/24\s*h(?:ours?)?|24\s*hours|within\s+24\s+hours|5\s+new\s+coaches/i.test(value)) return fallback;
  return value;
}

function neutralAuditCopy(value: string) {
  if (/60[-\s]?second|answer\s+7\s+questions|show you exactly/i.test(value)) {
    return "Take the client acquisition fit audit. Answer a few questions and we will show you where your lead generation may be leaking - and which tier fits your current stage.";
  }
  return value;
}

function generatedAvatarUrl(value: unknown) {
  return typeof value === "string" && /text_to_image|picsum\.photos|coresg-normal/i.test(value);
}

function neutralProofBlock(block: any) {
  if (!block || (block.type !== "testimonial" && block.type !== "proof_card")) return block;
  const content = { ...(block.content || {}) };
  const name = String(content.name || content.title || "");
  const quote = String(content.quote || content.body || "");
  const avatarUrl = content.avatar?.url || content.avatarUrl || "";
  const generated = /High-ticket coach|Transformation mentor/i.test(name) || generatedAvatarUrl(avatarUrl);
  if (!generated && !/(18 booked calls|312 qualified leads|\$42k pipeline|Averaging 15|Trusted by 50)/i.test(quote)) return block;

  return {
    ...block,
    type: "proof_card",
    content: {
      ...content,
      title: content.title || "Proof signal",
      role: content.role || "Operational signal",
      quote: "Use this slot for a verified client result, approved testimonial, or concrete delivery proof.",
      rating: undefined,
      avatar: undefined,
      avatarUrl: undefined,
    },
  };
}

export function neutralizeLegacyProofContent(content: HomepageContent): HomepageContent {
  const pricing = {
    ...content.pricing,
    note: neutralPricingNote(content.pricing.note || ""),
    tiers: (content.pricing.tiers || []).map((tier) => ({
      ...tier,
      tagline: neutralTierTagline(tier.tagline || ""),
      outcome: neutralTierOutcome(tier.name || "", (tier as any).outcome || ""),
    })),
  };

  const application = {
    ...content.application,
    subcopy: neutralApplicationCopy(
      content.application.subcopy || "",
      "Tell us about your business and we will review fit before the next step.",
    ),
    footnote: neutralApplicationCopy(
      content.application.footnote || "",
      "We'll review your answers and reply with next steps if there is alignment.",
    ),
    successBody: neutralApplicationCopy(
      content.application.successBody || "",
      "We review every application personally and will be in touch if there is a fit. Check your email, including your spam folder.",
    ),
  };

  const sections = (content.page?.sections || []).map((section: any) => {
    const settings = { ...(section.settings || {}) };
    if (section.type === "pricing" && typeof settings.note === "string") settings.note = neutralPricingNote(settings.note);
    if (section.type === "application" && typeof settings.subcopy === "string") {
      settings.subcopy = neutralApplicationCopy(settings.subcopy, application.subcopy);
    }
    if (section.type === "audit_bridge" && typeof settings.subcopy === "string") settings.subcopy = neutralAuditCopy(settings.subcopy);

    const blocks = Array.isArray(section.blocks)
      ? section.blocks.map((block: any) => {
          if (section.type === "pricing" && block?.type === "tier") {
            const content = { ...(block.content || {}) };
            return {
              ...block,
              content: {
                ...content,
                tagline: neutralTierTagline(String(content.tagline || "")),
                outcome: neutralTierOutcome(String(content.name || ""), String(content.outcome || "")),
              },
            };
          }
          return neutralProofBlock(block);
        })
      : section.blocks;

    return {
      ...section,
      settings,
      ...(blocks ? { blocks } : {}),
    };
  });

  return {
    ...content,
    pricing,
    application,
    page: {
      ...(content.page || { sections: [] }),
      sections,
    },
  };
}

export function mergeHomepageContent(c: Partial<HomepageContent> | null | undefined): HomepageContent {
  if (!c) return homepageDefaults;

  return neutralizeLegacyProofContent({
    ...homepageDefaults,
    ...c,
    site: {
      ...homepageDefaults.site,
      ...(c.site || {}),
      favicon: { ...homepageDefaults.site.favicon, ...(c.site?.favicon || {}) },
      theme: mergeTheme(homepageDefaults.site.theme, c.site?.theme),
    },
    branding: mergeBranding(homepageDefaults.branding, c.branding),
    header: {
      ...homepageDefaults.header,
      ...(c.header || {}),
      brandIcon: { ...homepageDefaults.header.brandIcon, ...(c.header?.brandIcon || {}) },
      primaryCta: { ...homepageDefaults.header.primaryCta, ...(c.header?.primaryCta || {}) },
      nav: mergeLinks(
        Array.isArray(c.header?.nav) ? c.header?.nav : homepageDefaults.header.nav,
      ),
    },
    hero: {
      ...homepageDefaults.hero,
      ...(c.hero || {}),
      badge: { ...homepageDefaults.hero.badge, ...(c.hero?.badge || {}) },
      heading: { ...homepageDefaults.hero.heading, ...(c.hero?.heading || {}) },
      primaryCta: { ...homepageDefaults.hero.primaryCta, ...(c.hero?.primaryCta || {}) },
      secondaryCta: { ...homepageDefaults.hero.secondaryCta, ...(c.hero?.secondaryCta || {}) },
      proof: {
        ...(homepageDefaults.hero.proof || { title: "", eyebrow: "", avatars: [] }),
        ...(c.hero?.proof || {}),
        avatars: Array.isArray(c.hero?.proof?.avatars)
          ? c.hero?.proof?.avatars
          : homepageDefaults.hero.proof?.avatars || [],
      },
      metrics: Array.isArray(c.hero?.metrics) ? c.hero?.metrics : homepageDefaults.hero.metrics,
      revenueVisual: {
        ...(homepageDefaults.hero.revenueVisual || { value: "", label: "" }),
        ...(c.hero?.revenueVisual || {}),
      },
      backgroundImage: c.hero?.backgroundImage || homepageDefaults.hero.backgroundImage,
    },
    trust: {
      ...homepageDefaults.trust,
      ...(c.trust || {}),
      icons: Array.isArray(c.trust?.icons) ? c.trust?.icons : homepageDefaults.trust.icons,
    },
    features: {
      ...homepageDefaults.features,
      ...(c.features || {}),
      cards: Array.isArray(c.features?.cards) ? c.features?.cards : homepageDefaults.features.cards,
      backgroundImage: c.features?.backgroundImage || homepageDefaults.features.backgroundImage,
    },
    workflow: {
      ...homepageDefaults.workflow,
      ...(c.workflow || {}),
      steps: Array.isArray(c.workflow?.steps) ? c.workflow?.steps : homepageDefaults.workflow.steps,
      backgroundImage: c.workflow?.backgroundImage || homepageDefaults.workflow.backgroundImage,
    },
    pricing: {
      ...homepageDefaults.pricing,
      ...(c.pricing || {}),
      tiers: Array.isArray(c.pricing?.tiers) ? c.pricing?.tiers : homepageDefaults.pricing.tiers,
      backgroundImage: c.pricing?.backgroundImage || homepageDefaults.pricing.backgroundImage,
    },
    application: {
      ...homepageDefaults.application,
      ...(c.application || {}),
      fields: {
        ...homepageDefaults.application.fields,
        ...(c.application?.fields || {}),
        revenueOptions: Array.isArray(c.application?.fields?.revenueOptions)
          ? c.application?.fields?.revenueOptions
          : homepageDefaults.application.fields.revenueOptions,
      },
      backgroundImage: c.application?.backgroundImage || homepageDefaults.application.backgroundImage,
    },
    footer: {
      ...homepageDefaults.footer,
      ...(c.footer || {}),
      brandIcon: { ...homepageDefaults.footer.brandIcon, ...(c.footer?.brandIcon || {}) },
      links: mergeLinks(Array.isArray(c.footer?.links) ? c.footer?.links : homepageDefaults.footer.links),
    },
    page: {
      sections: mergePageSectionsWithDefaults(c.page?.sections),
    },
    customSections: Array.isArray(c.customSections) ? c.customSections : homepageDefaults.customSections,
    socialLinks: Array.isArray(c.socialLinks) ? c.socialLinks : homepageDefaults.socialLinks,
    socialLinksV2: mergeSocialLinksV2(homepageDefaults.socialLinksV2, c.socialLinksV2),
    whatsapp: {
      ...(homepageDefaults.whatsapp || {
        enabled: false,
        phone: "",
        message: "",
        tooltip: "Chat with us!",
        modalTitle: "Shaditz",
        modalSubtitle: "Usually replies instantly",
        buttonText: "Start Chat",
        headerColorHex: "#25D366",
      }),
      ...(c.whatsapp || {}),
      enabled: c.whatsapp?.enabled ?? (homepageDefaults.whatsapp?.enabled ?? false),
      phone: c.whatsapp?.phone ?? (homepageDefaults.whatsapp?.phone ?? ""),
      message: c.whatsapp?.message ?? (homepageDefaults.whatsapp?.message ?? ""),
      tooltip: c.whatsapp?.tooltip ?? (homepageDefaults.whatsapp?.tooltip ?? "Chat with us!"),
      modalTitle: c.whatsapp?.modalTitle ?? (homepageDefaults.whatsapp?.modalTitle ?? "Shaditz"),
      modalSubtitle:
        c.whatsapp?.modalSubtitle ?? (homepageDefaults.whatsapp?.modalSubtitle ?? "Usually replies instantly"),
      buttonText: c.whatsapp?.buttonText ?? (homepageDefaults.whatsapp?.buttonText ?? "Start Chat"),
      headerColorHex: c.whatsapp?.headerColorHex ?? (homepageDefaults.whatsapp?.headerColorHex || "#25D366"),
      avatar: c.whatsapp?.avatar || homepageDefaults.whatsapp?.avatar,
    },
  });
}
