import type { HomepageContent } from "@/content/homepage";

type PageSection = NonNullable<HomepageContent["page"]>["sections"][number];

type Props = {
  section: PageSection;
};

function s<T extends Record<string, unknown>>(v: unknown) {
  if (!v || typeof v !== "object") return null;
  return v as T;
}

function asString(v: unknown) {
  return typeof v === "string" ? v : "";
}

export function CustomHtmlSection({ section }: Props) {
  const settings = s<Record<string, unknown>>(section.settings) || {};
  const html = asString(settings.html);
  const css = asString(settings.css);
  const js = asString(settings.js);
  const srcDoc = `<!doctype html><html><head><meta charset="utf-8" /><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`;

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-16" id={section.id}>
      <iframe
        title={section.id}
        sandbox="allow-scripts"
        className="w-full rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-black/20"
        style={{ minHeight: 240 }}
        srcDoc={srcDoc}
      />
    </section>
  );
}

