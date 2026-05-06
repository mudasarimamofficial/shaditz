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
  const shaditzIncoming = incoming.filter((section) => SHADITZ_SECTION_TYPES.has(String(section.type)));

  if (!shaditzIncoming.length) return defaults.map(cloneSection);

  return shaditzIncoming.map(cloneSection);
}
