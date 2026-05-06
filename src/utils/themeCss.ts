import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import { buildTypographyScaleCss, defaultTypographyScale } from "@/utils/typographyScale";

function pickCssFont(value: unknown, fallback: string) {
  const v = typeof value === "string" ? value.trim() : "";
  return v.length ? v : fallback;
}

function themeDefaults() {
  return {
    enabled: false,
    colors: homepageDefaults.site.theme?.colors || homepageDefaults.branding?.colors || {
      primary: "#C9982A",
      secondary: "#0F1629",
      accent: "#E8B84B",
      background: "#0A0F1E",
      text: "#FFFFFF",
      surface: "#141D35",
      border: "rgba(255,255,255,0.07)",
    },
    typography: {
      headingFont: homepageDefaults.site.theme?.typography?.headingFont || "var(--font-heading)",
      bodyFont: homepageDefaults.site.theme?.typography?.bodyFont || "var(--font-body)",
      scale: homepageDefaults.site.theme?.typography?.scale || defaultTypographyScale,
    },
  };
}

export function buildThemeCssVars(content: Partial<HomepageContent> | null | undefined) {
  const defaults = themeDefaults();
  const branding = content?.branding || defaults;
  const enabled = Boolean(branding.enabled ?? content?.site?.theme?.enabled);
  const source = enabled
    ? {
        colors: {
          ...defaults.colors,
          ...(branding.colors || {}),
        },
        typography: {
          ...defaults.typography,
          ...(branding.typography || {}),
        },
      }
    : defaults;

  const colors = source.colors;
  const typography = source.typography;
  const palette = {
    navy: (colors as any).navy || colors.background,
    navy2: (colors as any).navy2 || colors.secondary,
    navy3: (colors as any).navy3 || colors.surface,
    navy4: (colors as any).navy4 || "#1A2444",
    white: (colors as any).white || colors.text,
    muted: (colors as any).muted || "#8A8F9E",
    off: (colors as any).off || "#F0EDE6",
    gold: (colors as any).gold || colors.primary,
    gold2: (colors as any).gold2 || colors.accent,
    gold3: (colors as any).gold3 || "#F5CC6E",
    borderGold: (colors as any).borderGold || "rgba(201,152,42,0.18)",
    border2: (colors as any).border2 || colors.border,
  };
  const scale =
    ((content?.site as any)?.theme?.typography?.scale as any) ||
    ((content?.branding as any)?.typography?.scale as any) ||
    typography.scale ||
    defaultTypographyScale;

  return (
    `:root{--cf-primary:${colors.primary};--cf-secondary:${colors.secondary};--cf-accent:${colors.accent};--cf-bg:${colors.background};--cf-text:${colors.text};--cf-surface:${colors.surface};--cf-border:${colors.border};--cf-font-heading:${pickCssFont(typography.headingFont, defaults.typography.headingFont)};--cf-font-body:${pickCssFont(typography.bodyFont, defaults.typography.bodyFont)};--cf-navy:${palette.navy};--cf-navy2:${palette.navy2};--cf-navy3:${palette.navy3};--cf-navy4:${palette.navy4};--cf-white:${palette.white};--cf-muted:${palette.muted};--cf-off:${palette.off};--cf-gold:${palette.gold};--cf-gold2:${palette.gold2};--cf-gold3:${palette.gold3};--cf-border-gold:${palette.borderGold};--cf-border2:${palette.border2};--color-primary:${colors.primary};--color-secondary:${colors.secondary};--color-accent:${colors.accent};--color-background:${colors.background};--color-text:${colors.text};--color-surface:${colors.surface};--color-border:${colors.border};}` +
    buildTypographyScaleCss(scale)
  );
}
