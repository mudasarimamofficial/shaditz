import type { HomepageContent } from "@/content/homepage";

type PageSection = NonNullable<HomepageContent["page"]>["sections"][number];

function s<T extends Record<string, unknown>>(v: unknown) {
  if (!v || typeof v !== "object") return null;
  return v as T;
}

function asString(v: unknown) {
  return typeof v === "string" ? v : "";
}

function asBool(v: unknown) {
  return typeof v === "boolean" ? v : false;
}

function parseHeroMetrics(value: unknown) {
  const raw = asString(value);
  if (!raw.trim()) return null;
  const metrics = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = "", metricValue = "", change = "", tone = "gold"] = line.split("|").map((part) => part.trim());
      return {
        title,
        value: metricValue,
        change: change || undefined,
        tone: tone === "blue" || tone === "green" ? tone : "gold",
      };
    })
    .filter((metric) => metric.title && metric.value);
  return metrics.length ? metrics : null;
}

function blocks(section: PageSection | undefined) {
  return Array.isArray(section?.blocks) ? section!.blocks! : [];
}

export function applyBuilderOverrides(input: HomepageContent): HomepageContent {
  const sections = input.page?.sections || [];

  const hero = sections.find((x) => x.type === "hero");
  const features = sections.find((x) => x.type === "features");
  const pricing = sections.find((x) => x.type === "pricing");
  const trust = sections.find((x) => x.type === "trust");
  const footer = sections.find((x) => x.type === "footer");

  let out: HomepageContent = input;

  if (hero?.settings) {
    const set = s<Record<string, unknown>>(hero.settings);
    if (set) {
      const headingPrefix = asString(set.headingPrefix);
      const headingHighlight = asString(set.headingHighlight);
      const subcopy = asString(set.subcopy);
      const note = asString(set.note);
      const primaryText = asString(set.primaryText);
      const primaryHref = asString(set.primaryHref);
      const secondaryText = asString(set.secondaryText);
      const secondaryHref = asString(set.secondaryHref);
      const proofTitle = asString(set.proofTitle);
      const proofEyebrow = asString(set.proofEyebrow);
      const revenueValue = asString(set.revenueValue);
      const revenueLabel = asString(set.revenueLabel);
      const parsedMetrics = parseHeroMetrics(set.metricsText);
      const bgUrl = asString(s<Record<string, unknown>>(set.background)?.url);

      out = {
        ...out,
        hero: {
          ...out.hero,
          heading: {
            prefix: headingPrefix || out.hero.heading.prefix,
            highlight: headingHighlight || out.hero.heading.highlight,
          },
          subcopy: subcopy || out.hero.subcopy,
          note: note || out.hero.note,
          primaryCta: {
            ...out.hero.primaryCta,
            text: primaryText || out.hero.primaryCta.text,
            href: primaryHref || out.hero.primaryCta.href,
          },
          secondaryCta: {
            ...out.hero.secondaryCta,
            text: secondaryText || out.hero.secondaryCta.text,
            href: secondaryHref || out.hero.secondaryCta.href,
          },
          proof:
            proofTitle || proofEyebrow
              ? {
                  ...((out.hero as any).proof || {}),
                  title: proofTitle || (out.hero as any).proof?.title || "",
                  eyebrow: proofEyebrow || (out.hero as any).proof?.eyebrow || "",
                }
              : (out.hero as any).proof,
          metrics: parsedMetrics || (out.hero as any).metrics,
          revenueVisual:
            revenueValue || revenueLabel
              ? {
                  ...((out.hero as any).revenueVisual || {}),
                  value: revenueValue || (out.hero as any).revenueVisual?.value || "",
                  label: revenueLabel || (out.hero as any).revenueVisual?.label || "",
                }
              : (out.hero as any).revenueVisual,
          backgroundImage: bgUrl ? { url: bgUrl } : out.hero.backgroundImage,
        },
      };
    }
  }

  if (trust?.settings) {
    const set = s<Record<string, unknown>>(trust.settings);
    if (set) {
      const eyebrow = asString(set.eyebrow);
      if (eyebrow) out = { ...out, trust: { ...out.trust, eyebrow } };
    }
  }

  const featureBlocks = blocks(features).filter((b) => b.type === "feature");
  if (featureBlocks.length) {
    out = {
      ...out,
      features: {
        ...out.features,
        cards: featureBlocks
          .map((b) => {
            const c = b.content || {};
            const title = asString(c.title);
            const copy = asString(c.description);
            const iconType = asString(s<Record<string, unknown>>(c.icon)?.type);
            const iconValue = asString(s<Record<string, unknown>>(c.icon)?.value);
            const iconRef = iconType && iconValue ? ({ type: iconType as any, value: iconValue } as any) : undefined;
            const material = asString(c.materialIcon);
            return { title, copy, icon: material || undefined, iconRef };
          })
          .filter((x) => x.title.trim().length),
      },
    };
  }

  const tierBlocks = blocks(pricing).filter((b) => b.type === "tier");
  if (tierBlocks.length) {
    out = {
      ...out,
      pricing: {
        ...out.pricing,
        tiers: tierBlocks
          .map((b) => {
            const c = b.content || {};
            const tierBadge = asString(c.badge);
            const name = asString(c.name);
            const tagline = asString(c.tagline);
            const price = asString(c.price);
            const priceWas = asString(c.priceWas);
            const priceSuffix = asString(c.priceSuffix);
            const outcome = asString(c.outcome);
            const ctaText = asString(c.ctaText);
            const ctaHref = asString(c.ctaHref);
            const isHighlighted = asBool(c.highlighted);
            const highlightBadge = asString(c.highlightBadge);
            const accentHex = asString(c.highlightAccentHex);
            const bullets = Array.isArray(c.bullets) ? (c.bullets as unknown[]).map(asString).filter(Boolean) : [];
            return {
              badge: tierBadge || undefined,
              name,
              tagline,
              price,
              priceWas: priceWas || undefined,
              priceSuffix: priceSuffix || undefined,
              outcome: outcome || undefined,
              highlight: isHighlighted
                ? { badge: highlightBadge || tierBadge || "Most Popular", accentHex: accentHex || "#b58a2f" }
                : undefined,
              bullets,
              ctaText: ctaText || "Select",
              ctaHref: ctaHref || "#lead-form",
            };
          })
          .filter((t) => t.name.trim().length && t.price.trim().length),
      },
    };
  }

  const socialBlocks = blocks(footer).filter((b) => b.type === "social_link");
  if (socialBlocks.length) {
    out = {
      ...out,
      socialLinksV2: socialBlocks
        .map((b) => {
          const c = b.content || {};
          const platform = asString(c.platform);
          const url = asString(c.url);
          const enabled = typeof c.enabled === "boolean" ? (c.enabled as boolean) : true;
          const iconType = asString(s<Record<string, unknown>>(c.icon)?.type);
          const iconValue = asString(s<Record<string, unknown>>(c.icon)?.value);
          const icon = iconType && iconValue ? ({ type: iconType as any, value: iconValue } as any) : undefined;
          return { id: b.id, platform, url, enabled, icon };
        })
        .filter((x) => x.platform.trim().length),
    };
  }

  return out;
}
