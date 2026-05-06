"use client";

import { useEffect, useRef, useState } from "react";
import type { HomepageContent } from "@/content/homepage";
import Image from "next/image";

type NavItem = { label: string; href: string; enabled?: boolean };

type Props = {
  content: HomepageContent;
};

export function Header({ content }: Props) {
  const rawNavLinks = (content.header as any).navLinks;
  const rawNav = Array.isArray(rawNavLinks)
    ? rawNavLinks
    : Array.isArray((content.header as any).nav)
      ? (content.header as any).nav
      : [];
  const navItems: NavItem[] = rawNav
    .map((item: unknown) => {
      if (!item || typeof item !== "object") return null;
      const nav = item as Partial<NavItem>;
      const label = typeof nav.label === "string" ? nav.label : "";
      const href = typeof nav.href === "string" ? nav.href : "";
      if (!label.trim() || !href.trim()) return null;
      return { label, href, enabled: nav.enabled };
    })
    .filter(Boolean) as NavItem[];
  const rawPrimaryCta = (content.header as any).primaryCta;
  const primaryCta = rawPrimaryCta && typeof rawPrimaryCta === "object" ? rawPrimaryCta : null;
  const ctaEnabled = primaryCta ? (primaryCta.enabled ?? true) : false;
  const ctaHref = primaryCta ? (primaryCta.href as string) : "#";
  const ctaLabel = primaryCta ? ((primaryCta.label as string) || (primaryCta.text as string) || "") : "";
  const enabledNavItems = navItems.filter((x) => x.enabled !== false);
  const icon = content.header.brandIcon;
  const iconUrl = icon?.type === "image" ? (icon.url || "") : "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prevActive = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      prevActive?.focus?.();
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
      if (e.key !== "Tab") return;

      const root = sheetRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first) {
          e.preventDefault();
          last.focus();
        }
        return;
      }
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <header className="site-header">
        <nav className={isScrolled ? "is-scrolled" : ""} aria-label="Primary navigation">
          <div className="nav-inner">
            <a href="#" className="nav-logo">
              {iconUrl ? (
                <Image className="logo-img" src={iconUrl} alt="Shaditz" width={32} height={32} unoptimized />
              ) : (
                <div className="logo-dot" />
              )}
              {renderBrandText(content.header.brandText)}
            </a>

            <ul className="nav-links">
              {enabledNavItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>

            <div className="nav-right">
              {ctaEnabled ? (
                <a href={ctaHref} className="btn-primary nav-cta">
                  {ctaLabel}
                </a>
              ) : null}

              <button
                type="button"
                className={`nav-mobile nav-toggle ${mobileOpen ? "is-open" : ""}`}
                aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileOpen}
                aria-controls="cf-mobile-nav"
                onClick={() => setMobileOpen((v) => !v)}
              >
                <span className="nav-toggle-bars" aria-hidden="true" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div id="cf-mobile-nav" className={`nav-sheet ${mobileOpen ? "is-open" : ""}`} aria-hidden={!mobileOpen}>
        <div className="nav-sheet-backdrop" onClick={() => setMobileOpen(false)} />
        <div ref={sheetRef} className="nav-sheet-panel" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="nav-sheet-top">
            <div className="nav-sheet-brand">
              {iconUrl ? (
                <Image className="logo-img" src={iconUrl} alt="Shaditz" width={32} height={32} unoptimized />
              ) : (
                <div className="logo-dot" />
              )}
              <div className="nav-sheet-brand-text">{renderBrandText(content.header.brandText)}</div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              className="nav-sheet-close"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <ul className="nav-sheet-links">
            {enabledNavItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setMobileOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {ctaEnabled ? (
            <a href={ctaHref} className="btn-primary nav-sheet-cta" onClick={() => setMobileOpen(false)}>
              {ctaLabel}
            </a>
          ) : null}
        </div>
      </div>
    </>
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
