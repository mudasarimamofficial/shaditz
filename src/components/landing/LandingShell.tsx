// @memory: de-iframe migration (docs/DE_IFRAME_MIGRATION_PLAN.md)
// Server component: renders the de-iframed landing inline so the populated
// content lives in the crawlable top-level document (SEO/GEO). Falls back to
// null when the template can't be rendered (caller then uses the iframe path).

import type { ReactNode, ReactElement } from "react";
import type { HomepageContent } from "@/content/homepage";
import { renderShaditzLanding } from "@/utils/landing/renderShaditzLanding";
import { LandingInteractivity } from "@/components/landing/LandingInteractivity";
import { WhatsAppWidget } from "@/components/landing/WhatsAppWidget";

function escapeInlineRawText(value: string) {
  return value.replace(/<\/(script|style)/gi, "<\\/$1");
}

export function LandingShell({
  content,
  templateHtml,
  fallback = null,
}: {
  content: HomepageContent;
  templateHtml: string;
  fallback?: ReactNode;
}): ReactElement {
  const rendered = renderShaditzLanding(templateHtml, content);
  if (!rendered) return <>{fallback}</>;

  const customCss = (content.site?.customCss || "").trim();
  const customJs = (content.site?.customJs || "").trim();
  const contact = content.shaditz?.contact;

  return (
    <>
      {rendered.fontHref ? <link rel="stylesheet" href={rendered.fontHref} /> : null}
      <style dangerouslySetInnerHTML={{ __html: rendered.styleHtml }} />
      {customCss ? <style dangerouslySetInnerHTML={{ __html: escapeInlineRawText(customCss) }} /> : null}
      <main
        className="shaditz-landing"
        style={{ color: "var(--white)", fontFamily: "'Cormorant Garamond', serif", minHeight: "100vh" }}
        dangerouslySetInnerHTML={{ __html: rendered.bodyHtml }}
      />
      <LandingInteractivity
        contact={
          contact
            ? {
                loadingText: contact.loadingText,
                successText: contact.successText,
                errorText: contact.errorText,
                submitText: contact.submitText,
              }
            : undefined
        }
      />
      {content.whatsapp?.enabled ? <WhatsAppWidget content={content} /> : null}
      {customJs ? (
        <script
          dangerouslySetInnerHTML={{ __html: `(function(){\n${escapeInlineRawText(customJs)}\n})();` }}
        />
      ) : null}
    </>
  );
}
