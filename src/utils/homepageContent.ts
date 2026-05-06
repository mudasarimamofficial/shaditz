import { createClient } from "@supabase/supabase-js";
import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import { sanitizeContentStrings } from "@/utils/textSanitize";
import { mergePageSectionsWithDefaults } from "@/utils/homepageSections";
import { neutralizeLegacyProofContent } from "@/utils/homepageMerge";
import { mergeTypographyScale } from "@/utils/typographyScale";

export async function getHomepageContent(): Promise<HomepageContent> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return homepageDefaults;

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await supabase
      .from("homepage_content")
      .select("content")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data?.content) return homepageDefaults;

    const { data: pages } = await supabase
      .from("site_pages")
      .select("slug, title, nav_label, show_in_header_nav, show_in_footer_nav, status")
      .eq("status", "published");

    const c = data.content as Partial<HomepageContent> | null;
    if (!c) return homepageDefaults;

    const dynamicHeader = (pages || [])
      .filter((p: any) => Boolean(p?.show_in_header_nav))
      .map((p: any) => ({
        label: String(p?.nav_label || p?.title || p?.slug || "").trim() || "Page",
        href: `/p/${String(p?.slug || "").trim()}`,
      }))
      .filter((x: any) => x.label && x.href && x.href !== "/");
    const dynamicFooter = (pages || [])
      .filter((p: any) => Boolean(p?.show_in_footer_nav))
      .map((p: any) => ({
        label: String(p?.nav_label || p?.title || p?.slug || "").trim() || "Page",
        href: `/p/${String(p?.slug || "").trim()}`,
      }))
      .filter((x: any) => x.label && x.href && x.href !== "/");

    const mergeLinks = (base: { label: string; href: string }[], extra: { label: string; href: string }[]) => {
      const seen = new Set<string>();
      const out: { label: string; href: string }[] = [];
      for (const it of [...base, ...extra]) {
        const key = `${it.label}`.trim().toLowerCase();
        const href = `${it.href}`.trim();
        if (!key || !href) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ label: it.label, href });
      }
      return out;
    };

    const mergeSocialLinksV2 = (
      base: HomepageContent["socialLinksV2"] | undefined,
      extra: HomepageContent["socialLinksV2"] | undefined,
    ) => {
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
    };

    const mergeScale = (base: any, extra: any) => {
      return mergeTypographyScale(extra, mergeTypographyScale(base));
    };

    const mergeTheme = (base: any, extra: any) => {
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
    };

    const mergeBranding = (base: any, extra: any) => {
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
    };

    const normalizeRebuiltAnchors = (value: HomepageContent): HomepageContent => {
      const preset = String((value.site as any)?.designPreset || homepageDefaults.site.designPreset || "landing_html_v1");
      if (preset === "classic") return value;

      const nav = Array.isArray(value.header?.nav) ? value.header.nav : [];
      const isLegacyNav =
        nav.length === 3 &&
        String(nav[0]?.href || "") === "#workflow" &&
        String(nav[1]?.href || "") === "#features" &&
        String(nav[2]?.href || "") === "#pricing";

      const primaryHref = String(value.header?.primaryCta?.href || "");
      const isLegacyPrimary = primaryHref === "#lead-form";

      const heroPrimaryHref = String(value.hero?.primaryCta?.href || "");
      const heroSecondaryHref = String(value.hero?.secondaryCta?.href || "");
      const isLegacyHeroPrimary = heroPrimaryHref === "#lead-form";
      const isLegacyHeroSecondary = heroSecondaryHref === "#workflow";

      if (!isLegacyNav && !isLegacyPrimary && !isLegacyHeroPrimary && !isLegacyHeroSecondary) return value;

      return {
        ...value,
        header: {
          ...value.header,
          nav: isLegacyNav ? homepageDefaults.header.nav : value.header.nav,
          primaryCta: isLegacyPrimary
            ? { ...value.header.primaryCta, href: homepageDefaults.header.primaryCta.href }
            : value.header.primaryCta,
        },
        hero: {
          ...value.hero,
          primaryCta: isLegacyHeroPrimary
            ? { ...value.hero.primaryCta, href: homepageDefaults.hero.primaryCta.href }
            : value.hero.primaryCta,
          secondaryCta: isLegacyHeroSecondary
            ? { ...value.hero.secondaryCta, href: homepageDefaults.hero.secondaryCta.href }
            : value.hero.secondaryCta,
        },
      };
    };

    return normalizeRebuiltAnchors(neutralizeLegacyProofContent(sanitizeContentStrings({
      ...homepageDefaults,
      ...c,
      site: {
        ...homepageDefaults.site,
        ...(c.site || {}),
        theme: mergeTheme(homepageDefaults.site.theme, c.site?.theme),
      },
      branding: mergeBranding(homepageDefaults.branding, c.branding),
      header: {
        ...homepageDefaults.header,
        ...(c.header || {}),
        brandIcon: { ...homepageDefaults.header.brandIcon, ...(c.header?.brandIcon || {}) },
        primaryCta: { ...homepageDefaults.header.primaryCta, ...(c.header?.primaryCta || {}) },
        nav: mergeLinks(
          (c.header?.nav || homepageDefaults.header.nav) as any,
          dynamicHeader as any,
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
          avatars: c.hero?.proof?.avatars || homepageDefaults.hero.proof?.avatars || [],
        },
        metrics: c.hero?.metrics || homepageDefaults.hero.metrics,
        revenueVisual: {
          ...(homepageDefaults.hero.revenueVisual || { value: "", label: "" }),
          ...(c.hero?.revenueVisual || {}),
        },
        backgroundImage: c.hero?.backgroundImage || homepageDefaults.hero.backgroundImage,
      },
      trust: {
        ...homepageDefaults.trust,
        ...(c.trust || {}),
        icons: c.trust?.icons || homepageDefaults.trust.icons,
      },
      features: {
        ...homepageDefaults.features,
        ...(c.features || {}),
        cards: c.features?.cards || homepageDefaults.features.cards,
        backgroundImage: c.features?.backgroundImage || homepageDefaults.features.backgroundImage,
      },
      workflow: {
        ...homepageDefaults.workflow,
        ...(c.workflow || {}),
        steps: c.workflow?.steps || homepageDefaults.workflow.steps,
        backgroundImage: c.workflow?.backgroundImage || homepageDefaults.workflow.backgroundImage,
      },
      pricing: {
        ...homepageDefaults.pricing,
        ...(c.pricing || {}),
        tiers: c.pricing?.tiers || homepageDefaults.pricing.tiers,
        backgroundImage: c.pricing?.backgroundImage || homepageDefaults.pricing.backgroundImage,
      },
      application: {
        ...homepageDefaults.application,
        ...(c.application || {}),
        fields: {
          ...homepageDefaults.application.fields,
          ...(c.application?.fields || {}),
          revenueOptions: c.application?.fields?.revenueOptions || homepageDefaults.application.fields.revenueOptions,
        },
        backgroundImage: c.application?.backgroundImage || homepageDefaults.application.backgroundImage,
      },
      footer: {
        ...homepageDefaults.footer,
        ...(c.footer || {}),
        brandIcon: { ...homepageDefaults.footer.brandIcon, ...(c.footer?.brandIcon || {}) },
        links: mergeLinks(
          (c.footer?.links || homepageDefaults.footer.links) as any,
          dynamicFooter as any,
        ),
      },
      page: {
        sections: mergePageSectionsWithDefaults(c.page?.sections),
      },
      customSections: c.customSections || homepageDefaults.customSections,
      socialLinks: c.socialLinks || homepageDefaults.socialLinks,
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
      rebuilt: {
        ...(homepageDefaults.rebuilt || {}),
        ...((c as any).rebuilt || {}),
        hero: {
          ...((homepageDefaults.rebuilt as any)?.hero || {}),
          ...(((c as any).rebuilt as any)?.hero || {}),
        },
        trustStrip: {
          ...((homepageDefaults.rebuilt as any)?.trustStrip || {}),
          ...(((c as any).rebuilt as any)?.trustStrip || {}),
        },
        founder: {
          ...((homepageDefaults.rebuilt as any)?.founder || {}),
          ...(((c as any).rebuilt as any)?.founder || {}),
          paragraphs:
            (((c as any).rebuilt as any)?.founder?.paragraphs as any) ||
            ((homepageDefaults.rebuilt as any)?.founder?.paragraphs as any) ||
            [],
        },
        promise: {
          ...((homepageDefaults.rebuilt as any)?.promise || {}),
          ...(((c as any).rebuilt as any)?.promise || {}),
          cards:
            (((c as any).rebuilt as any)?.promise?.cards as any) ||
            ((homepageDefaults.rebuilt as any)?.promise?.cards as any) ||
            [],
        },
        how: {
          ...((homepageDefaults.rebuilt as any)?.how || {}),
          ...(((c as any).rebuilt as any)?.how || {}),
          steps:
            (((c as any).rebuilt as any)?.how?.steps as any) ||
            ((homepageDefaults.rebuilt as any)?.how?.steps as any) ||
            [],
        },
        honest: {
          ...((homepageDefaults.rebuilt as any)?.honest || {}),
          ...(((c as any).rebuilt as any)?.honest || {}),
          paragraphs:
            (((c as any).rebuilt as any)?.honest?.paragraphs as any) ||
            ((homepageDefaults.rebuilt as any)?.honest?.paragraphs as any) ||
            [],
          pledgeItems:
            (((c as any).rebuilt as any)?.honest?.pledgeItems as any) ||
            ((homepageDefaults.rebuilt as any)?.honest?.pledgeItems as any) ||
            [],
        },
      },
    })));
  } catch {
    return homepageDefaults;
  }
}
