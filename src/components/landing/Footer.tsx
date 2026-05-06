import type { HomepageContent } from "@/content/homepage";
import type { PageSection } from "@/components/landing/sectionRegistry";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import Image from "next/image";

type Props = {
  content: HomepageContent;
  section?: PageSection;
};

export function Footer({ content, section }: Props) {
  const showSocial = (section?.settings as any)?.showSocial === true;
  const socialV2 = (content.socialLinksV2 || []).filter((s) => s.enabled && s.url && s.url.trim().length);
  const socialLegacy = (content.socialLinks || []).filter((s) => s.href && s.href.trim().length);
  const icon = content.footer.brandIcon;
  const iconUrl = icon?.type === "image" ? (icon.url || "") : "";
  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <div className="footer-logo">
            {iconUrl ? <Image className="logo-img" src={iconUrl} alt="Shaditz" width={32} height={32} unoptimized /> : null}
            {renderBrandText(content.footer.brandText)}
          </div>

          <div className="footer-links">
            {content.footer.links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>

          {showSocial && (socialV2.length || socialLegacy.length) ? (
            <div className="footer-socials" aria-label="Social links">
              {socialV2.map((s) => (
                <a key={s.id} className="footer-social" href={s.url} target="_blank" rel="noreferrer" aria-label={s.platform}>
                  <DynamicIcon
                    icon={s.icon || { type: "library", value: s.platform } as any}
                    className="footer-social-icon"
                  />
                  <span className="cf-visually-hidden">{s.platform}</span>
                </a>
              ))}
              {socialLegacy.map((s, idx) => (
                <a key={`${s.href}-${idx}`} className="footer-social" href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
                  {s.icon?.type === "image" && s.icon.url ? (
                    <Image className="footer-social-icon" src={s.icon.url} alt="" width={20} height={20} unoptimized />
                  ) : s.icon?.type === "material" && s.icon.name ? (
                    <MaterialIcon name={s.icon.name} className="footer-social-icon" aria-hidden="true" />
                  ) : (
                    <span className="footer-social-text">{s.label}</span>
                  )}
                </a>
              ))}
            </div>
          ) : null}

          <div className="footer-copy">{content.footer.copyright}</div>
        </div>
      </div>
    </footer>
  );
}

function renderBrandText(text: string) {
  const parts = text.split(" ");
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    const rest = parts.slice(0, -1).join(" ");
    return (
      <>
        {rest} <span>{last}</span>
      </>
    );
  }
  return text;
}
