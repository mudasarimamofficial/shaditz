import type { HomepageContent } from "@/content/homepage";
import type { PageSection } from "@/components/landing/sectionRegistry";

type Props = {
  content: HomepageContent;
  section?: PageSection;
};

export function Features({ content, section }: Props) {
  const sectionBlocks = Array.isArray(section?.blocks) ? section.blocks : undefined;
  const blocks = sectionBlocks || content.page?.sections?.find((s) => s.type === "features")?.blocks;
  const label = (section?.settings as any)?.label || (content.features as any).label || "";
  const cards: {
    title: string;
    copy: string;
    icon?: string;
    iconRef?: { type: "library" | "upload"; value: string } | null;
    imageUrl: string;
  }[] = Array.isArray(blocks) && blocks.length
    ? blocks
        .filter((b) => b.type === "feature")
        .map((b) => {
          const c = (b.content || {}) as any;
          return {
            title: String(c.title || ""),
            copy: String(c.description || c.copy || ""),
            icon: typeof c.icon === "string" ? c.icon : undefined,
            iconRef: c.iconRef || undefined,
            imageUrl: typeof c.image?.url === "string" ? c.image.url : "",
          };
        })
    : content.features.cards.map((card: any) => ({
        title: String(card.title || ""),
        copy: String(card.copy || ""),
        icon: typeof card.icon === "string" ? card.icon : undefined,
        iconRef: card.iconRef || undefined,
        imageUrl: "",
      }));

  return (
    <section id="features">
      <div className="container">
        <div className="section-intro">
          {label ? <div className="label-tag">{label}</div> : null}
          <h2>{content.features.heading}</h2>
          {content.features.subcopy ? <p>{content.features.subcopy}</p> : null}
        </div>

        <div className="features-grid">
          {cards.map((card, idx) => (
            <div key={`${card.title}-${idx}`} className="feature-card">
              <div className="feature-icon">{renderFeatureIcon(card.iconRef?.value || card.icon || String(idx))}</div>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderFeatureIcon(key: string) {
  const k = (key || "").toLowerCase();
  if (k.includes("search")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    );
  }
  if (k.includes("chat") || k.includes("forum") || k.includes("message")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

