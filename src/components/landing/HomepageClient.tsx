"use client";

import { useEffect, useState } from "react";
import type { HomepageContent } from "@/content/homepage";
import { homepageDefaults } from "@/content/homepage";
import { createBrowserSupabaseClient } from "@/utils/supabase/browserClient";
import { WhatsAppWidget } from "@/components/landing/WhatsAppWidget";
import { applyBuilderOverrides } from "@/utils/homepageBuilder";
import { sanitizeContentStrings } from "@/utils/textSanitize";
import { SectionErrorBoundary } from "@/components/landing/SectionErrorBoundary";
import { SectionWrapper } from "@/components/landing/SectionWrapper";
import { SECTION_REGISTRY, type PageSection } from "@/components/landing/sectionRegistry";
import { Header } from "@/components/landing/Header";
import { mergePageSectionsWithDefaults } from "@/utils/homepageSections";
import { neutralizeLegacyProofContent } from "@/utils/homepageMerge";
import { buildThemeCssVars } from "@/utils/themeCss";
import { mergeTypographyScale } from "@/utils/typographyScale";
import { RebuiltLandingFrame } from "@/components/landing/RebuiltLandingFrame";

type Props = {
  initialContent: HomepageContent;
  isBuilderPreview?: boolean;
  templateHtml?: string;
  initialPreviewDevice?: "desktop" | "tablet" | "mobile";
};

