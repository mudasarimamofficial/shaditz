import type { HomepageContent } from "@/content/homepage";
import type { PageSection } from "@/components/landing/sectionRegistry";

type Props = {
  content: HomepageContent;
  section: PageSection;
};

export function AuditBridgeSection({ section }: Props) {
  const s = (section.settings || {}) as any;
  const heading = String(s.heading || "");
  const subcopy = String(s.subcopy || "");
  const ctaText = String(s.ctaText || "");
  const ctaHref = String(s.ctaHref || "#lead-form");

  return (
    <section id="audit-bridge">
      <div className="audit-bg" aria-hidden="true" />
      <div className="container">
        <div className="audit-inner" data-reveal="up">
          <div className="audit-text">
            {heading ? <h3>{heading}</h3> : null}
            {subcopy ? <p>{subcopy}</p> : null}
          </div>
          {ctaText ? (
            <a href={ctaHref} className="btn-ghost">
              {ctaText}
              <svg className="arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
