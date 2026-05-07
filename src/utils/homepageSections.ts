import { homepageDefaults, type HomepageContent } from "@/content/homepage";

type PageSection = NonNullable<HomepageContent["page"]>["sections"][number];

const SHADITZ_SECTION_TYPES = new Set([
  "loader",
  "nav",
  "whatsapp",
  "hero",
  "marquee",
  "about",
  "showreel",
  "services",
  "portfolio",
  "process",
  "reviews",
  "tools",
  "contact",
  "footer",
]);

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
  const incoming = Array.isArray(sections) ? sections.filter(Boolean) : [];
  const shaditzIncoming = incoming.filter((section) =>
    SHADITZ_SECTION_TYPES.has(String(section.type)),
  );

  if (!shaditzIncoming.length) return defaults.map(cloneSection);

  // If any canonical section is missing from user data, the saved page.sections
  // predates the cinematic Shaditz design (e.g., legacy CoachFlow shape). Reset
  // to canonical order, preserving any per-section settings the user has saved
  // for the sections that DO exist. Section content lives in
  // content.shaditz/site/etc — not in page.sections — so this reset doesn't lose
  // editorial work.
  const incomingByType = new Map<string, PageSection>(
    shaditzIncoming.map((s) => [String(s.type), s]),
  );
  const missingCanonical = defaults.some((d) => !incomingByType.has(String(d.type)));

  if (missingCanonical) {
    return defaults.map((d) => {
      const userOverride = incomingByType.get(String(d.type));
      return cloneSection(userOverride || d);
    });
  }

  // User data already covers every canonical section — preserve their order.
  return shaditzIncoming.map(cloneSection);
}