export function HomepageClient({ initialContent, isBuilderPreview, templateHtml, initialPreviewDevice }: Props) {
  const [content, setContent] = useState<HomepageContent>(() => mergeClientContent(initialContent));
  const [hasPreviewOverride, setHasPreviewOverride] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">(initialPreviewDevice || "desktop");

  useEffect(() => {
    if (isBuilderPreview) return;
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel("homepage_content_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homepage_content", filter: "id=eq.1" },
        async () => {
          const { data } = await supabase
            .from("homepage_content")
            .select("content")
            .eq("id", 1)
            .maybeSingle();
          if (data?.content) setContent(mergeClientContent(data.content as HomepageContent));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isBuilderPreview]);

  useEffect(() => {
    if (!isBuilderPreview) return;
    const device = new URLSearchParams(window.location.search).get("device");
    const d = device === "mobile" || device === "tablet" || device === "desktop" ? device : initialPreviewDevice || "desktop";
    document.documentElement.dataset.device = d;
    setPreviewDevice(d);
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data as any;
      if (!data || data.type !== "shaditz_builder_preview") return;
      if (!data.content) return;
      setHasPreviewOverride(true);
      setContent(mergeClientContent(data.content as HomepageContent));
    }
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [initialPreviewDevice, isBuilderPreview]);

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px" },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [content, isBuilderPreview]);

  const resolved = applyBuilderOverrides(sanitizeContentStrings(content));
  const liveThemeCss = isBuilderPreview ? buildThemeCssVars(resolved) : "";

  const sections: PageSection[] = resolved.page?.sections?.length
    ? (resolved.page.sections as PageSection[])
    : ([
        { id: "hero", type: "hero", enabled: true },
        { id: "features", type: "features", enabled: true },
        { id: "workflow", type: "workflow", enabled: true },
        { id: "pricing", type: "pricing", enabled: true },
        { id: "audit-bridge", type: "audit_bridge", enabled: true },
        { id: "application", type: "application", enabled: true },
        { id: "footer", type: "footer", enabled: true },
      ] as PageSection[]);

  const preset = ((resolved.site as any)?.designPreset as string | undefined) || "landing_html_v1";
  const useLanding = preset !== "classic";
  const shouldUseRebuiltTemplate = useLanding;

  if (shouldUseRebuiltTemplate) {
    return (
      <div className="flex flex-1 flex-col">
        <RebuiltLandingFrame
          content={resolved}
          templateHtml={templateHtml}
          device={isBuilderPreview ? previewDevice : "desktop"}
        />
        <WhatsAppWidget content={resolved} />
        {isBuilderPreview && !hasPreviewOverride ? (
          <div className="fixed bottom-4 left-4 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/50 dark:text-slate-200">
            Waiting for builder preview…
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`${useLanding ? "cf-landing" : ""} flex flex-1 flex-col`}>
      {isBuilderPreview ? <style id="cf-live-theme-vars" dangerouslySetInnerHTML={{ __html: liveThemeCss }} /> : null}
      {sections.find((s) => s.type === "hero")?.enabled !== false ? <Header content={resolved} /> : null}
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

function mergeClientContent(c: Partial<HomepageContent> | null): HomepageContent {
  if (!c) return homepageDefaults;

  const mergeScale = (base: any, extra: any) => {
    return mergeTypographyScale(extra, mergeTypographyScale(base));
  };

  const mergeTheme = (base: any, extra: any) => {
    const b = base || homepageDefaults.site.theme;
    const e = extra || {};
    return {
      ...b,
      ...e,
      colors: { ...(b?.colors || {}), ...(e.colors || {}) },
      typography: {
        ...(b?.typography || {}),
        ...(e.typography || {}),
        scale: mergeScale(b?.typography?.scale, e.typography?.scale),
      },
    };
  };

  const mergeBranding = (base: any, extra: any) => {
    const b = base || homepageDefaults.branding;
    const e = extra || {};
    return {
      ...b,
      ...e,
      colors: { ...(b?.colors || {}), ...(e.colors || {}) },
      typography: {
        ...(b?.typography || {}),
        ...(e.typography || {}),
        scale: mergeScale(b?.typography?.scale, e.typography?.scale),
      },
    };
  };

  const mergeSocialLinksV2 = (
    base: HomepageContent["socialLinksV2"] | undefined,
    extra: HomepageContent["socialLinksV2"] | undefined,
  ) => {
    const b = Array.isArray(base) ? base : [];
    const e = Array.isArray(extra) ? extra : [];
    const byId = new Map<string, any>();
    for (const item of e) {
      const id = String((item as any)?.id || "").trim();
      if (!id) continue;
      byId.set(id, item);
    }
    const out: any[] = [];
    for (const preset of b) {
      const id = String((preset as any)?.id || "").trim();
      const override = id ? byId.get(id) : null;
      out.push(override ? { ...(preset as any), ...(override as any) } : preset);
      if (id) byId.delete(id);
    }
    for (const rest of byId.values()) out.push(rest);
    return out as HomepageContent["socialLinksV2"];
  };

  return neutralizeLegacyProofContent(sanitizeContentStrings({
    ...homepageDefaults,
    ...c,
    site: {
      ...homepageDefaults.site,
      ...(c.site || {}),
      theme: mergeTheme(homepageDefaults.site.theme, (c.site as any)?.theme),
    },
    branding: mergeBranding(homepageDefaults.branding, (c as any).branding),
    header: {
      ...homepageDefaults.header,
      ...(c.header || {}),
      brandIcon: { ...homepageDefaults.header.brandIcon, ...(c.header?.brandIcon || {}) },
      primaryCta: { ...homepageDefaults.header.primaryCta, ...(c.header?.primaryCta || {}) },
      nav: (c.header?.nav as any) || homepageDefaults.header.nav,
    },
    hero: {
      ...homepageDefaults.hero,
      ...(c.hero || {}),
      badge: { ...homepageDefaults.hero.badge, ...(c.hero?.badge || {}) },
      heading: { ...homepageDefaults.hero.heading, ...(c.hero?.heading || {}) },
      primaryCta: { ...homepageDefaults.hero.primaryCta, ...(c.hero?.primaryCta || {}) },
      secondaryCta: { ...homepageDefaults.hero.secondaryCta, ...(c.hero?.secondaryCta || {}) },
      proof: {
        ...(homepageDefaults.hero.proof || { title: "", eyebrow: "", avatars: [] }),
        ...((c.hero as any)?.proof || {}),
        avatars: (c.hero as any)?.proof?.avatars || homepageDefaults.hero.proof?.avatars || [],
      },
      metrics: (c.hero as any)?.metrics || (homepageDefaults.hero as any).metrics,
      revenueVisual: {
        ...(homepageDefaults.hero.revenueVisual || { value: "", label: "" }),
        ...((c.hero as any)?.revenueVisual || {}),
      },
      backgroundImage: (c.hero as any)?.backgroundImage || homepageDefaults.hero.backgroundImage,
    },
    trust: {
      ...homepageDefaults.trust,
      ...(c.trust || {}),
      icons: c.trust?.icons || homepageDefaults.trust.icons,
    },
    features: {
      ...homepageDefaults.features,
      ...(c.features || {}),
      cards: c.features?.cards || homepageDefaults.features.cards,
      backgroundImage: c.features?.backgroundImage || homepageDefaults.features.backgroundImage,
    },
    workflow: {
      ...homepageDefaults.workflow,
      ...(c.workflow || {}),
      steps: c.workflow?.steps || homepageDefaults.workflow.steps,
      backgroundImage: c.workflow?.backgroundImage || homepageDefaults.workflow.backgroundImage,
    },
    pricing: {
      ...homepageDefaults.pricing,
      ...(c.pricing || {}),
      tiers: c.pricing?.tiers || homepageDefaults.pricing.tiers,
      backgroundImage: c.pricing?.backgroundImage || homepageDefaults.pricing.backgroundImage,
    },
    application: {
      ...homepageDefaults.application,
      ...(c.application || {}),
      fields: {
        ...homepageDefaults.application.fields,
        ...(c.application?.fields || {}),
        revenueOptions: c.application?.fields?.revenueOptions || homepageDefaults.application.fields.revenueOptions,
      },
      backgroundImage: c.application?.backgroundImage || homepageDefaults.application.backgroundImage,
    },
    footer: {
      ...homepageDefaults.footer,
      ...(c.footer || {}),
      brandIcon: { ...homepageDefaults.footer.brandIcon, ...(c.footer?.brandIcon || {}) },
      links: c.footer?.links || homepageDefaults.footer.links,
    },
    page: {
      sections: mergePageSectionsWithDefaults((c.page as any)?.sections),
    },
    customSections: (c as any).customSections || homepageDefaults.customSections,
    socialLinks: (c as any).socialLinks || homepageDefaults.socialLinks,
    socialLinksV2: mergeSocialLinksV2(homepageDefaults.socialLinksV2, (c as any).socialLinksV2),
    whatsapp: {
      ...(homepageDefaults.whatsapp as any),
      ...((c as any).whatsapp || {}),
    },
    rebuilt: {
      ...(homepageDefaults.rebuilt || {}),
      ...(((c as any).rebuilt as any) || {}),
      hero: {
        ...((homepageDefaults.rebuilt as any)?.hero || {}),
        ...(((c as any).rebuilt as any)?.hero || {}),
      },
      trustStrip: {
        ...((homepageDefaults.rebuilt as any)?.trustStrip || {}),
        ...(((c as any).rebuilt as any)?.trustStrip || {}),
      },
      founder: {
        ...((homepageDefaults.rebuilt as any)?.founder || {}),
        ...(((c as any).rebuilt as any)?.founder || {}),
      },
      promise: {
        ...((homepageDefaults.rebuilt as any)?.promise || {}),
        ...(((c as any).rebuilt as any)?.promise || {}),
        cards:
          (((c as any).rebuilt as any)?.promise?.cards as any) ||
          ((homepageDefaults.rebuilt as any)?.promise?.cards as any) ||
          [],
      },
      how: {
        ...((homepageDefaults.rebuilt as any)?.how || {}),
        ...(((c as any).rebuilt as any)?.how || {}),
        steps:
          (((c as any).rebuilt as any)?.how?.steps as any) ||
          ((homepageDefaults.rebuilt as any)?.how?.steps as any) ||
          [],
      },
      honest: {
        ...((homepageDefaults.rebuilt as any)?.honest || {}),
        ...(((c as any).rebuilt as any)?.honest || {}),
        pledgeItems:
          (((c as any).rebuilt as any)?.honest?.pledgeItems as any) ||
          ((homepageDefaults.rebuilt as any)?.honest?.pledgeItems as any) ||
          [],
      },
    },
  }));
}
