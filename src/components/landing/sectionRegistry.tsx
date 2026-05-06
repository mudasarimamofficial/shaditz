import type { ReactNode } from "react";
import type { HomepageContent } from "@/content/homepage";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { LeadFormSection } from "@/components/landing/LeadFormSection";
import { Pricing } from "@/components/landing/Pricing";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { Trust } from "@/components/landing/Trust";
import { Workflow } from "@/components/landing/Workflow";
import { CustomHtmlSection } from "@/components/landing/CustomHtmlSection";
import { AuditBridgeSection } from "@/components/landing/AuditBridgeSection";
import { renderRichTextFromSectionSettings } from "@/components/landing/RichTextSection";

export type PageSection = NonNullable<HomepageContent["page"]>["sections"][number];

export const SECTION_REGISTRY: Record<
  PageSection["type"],
  (args: { content: HomepageContent; section: PageSection }) => ReactNode
> = {
  hero: ({ content, section }) => <Hero content={content} section={section} />,
  trust_strip: () => null,
  founder: () => null,
  promise: () => null,
  how: () => null,
  honest: () => null,
  trust: ({ content }) => <Trust content={content} />,
  features: ({ content, section }) => <Features content={content} section={section} />,
  workflow: ({ content, section }) => <Workflow content={content} section={section} />,
  pricing: ({ content, section }) => <Pricing content={content} section={section} />,
  audit_bridge: ({ content, section }) => <AuditBridgeSection content={content} section={section} />,
  application: ({ content, section }) => <LeadFormSection content={content} section={section} />,
  footer: ({ content, section }) => <Footer content={content} section={section} />,
  testimonials: ({ section }) => <TestimonialsSection section={section} />,
  custom_html: ({ section }) => <CustomHtmlSection section={section} />,
  rich_text: ({ section }) => renderRichTextFromSectionSettings((section.settings as any) || null),
  custom: ({ content, section }) => {
    const cs = (content.customSections || []).find((c) => c.id === section.id);
    if (!cs || !cs.enabled) return null;
    const srcDoc = `<!doctype html><html><head><meta charset="utf-8" /><style>${cs.css || ""}</style></head><body>${cs.html || ""}<script>${cs.js || ""}</script></body></html>`;
    return (
      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <iframe
          title={section.id}
          sandbox="allow-scripts"
          className="w-full rounded-2xl border border-[var(--cf-border)] bg-[var(--cf-surface)]"
          style={{ minHeight: 240 }}
          srcDoc={srcDoc}
        />
      </section>
    );
  },
};

