import type { HomepageContent } from "@/content/homepage";
import type { PageSection } from "@/components/landing/sectionRegistry";

type Props = {
  content: HomepageContent;
  section?: PageSection;
};

function safePricingNote(value: string) {
  if (/onboarding\s+\d+\s+new coaches/i.test(value)) {
    return "Applications are reviewed for fit before onboarding begins.";
  }
  return value;
}

function safeTierTagline(name: string, value: string) {
  if (/predictable\s+\$?\d+k\+?\s+months/i.test(value)) {
    return "For coaches ready to scale beyond ad hoc lead flow.";
  }
  return value || `For ${name.toLowerCase()} partnership fit.`;
}

function safeTierOutcome(name: string, value: string) {
  if (!/expected\s+\d|expected\s+.*booked|expected\s+.*qualified|\d+\+\s+calls/i.test(value)) return value;
  const key = name.toLowerCase();
  if (key.includes("starter")) return "Built to establish a consistent qualified-conversation workflow.";
  if (key.includes("growth")) return "Built to scale multi-channel booked-call delivery with weekly optimization.";
  if (key.includes("scale")) return "Built for full pipeline visibility and priority optimization.";
  return "Built around qualified conversations, follow-up discipline, and pipeline visibility.";
}

export function Pricing({ content, section }: Props) {
  const label = (section?.settings as any)?.label || (content.pricing as any).label || "";
  const pricingNote = safePricingNote(content.pricing.note || "");
  return (
    <section id="pricing">
      <div className="container">
        <div className="section-intro">
          {label ? <div className="label-tag">{label}</div> : null}
          <h2>{content.pricing.heading}</h2>
          {content.pricing.subcopy.trim().length ? <p>{content.pricing.subcopy}</p> : null}
        </div>

        <div className="pricing-grid">
          {content.pricing.tiers.map((t: any, idx: number) => (
            <div key={`${t.name}-${idx}`} className={`pricing-card ${t.highlight ? "featured" : ""}`.trim()}>
              {t.highlight?.badge ? <div className="popular-badge">{t.highlight.badge}</div> : null}

              <div className="tier-name">{t.name}</div>
              {t.tagline ? <div className="tier-desc">{safeTierTagline(String(t.name || ""), String(t.tagline || ""))}</div> : null}

              <div className="tier-price">
                {t.price}
                {t.priceSuffix ? <span>{t.priceSuffix}</span> : null}
              </div>

              {t.outcome ? <div className="tier-outcome">{safeTierOutcome(String(t.name || ""), String(t.outcome || ""))}</div> : null}

              <ul className="tier-features">
                {(t.bullets || []).map((b: string) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <a
                href={t.ctaHref}
                className={t.highlight ? "btn-primary" : "pricing-secondary-cta"}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {t.ctaText}
              </a>
            </div>
          ))}
        </div>

        {pricingNote.trim().length ? (
          <div className="pricing-note">{pricingNote}</div>
        ) : null}
      </div>
    </section>
  );
}
