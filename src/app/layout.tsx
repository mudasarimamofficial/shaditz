import type { Metadata } from "next";
import { DM_Sans, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { getHomepageContent } from "@/utils/homepageContent";
import { buildThemeCssVars } from "@/utils/themeCss";

const headingFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

const adminFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin",
  display: "swap",
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

function compactText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function escapeInlineRawText(value: string) {
  return value.replace(/<\/(script|style)/gi, "<\\/$1");
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomepageContent();
  const brand = compactText(content.shaditz?.footer?.logo) || compactText(content.header?.brandText) || "Shaditz";
  const promise = compactText(content.shaditz?.hero?.subtitle);
  const title = promise ? `${brand} | ${promise}` : brand;
  const description =
    compactText(content.shaditz?.hero?.subtitle) ||
    compactText(content.hero?.subcopy) ||
    compactText(content.application?.subcopy) ||
    "Shaditz is the portfolio of Shaher Yar, video editor.";
  const faviconHref =
    content.site?.favicon?.url ||
    "/favicon.png";

  return {
    metadataBase: new URL("https://shaditz.vercel.app"),
    title,
    description,
    icons: {
      icon: [{ url: faviconHref }],
      shortcut: [{ url: faviconHref }],
      apple: [{ url: faviconHref }],
    },
    openGraph: {
      title,
      description,
      url: "https://shaditz.vercel.app",
      siteName: brand,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getHomepageContent();
  const cssVars = buildThemeCssVars(content);
  const faviconHref =
    content.site?.favicon?.url ||
    "/favicon.png";
  const appleTouchHref = faviconHref;
  const customCss = content.site?.customCss?.trim() || "";
  const customJs = content.site?.customJs?.trim() || "";
  const customCssId = "cf-public-custom-css";
  const lower = faviconHref.toLowerCase();
  const type =
    lower.endsWith(".png")
      ? "image/png"
      : lower.endsWith(".svg")
        ? "image/svg+xml"
        : lower.endsWith(".ico")
          ? "image/x-icon"
          : undefined;
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable} ${adminFont.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href={faviconHref} type={type} sizes="any" />
        <link rel="shortcut icon" href={faviconHref} type={type} />
        <link rel="apple-touch-icon" href={appleTouchHref} />
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
        {customCss.length ? (
          <>
            <style
              id={customCssId}
              media="not all"
              dangerouslySetInnerHTML={{ __html: escapeInlineRawText(customCss) }}
            />
            <script
              dangerouslySetInnerHTML={{
                __html:
                  `;(() => { const el = document.getElementById(${JSON.stringify(customCssId)});` +
                  ` if (!el) return; if (location.pathname.startsWith("/admin") || location.pathname === "/") { el.remove(); return; } el.media = "all"; })();`,
              }}
            />
          </>
        ) : null}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-[#080808] text-[var(--cf-text)]">
        {children}
        {customJs.length ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `;(() => { if (location.pathname.startsWith("/admin") || location.pathname === "/") return;\n${escapeInlineRawText(customJs)}\n})();`,
            }}
          />
        ) : null}
      </body>
    </html>
  );
}
