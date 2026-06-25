// @memory: T-001 (architecture), de-iframe migration (docs/DE_IFRAME_MIGRATION_PLAN.md)
//
// Server-side port of the iframe `bootstrap` content pipeline from
// RebuiltLandingFrame.tsx. Runs the SAME DOM transform against a linkedom
// document so the populated landing HTML is produced on the server and lands
// in the crawlable top-level document (SEO/GEO fix, audit #18).
//
// Scope: content + background + order/visibility ONLY. Interactive bindings
// (cursor, scroll-reveal, contact submit, hamburger) live in the client
// component LandingInteractivity.tsx — they are NOT run here.

import { parseHTML } from "linkedom";
import type { HomepageContent } from "@/content/homepage";

const BASE_URL = "https://shaditz.vercel.app/";

type AnyDoc = ReturnType<typeof parseHTML>["document"];

export type RenderedLanding = {
  styleHtml: string;
  fontHref: string;
  bodyHtml: string;
};

export function renderShaditzLanding(templateHtml: string, content: HomepageContent): RenderedLanding | null {
  if (!templateHtml || !templateHtml.trim()) return null;

  const { document } = parseHTML(templateHtml);

  // ---- helpers (ported from the iframe bootstrap) ----
  const q = (sel: string) => document.querySelector(sel);
  const qa = (sel: string) => Array.prototype.slice.call(document.querySelectorAll(sel)) as any[];
  const text = (v: unknown) => (typeof v === "string" ? v : "");
  const arr = (v: unknown) => (Array.isArray(v) ? v : []);
  const esc = (v: unknown) =>
    String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const setText = (el: any, value: unknown) => {
    if (el) el.textContent = text(value);
  };
  const setTitle = (el: any, value: unknown) => {
    if (el) el.innerHTML = esc(text(value)).replace(/\n/g, "<br>");
  };
  const setHref = (el: any, href: unknown) => {
    if (el && text(href)) el.setAttribute("href", text(href));
  };
  const setTargetBlank = (el: any, enabled: boolean) => {
    if (!el) return;
    if (enabled) el.setAttribute("target", "_blank");
    else el.removeAttribute("target");
  };
  const ensureHref = (el: any, href: unknown) => {
    if (!el) return;
    if (text(href)) el.setAttribute("href", text(href));
    else el.removeAttribute("href");
  };
  const waDigits = (value: unknown) => text(value).replace(/[^0-9]/g, "");
  const buildWaHref = (number: unknown, message: unknown) => {
    const digits = waDigits(number);
    if (!digits) return "";
    const msg = text(message || "").trim();
    const base = "https://wa.me/" + digits;
    return msg ? base + "?text=" + encodeURIComponent(msg) : base;
  };
  const sectionByType = (c: any, type: string) => {
    const sections = c && c.page && Array.isArray(c.page.sections) ? c.page.sections : [];
    for (let i = 0; i < sections.length; i++) {
      if (sections[i] && sections[i].type === type) return sections[i];
    }
    return null;
  };
  const sectionSelector = (type: string) =>
    (({
      loader: "#loader",
      nav: "nav",
      whatsapp: ".wa-float",
      hero: "#home",
      marquee: "#marquee, .marquee-section",
      about: "#about",
      showreel: "#reel",
      services: "#services",
      portfolio: "#work",
      process: "#process",
      reviews: "#reviews",
      testimonials: "#reviews",
      tools: "#tools, .tools-section",
      contact: "#contact",
      footer: "footer",
    } as Record<string, string>)[type] || "");
  const settings = (c: any, type: string) => {
    const section = sectionByType(c, type);
    return section && section.settings && typeof section.settings === "object" ? section.settings : {};
  };
  const imageFrom = (cfg: any) => {
    if (!cfg || typeof cfg !== "object") return "";
    if (typeof cfg.backgroundImage === "string") return cfg.backgroundImage;
    if (cfg.background && typeof cfg.background.url === "string") return cfg.background.url;
    return "";
  };
  const applyBackground = (c: any, type: string) => {
    if (type === "nav" || type === "footer") return;
    const el = q(sectionSelector(type)) as any;
    if (!el) return;
    const cfg = settings(c, type);
    const backgroundType = text(cfg.backgroundType);
    const img = imageFrom(cfg);
    const overlay = text(cfg.overlayColor);
    const color = text(cfg.backgroundColor || cfg.backgroundColorHex);
    el.style.position = el.style.position || "relative";
    if (backgroundType === "image" && img) {
      const layer = overlay ? "linear-gradient(" + overlay + "," + overlay + "), " : "";
      el.style.backgroundImage = layer + "url(" + img + ")";
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      el.style.backgroundRepeat = "no-repeat";
    } else if (backgroundType === "color" && color) {
      el.style.backgroundImage = "";
      el.style.backgroundColor = color;
    } else {
      el.style.backgroundImage = "";
    }
  };
  const toEmbedUrl = (url: unknown) => {
    const raw = text(url).trim();
    if (!raw) return "";
    try {
      const u = new URL(raw, BASE_URL);
      if (u.hostname.indexOf("youtu.be") !== -1) {
        const id = u.pathname.replace(/^\//, "");
        return id ? "https://www.youtube.com/embed/" + encodeURIComponent(id) : raw;
      }
      if (u.hostname.indexOf("youtube.com") !== -1) {
        const v = u.searchParams.get("v");
        if (v) return "https://www.youtube.com/embed/" + encodeURIComponent(v);
        if (u.pathname.indexOf("/shorts/") === 0)
          return "https://www.youtube.com/embed/" + encodeURIComponent(u.pathname.split("/")[2] || "");
      }
      if (u.hostname.indexOf("vimeo.com") !== -1) {
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts[0]) return "https://player.vimeo.com/video/" + encodeURIComponent(parts[0]);
      }
    } catch {
      /* noop */
    }
    return raw;
  };

  const lucideToSvg: Record<string, string> = LUCIDE_TO_SVG;
  const iconHtml = (iconName: unknown) => {
    let key = String(iconName || "").trim().toLowerCase();
    const map: Record<string, string> = {
      "🎬": "film", "🎞️": "film", video: "film", film: "film",
      "✨": "sparkles", sparkles: "sparkles",
      "🚀": "send", send: "send",
      "💎": "palette", "🎨": "palette", palette: "palette",
      "🔥": "volume", "🔊": "volume", volume: "volume",
      "⭐": "star", star: "star", "✅": "star", check: "star",
      "📲": "whatsapp", whatsapp: "whatsapp", phone: "whatsapp",
      "💬": "mail", chat: "mail", mail: "mail", "📧": "mail",
      "📌": "map", "📍": "map", map: "map", "map-pin": "map",
      "📤": "send", share: "send", upload: "send",
      "📋": "file", notion: "file", file: "file",
      "📐": "pen", pen: "pen",
      "🎵": "music", music: "music",
      "💼": "briefcase", briefcase: "briefcase",
      "⏰": "clock", clock: "clock",
      "🏢": "building", building: "building",
      "📱": "smartphone", smartphone: "smartphone",
      "👤": "user", user: "user",
    };
    if (map[key]) key = map[key];
    if (key && lucideToSvg[key]) return lucideToSvg[key];
    if (/[^\x00-\x7F]+/.test(String(iconName || ""))) return String(iconName);
    return lucideToSvg["star"] || "";
  };

  // ---- render functions (content only) ----
  const renderNav = (data: any) => {
    setText(q(".logo"), data.nav && data.nav.logo);
    const links = arr(data.nav && data.nav.links);
    const root = q(".nav-links") as any;
    if (root) {
      root.innerHTML = links
        .map((link: any) => '<li><a href="' + esc(link.href || "#") + '">' + esc(link.label) + "</a></li>")
        .join("");
    }
    const cta = q(".nav-wa") as any;
    if (cta && data.nav && data.nav.cta) {
      setText(cta, data.nav.cta.label || data.nav.cta.text);
      ensureHref(cta, data.nav.cta.href);
    }
  };
  const renderHero = (data: any) => {
    const hero = data.hero || {};
    setText(q(".hero-tag"), hero.eyebrow || hero.badgeText);
    const title = q(".hero-name") as any;
    if (title) title.innerHTML = esc(hero.titleLine1 || "SHA") + "<span>" + esc(hero.titleHighlight || "DITZ") + "</span>";
    setText(q(".hero-role"), hero.subtitle);
    const buttons = qa(".hero-cta-row a");
    if (buttons[0] && hero.primaryCta) {
      setText(buttons[0], hero.primaryCta.label);
      setHref(buttons[0], hero.primaryCta.href);
    }
    if (buttons[1] && hero.secondaryCta) {
      setText(buttons[1], hero.secondaryCta.label);
      setHref(buttons[1], hero.secondaryCta.href);
    }
    const stats = arr(hero.stats);
    const statsRoot = q(".hero-stats-row") as any;
    if (statsRoot) {
      statsRoot.innerHTML = stats
        .map(
          (stat: any) =>
            '<div class="hstat"><div class="hstat-num">' + esc(stat.value) + '</div><div class="hstat-lbl">' + esc(stat.label) + "</div></div>",
        )
        .join("");
    }
    setText(q(".hero-scroll"), hero.scrollText || "Scroll Down");
  };
  const renderShowreel = (data: any) => {
    const reel = data.showreel || {};
    setText(q("#reel .s-label"), reel.label);
    setTitle(q("#reel .s-title"), reel.title);
    setText(q("#reel .reel-note"), reel.note);
    const root = q("#reel .reel-embed") as any;
    if (!root) return;
    const url = text(reel.videoUrl).trim();
    if (url) {
      const embed = toEmbedUrl(url);
      if (/\.(mp4|webm|mov)(\?|#|$)/i.test(embed)) {
        root.innerHTML = '<video src="' + esc(embed) + '" controls playsinline style="width:100%;height:100%;display:block;object-fit:cover"></video>';
      } else {
        root.innerHTML = '<iframe src="' + esc(embed) + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
      }
    } else {
      root.innerHTML =
        '<div class="reel-placeholder"><div class="play-ring"><div class="play-arrow"></div></div><p class="reel-label">' + esc(reel.placeholderText || "PLAY SHOWREEL") + "</p></div>";
    }
  };
  const renderServices = (data: any) => {
    const sec = data.services || {};
    setText(q("#services .s-label"), sec.label);
    setTitle(q("#services .s-title"), sec.title);
    const root = q("#services .services-list") as any;
    if (!root) return;
    root.innerHTML = arr(sec.items)
      .map(
        (item: any) =>
          '<div class="service-row"><span class="srv-num">' + esc(item.number || "") + '</span><span class="srv-name">' + esc(item.title) + '</span><span class="srv-desc">' + esc(item.description) + '</span><span class="srv-price">' + esc(item.price || "") + "</span></div>",
      )
      .join("");
  };
  const renderPortfolio = (data: any) => {
    const sec = data.portfolio || {};
    setText(q("#work .s-label"), sec.label);
    setTitle(q("#work .s-title"), sec.title);
    const root = q("#work .work-grid") as any;
    if (!root) return;
    root.innerHTML = arr(sec.items)
      .map((item: any, idx: number) => {
        const media =
          item.image && item.image.url
            ? '<img class="wi-img" src="' + esc(item.image.url) + '" alt="' + esc(item.title) + '">'
            : '<div class="wi-placeholder wp' + esc(String((idx % 5) + 1)) + '"><span class="wp-icon">' + iconHtml(item.icon || "film") + "</span></div>";
        const body =
          media +
          '<div class="wi-num">' + esc(item.number || String(idx + 1).padStart(2, "0")) + "</div>" +
          '<div class="wi-always"><div class="wi-always-cat">' + esc(item.category) + '</div><div class="wi-always-title">' + esc(item.title) + "</div></div>" +
          '<div class="wi-overlay"><div class="wi-cat">' + esc(item.meta || item.category) + '</div><div class="wi-title">' + esc(item.title) + "</div></div>";
        if (item.href) return '<a class="wi" href="' + esc(item.href) + '">' + body + "</a>";
        return '<div class="wi">' + body + "</div>";
      })
      .join("");
  };
  const renderTools = (data: any) => {
    const sec = data.tools || {};
    const toolsRoot = q("#tools, .tools-section") as any;
    if (toolsRoot) {
      const lbl = toolsRoot.querySelector(".s-label");
      if (lbl) setText(lbl, sec.label);
    }
    const root = toolsRoot ? toolsRoot.querySelector(".tools-row") : null;
    if (!root) return;
    root.innerHTML = arr(sec.items)
      .map(
        (item: any) =>
          '<div class="tool-item"><span class="tool-icon2">' + iconHtml(item.icon) + '</span><span class="tool-name2">' + esc(item.name) + "</span></div>",
      )
      .join("");
  };
  const renderProcess = (data: any) => {
    const sec = data.process || {};
    setText(q("#process .s-label"), sec.label);
    setTitle(q("#process .s-title"), sec.title);
    const root = q("#process .process-track") as any;
    if (!root) return;
    root.innerHTML = arr(sec.steps)
      .map(
        (step: any) =>
          '<div class="pstep"><div class="pstep-circle">' + esc(step.number) + '</div><h3 class="pstep-title">' + esc(step.title) + '</h3><p class="pstep-desc">' + esc(step.description) + "</p></div>",
      )
      .join("");
  };
  const renderTestimonials = (data: any) => {
    const sec = data.testimonials || data.reviews || {};
    setText(q("#reviews .s-label"), sec.label);
    setTitle(q("#reviews .s-title"), sec.title);
    const root = q("#reviews .reviews-grid") as any;
    if (!root) return;
    root.innerHTML = arr(sec.items)
      .map(
        (item: any) =>
          '<div class="review-card"><div class="review-stars"><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div></div><p class="review-text">' + esc(item.quote) + '</p><div class="review-author"><div class="reviewer-avatar">' + iconHtml(item.avatar || "user") + '</div><div><div class="reviewer-name">' + esc(item.author) + '</div><div class="reviewer-info">' + esc(item.role) + '</div><div class="review-platform">' + esc(item.platform || "") + "</div></div></div></div>",
      )
      .join("");
  };
  const renderContact = (data: any) => {
    const sec = data.contact || {};
    setText(q("#contact .contact-left .s-label"), sec.label);
    setTitle(q("#contact .contact-left .s-title"), sec.title);
    setText(q("#contact .contact-right .s-label"), sec.formLabel);
    const infoRoot = q("#contact .contact-info-items") as any;
    if (infoRoot) {
      infoRoot.innerHTML = arr(sec.info)
        .map((item: any) => {
          const value = item.href ? '<a href="' + esc(item.href) + '">' + esc(item.value) + "</a>" : esc(item.value);
          return '<div class="ci-item"><div class="ci-icon">' + iconHtml(item.icon) + '</div><div><div class="ci-label">' + esc(item.label) + '</div><div class="ci-val">' + value + "</div></div></div>";
        })
        .join("");
    }
    const fields = sec.fields || {};
    const inputs = qa("#contact .contact-right .fi");
    if (inputs[0]) inputs[0].setAttribute("placeholder", text(fields.namePlaceholder || "Your Name"));
    if (inputs[1]) inputs[1].setAttribute("placeholder", text(fields.emailPlaceholder || "your@email.com"));
    if (inputs[2]) inputs[2].setAttribute("placeholder", text(fields.projectPlaceholder || "Project Type"));
    if (inputs[3]) inputs[3].setAttribute("placeholder", text(fields.budgetPlaceholder || "Budget Range"));
    if (inputs[4]) inputs[4].setAttribute("placeholder", text(fields.messagePlaceholder || "Tell me about your project..."));
    const btn = q("#contact .fsubmit") as any;
    if (btn) setText(btn, sec.submitText || "Send Message →");
  };
  const renderFooter = (data: any) => {
    const sec = data.footer || {};
    setText(q("footer .foot-logo"), sec.logo);
    setText(q("footer .foot-copy"), sec.copyright);
    const root = q("footer .foot-socials") as any;
    if (root) {
      root.innerHTML = arr(sec.socialLinks)
        .map((link: any) => '<a href="' + esc(link.href || "#") + '" title="' + esc(link.label) + '">' + esc(link.label) + "</a>")
        .join("");
    }
  };
  const renderMarquee = (data: any) => {
    const marqueeRoot = q("#marquee, .marquee-section") as any;
    const root = marqueeRoot ? marqueeRoot.querySelector(".marquee-track") : null;
    if (!root || !Array.isArray(data.marqueeItems)) return;
    const items = data.marqueeItems;
    root.innerHTML = items
      .concat(items)
      .map((item: any) => '<span class="marquee-item">' + esc(item) + '</span><span class="marquee-dot"> ✦ </span>')
      .join("");
  };
  const renderAbout = (data: any) => {
    const sec = data.about || {};
    setText(q("#about .s-label"), sec.label);
    setTitle(q("#about .s-title"), sec.title);
    const paragraphs = qa("#about .about-text p:not(.s-label)");
    const p = arr(sec.paragraphs);
    paragraphs.forEach((node: any, idx: number) => {
      if (p[idx]) node.innerHTML = esc(p[idx]);
    });
    const skills = q("#about .about-skills") as any;
    if (skills && Array.isArray(sec.skills)) {
      skills.innerHTML = sec.skills.map((skill: any) => '<span class="skill-chip">' + esc(skill) + "</span>").join("");
    }
    const avail = q("#about .avail-badge") as any;
    if (avail && sec.availabilityText) {
      avail.innerHTML = '<span class="avail-dot"></span>' + esc(sec.availabilityText);
    }
    const imgWrap = q("#about .about-img-wrap") as any;
    if (imgWrap) {
      if (sec.image && sec.image.url) {
        imgWrap.innerHTML = '<img class="about-img" src="' + esc(sec.image.url) + '" alt="Profile" />';
      } else {
        imgWrap.innerHTML = '<div class="about-img-placeholder"><div class="about-avatar-icon">👤</div></div>';
      }
    }
  };
  const renderWhatsapp = (data: any) => {
    const wa = data.whatsapp || {};
    const enabled = wa.enabled !== false;
    const href = enabled ? buildWaHref(wa.number, wa.message || "Hi Shaditz! I want to discuss a project.") : "";
    const openBlank = wa.openInNewTab !== false;

    const nav = q(".nav-wa") as any;
    if (nav) {
      nav.style.display = enabled && href ? "" : "none";
      if (enabled && wa.navLabel) setText(nav, wa.navLabel);
      ensureHref(nav, href);
      setTargetBlank(nav, openBlank);
    }
    const heroBtn = q(".hero-cta-row .btn-ghost") as any;
    if (heroBtn) {
      heroBtn.style.display = enabled && href ? "" : "none";
      if (enabled && wa.heroLabel) setText(heroBtn, wa.heroLabel);
      ensureHref(heroBtn, href);
      setTargetBlank(heroBtn, openBlank);
    }
    const contactBtn = q(".wa-contact-btn") as any;
    if (contactBtn) {
      contactBtn.style.display = enabled && href ? "" : "none";
      if (enabled && wa.contactLabel) {
        const svg = contactBtn.querySelector("svg");
        if (svg) {
          contactBtn.innerHTML = svg.outerHTML + " " + esc(wa.contactLabel);
        } else {
          setText(contactBtn, wa.contactLabel);
        }
      }
      ensureHref(contactBtn, href);
      setTargetBlank(contactBtn, openBlank);
    }
    const infoItems = qa(".ci-item");
    infoItems.forEach((item: any) => {
      const label = item.querySelector(".ci-label");
      if (label && text(label.textContent).trim().toLowerCase() === "whatsapp") {
        const valA = item.querySelector(".ci-val a");
        if (valA) {
          valA.style.display = enabled && href ? "" : "none";
          ensureHref(valA, href);
          setTargetBlank(valA, openBlank);
          const formattedNumber = text(wa.number).trim();
          if (formattedNumber) setText(valA, "+" + formattedNumber);
          else setText(valA, "Chat on WhatsApp");
        }
      }
    });
  };

  const applyOrderAndVisibility = (c: any) => {
    const page = c && c.page ? c.page : {};
    const sections = arr(page.sections);
    const byType: Record<string, any> = {};
    sections.forEach((section: any) => {
      if (section && section.type) byType[section.type] = section;
    });
    ["loader", "nav", "whatsapp", "hero", "marquee", "about", "showreel", "services", "portfolio", "process", "reviews", "tools", "contact", "footer"].forEach((type) => {
      const el = q(sectionSelector(type)) as any;
      if (!el) return;
      const section = byType[type];
      el.style.display = section && section.enabled === false ? "none" : "";
    });
    // Reorder sections to match page.sections order (nav stays in place).
    sections.forEach((section: any) => {
      if (!section || section.type === "nav") return;
      const el = q(sectionSelector(section.type)) as any;
      if (el && el.parentNode === document.body) document.body.appendChild(el);
    });
  };

  // ---- run pipeline (mirrors applyContent, content steps only) ----
  try {
    const data: any = content.shaditz || {};
    data.whatsapp = data.whatsapp || content.whatsapp || {};
    renderNav(data);
    renderHero(data);
    renderShowreel(data);
    renderAbout(data);
    renderServices(data);
    renderPortfolio(data);
    renderTools(data);
    renderProcess(data);
    renderTestimonials(data);
    renderContact(data);
    renderFooter(data);
    renderMarquee(data);
    renderWhatsapp(data);
    ["hero", "about", "showreel", "services", "portfolio", "tools", "process", "reviews", "contact"].forEach((type) => {
      applyBackground(content, type);
    });
    applyOrderAndVisibility(content);
  } catch {
    return null;
  }

  // Strip the template's inline scripts — interactivity is re-added by the
  // client component LandingInteractivity.
  qa("script").forEach((s: any) => s.remove());

  const styleEl = (document.querySelector("head style") || document.querySelector("style")) as any;
  const fontLink = document.querySelector('head link[rel="stylesheet"]') as any;
  const docAny = document as AnyDoc;

  return {
    styleHtml: styleEl ? styleEl.innerHTML : "",
    fontHref: fontLink ? fontLink.getAttribute("href") || "" : "",
    bodyHtml: docAny.body ? docAny.body.innerHTML : "",
  };
}

// Lucide SVG strings (verbatim from the iframe bootstrap `lucideToSvg`).
const LUCIDE_TO_SVG: Record<string, string> = {
  video: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>',
  sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>',
  music: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-music"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  palette: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
  volume: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
  building: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
  smartphone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>',
  film: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-film"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>',
  pen: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pen-tool"><path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"/><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.208L5.35 15.88a1 1 0 0 0 .776.746L13 18"/><path d="m2.3 2.3 7.286 7.286"/><circle cx="11" cy="11" r="2"/></svg>',
  mail: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  briefcase: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-briefcase"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>',
  map: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  send: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  file: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
  whatsapp: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  globe: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
};
