// @memory: K-001 (core identity), T-001 (architecture), SEO/GEO layer
// Builds JSON-LD (Person + ProfessionalService) and resolves an OG image
// entirely from CMS content — zero hardcoded marketing copy. Everything here
// is derived from the editable homepage content so the business owner controls
// the machine-readable entity that AI engines (Perplexity/ChatGPT/AI Overviews)
// and search crawlers read.

import type { HomepageContent } from "@/content/homepage";
import type { ShaditzLandingContent, ShaditzMedia } from "@/content/shaditzLanding";

const SITE_URL = "https://shaditz.vercel.app";

function clean(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function absolute(url: string | undefined | null): string | null {
  const v = clean(url);
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("/")) return `${SITE_URL}${v}`;
  return null;
}

function firstMediaUrl(...medias: (ShaditzMedia | undefined)[]): string | null {
  for (const m of medias) {
    const u = absolute(m?.url);
    if (u) return u;
  }
  return null;
}

/**
 * Resolve the best available social-share image from CMS content:
 * profile image → hero background → first portfolio image → favicon.
 */
export function resolveOgImage(content: HomepageContent): string | null {
  const s = content.shaditz;
  const portfolioImage = s?.portfolio?.items?.find((i) => i.image?.url)?.image;
  return (
    firstMediaUrl(s?.about?.image, s?.hero?.background, portfolioImage) ||
    absolute(content.site?.favicon?.url) ||
    `${SITE_URL}/favicon.png`
  );
}

function priceRange(s: ShaditzLandingContent): string | undefined {
  const nums: number[] = [];
  const collect = (raw?: string) => {
    const m = clean(raw).match(/\$?\s*(\d[\d,]*)/);
    if (m) nums.push(Number(m[1].replace(/,/g, "")));
  };
  s.services?.items?.forEach((i) => collect(i.price));
  s.pricing?.tiers?.forEach((t) => collect(t.price));
  if (!nums.length) return undefined;
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  return lo === hi ? `$${lo}` : `$${lo}–$${hi}`;
}

/**
 * Build a JSON-LD graph describing the freelancer as a Person and their
 * ProfessionalService, sourced from editable CMS content.
 */
export function buildStructuredData(content: HomepageContent): Record<string, unknown> | null {
  const s = content.shaditz;
  if (!s) return null;

  const name =
    clean(s.footer?.logo) ||
    clean(content.header?.brandText) ||
    clean(s.nav?.logo) ||
    "Shaditz";

  const description =
    clean(s.hero?.subtitle) || clean(s.about?.paragraphs?.[0]) || `${name} — freelance video editor.`;

  // sameAs: real social profile URLs only (drop "#" placeholders).
  const sameAs = Array.from(
    new Set(
      [
        ...(s.footer?.socialLinks || []).map((l) => l.href),
        ...(s.contact?.info || []).map((i) => i.href),
      ]
        .map((h) => absolute(h))
        .filter((h): h is string => !!h),
    ),
  );

  // knowsAbout: tools + marquee keywords (the skills/stack signal for GEO).
  const knowsAbout = Array.from(
    new Set(
      [...(s.tools?.items || []).map((t) => t.name), ...(s.marqueeItems || [])]
        .map(clean)
        .filter(Boolean),
    ),
  );

  const emailInfo = (s.contact?.info || []).find((i) => /mail|email|@/i.test(`${i.icon} ${i.label} ${i.value}`));
  const email = emailInfo ? clean(emailInfo.value).replace(/^mailto:/i, "") : "";
  const locationInfo = (s.contact?.info || []).find((i) => /location|map|country|based/i.test(`${i.icon} ${i.label}`));
  const areaServed = locationInfo ? clean(locationInfo.value) : "Worldwide";
  const image = resolveOgImage(content);

  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name,
    url: SITE_URL,
    jobTitle: "Video Editor",
    description,
    ...(image ? { image } : {}),
    ...(knowsAbout.length ? { knowsAbout } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(email && email.includes("@") ? { email: `mailto:${email}` } : {}),
  };

  const service: Record<string, unknown> = {
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#service`,
    name,
    url: SITE_URL,
    description,
    provider: { "@id": `${SITE_URL}/#person` },
    areaServed,
    serviceType: "Video editing and motion graphics",
    ...(image ? { image } : {}),
    ...(priceRange(s) ? { priceRange: priceRange(s) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  const offers = (s.services?.items || [])
    .filter((i) => clean(i.title))
    .map((i) => ({
      "@type": "Offer",
      name: clean(i.title),
      ...(clean(i.description) ? { description: clean(i.description) } : {}),
      ...(clean(i.price)
        ? {
            priceSpecification: {
              "@type": "PriceSpecification",
              price: clean(i.price).replace(/[^\d.]/g, ""),
              priceCurrency: "USD",
            },
          }
        : {}),
    }));
  if (offers.length) {
    service.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: clean(s.services?.title) || "Services",
      itemListElement: offers,
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [person, service],
  };
}
