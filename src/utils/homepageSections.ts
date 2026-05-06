import { homepageDefaults, type HomepageContent } from "@/content/homepage";

type PageSection = NonNullable<HomepageContent["page"]>["sections"][number];

function cloneSection(section: PageSection): PageSection {
  return {
    ...section,
    settings: section.settings ? { ...section.settings } : undefined,
    blocks: section.blocks
      ? section.blocks.map((block) => ({
          ...block,
          content: { ...(block.content || {}) },
        }))
      : undefined,
  };
}

export function mergePageSectionsWithDefaults(sections?: PageSection[] | null): PageSection[] {
  const defaults = (homepageDefaults.page?.sections || []) as PageSection[];
  const incoming = Array.isArray(sections) && sections.length ? sections.filter(Boolean) : defaults;
  const output = incoming.map(cloneSection);

  const hasProof = output.some((section) => section.id === "proof" || section.type === "testimonials");
  const defaultProof = defaults.find((section) => section.id === "proof" && section.type === "testimonials");

  if (!hasProof && defaultProof) {
    const pricingIndex = output.findIndex((section) => section.id === "pricing" || section.type === "pricing");
    const insertAt = pricingIndex >= 0 ? pricingIndex : output.length;
    output.splice(insertAt, 0, cloneSection(defaultProof));
  }

  const proof = output.find((section) => section.id === "proof" || section.type === "testimonials");
  if (proof && defaultProof) {
    const proofSettings = (proof.settings && typeof proof.settings === "object" ? (proof.settings as Record<string, unknown>) : {}) as Record<
      string,
      unknown
    >;
    const defaultSettings = (defaultProof.settings && typeof defaultProof.settings === "object"
      ? (defaultProof.settings as Record<string, unknown>)
      : {}) as Record<string, unknown>;

    const mergedSettings: Record<string, unknown> = { ...defaultSettings, ...proofSettings };
    if (typeof proofSettings.eyebrow === "string" && proofSettings.eyebrow.trim().length) mergedSettings.eyebrow = proofSettings.eyebrow;
    if (typeof proofSettings.heading === "string" && proofSettings.heading.trim().length) mergedSettings.heading = proofSettings.heading;
    if (typeof proofSettings.subcopy === "string" && proofSettings.subcopy.trim().length) mergedSettings.subcopy = proofSettings.subcopy;

    const statsIncoming = Array.isArray(proofSettings.stats) ? proofSettings.stats : [];
    const statsDefault = Array.isArray(defaultSettings.stats) ? defaultSettings.stats : [];
    const mergedStats = [...statsIncoming];
    for (const s of statsDefault) {
      if (mergedStats.length >= 3) break;
      mergedStats.push(s);
    }
    if (mergedStats.length) mergedSettings.stats = mergedStats;

    proof.settings = mergedSettings;

    proof.blocks = Array.isArray(proof.blocks) ? proof.blocks : cloneSection(defaultProof).blocks;
  }

  return output;
}
