export type SitePage = {
  id: string;
  slug: string;
  title: string;
  nav_label: string | null;
  show_in_header_nav: boolean;
  show_in_footer_nav: boolean;
  status: "draft" | "published";
  meta_title: string | null;
  meta_description: string | null;
  draft_content: unknown;
  published_content: unknown;
  updated_at: string;
};

export type PageSection = {
  id: string;
  type: "rich_text";
  enabled: boolean;
  settings?: { title?: string; content?: string };
};

export type CmsPageContent = {
  sections: PageSection[];
};

export function nowId(prefix: string) {
  return `${prefix}_${Date.now()}`;
}

export function normalizeSlug(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9-]/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

export function toSections(v: any): PageSection[] {
  const src = Array.isArray(v?.sections) ? v.sections : Array.isArray(v?.page?.sections) ? v.page.sections : [];
  return src.filter((s: any) => s && s.type === "rich_text");
}

export function withSections(sections: PageSection[]): CmsPageContent {
  return { sections };
}

