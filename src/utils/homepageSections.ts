import { homepageDefaults, type HomepageContent } from "@/content/homepage";

type PageSection = NonNullable<HomepageContent["page"]>["sections"][number];

const SHADITZ_SECTION_TYPES = new Set([
  "nav",
  "hero",
  "showreel",
  "services",
  "portfolio",
  "tools",
  "process",
  "testimonials",
  "pricing",
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

  const output = shaditzIncoming.map(cloneSection);
  const seen = new Set(output.map((section) => String(section.type)));
  for (const preset of defaults) {
    if (seen.has(String(preset.type))) continue;
    output.push(cloneSection(preset));
  }

  return output;
}
