import type { ReactNode } from "react";

type Props = {
  title?: string;
  html?: string;
  containerClassName?: string;
};

function safeString(v: unknown) {
  return typeof v === "string" ? v : "";
}

export function RichTextSection({ title, html, containerClassName }: Props) {
  const t = safeString(title).trim();
  const h = safeString(html).trim();
  if (!t && !h) return null;
  return (
    <section className={containerClassName || "cf-rich-text-section"}>
      <article className="cf-rich-text-document">
        {t ? <h1>{t}</h1> : null}
        {h ? <div className="cf-rich-text-body" dangerouslySetInnerHTML={{ __html: h }} /> : null}
      </article>
    </section>
  );
}

export function renderRichTextFromSectionSettings(settings: Record<string, unknown> | null | undefined): ReactNode {
  const s = (settings || {}) as any;
  return <RichTextSection title={s.title} html={s.content} />;
}
