"use client";

import { useEffect, useState } from "react";
import type { HomepageContent } from "@/content/homepage";
import { WhatsAppWidget } from "@/components/landing/WhatsAppWidget";
import { applyBuilderOverrides } from "@/utils/homepageBuilder";
import { SectionErrorBoundary } from "@/components/landing/SectionErrorBoundary";
import { SectionWrapper } from "@/components/landing/SectionWrapper";
import { SECTION_REGISTRY, type PageSection } from "@/components/landing/sectionRegistry";
import { Header } from "@/components/landing/Header";
import { buildThemeCssVars } from "@/utils/themeCss";

export type CmsPageContent = {
  sections: PageSection[];
};

type Props = {
  globalContent: HomepageContent;
  initialPage: CmsPageContent;
  isBuilderPreview?: boolean;
};

export function CmsPageClient({ globalContent, initialPage, isBuilderPreview }: Props) {
  const [page, setPage] = useState<CmsPageContent>(initialPage);
  const [hasPreviewOverride, setHasPreviewOverride] = useState(false);

  useEffect(() => {
    if (!isBuilderPreview) return;
    const device = new URLSearchParams(window.location.search).get("device");
    const d = device === "mobile" || device === "tablet" || device === "desktop" ? device : "desktop";
    document.documentElement.dataset.device = d;
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data as any;
      if (!data || data.type !== "shaditz_page_builder_preview") return;
      if (!data.page || !Array.isArray(data.page.sections)) return;
      setHasPreviewOverride(true);
      setPage({ sections: data.page.sections as PageSection[] });
    }
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [isBuilderPreview]);

  const resolved = applyBuilderOverrides(globalContent);
  const liveThemeCss = isBuilderPreview ? buildThemeCssVars(resolved) : "";
  const sections = page.sections || [];
  const preset = ((resolved.site as any)?.designPreset as string | undefined) || "landing_html_v1";
  const useLanding = preset !== "classic";

  return (
    <div className={`${useLanding ? "cf-landing" : ""} flex flex-1 flex-col`}>
      {isBuilderPreview ? <style id="cf-live-theme-vars" dangerouslySetInnerHTML={{ __html: liveThemeCss }} /> : null}
      <Header content={resolved} />
      <main className="flex-1">
        {sections
          .filter((s) => s.enabled)
          .map((s) => {
            const render = SECTION_REGISTRY[s.type];
            if (!render) return null;
            const node = render({ content: resolved, section: s });
            if (!node) return null;
            return (
              <SectionErrorBoundary key={s.id} label={s.type}>
                <SectionWrapper settings={(s.settings as any) || null}>{node}</SectionWrapper>
              </SectionErrorBoundary>
            );
          })}
      </main>
      <WhatsAppWidget content={resolved} />
      {isBuilderPreview && !hasPreviewOverride ? (
        <div className="fixed bottom-4 left-4 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/50 dark:text-slate-200">
          Waiting for builder preview…
        </div>
      ) : null}
    </div>
  );
}
