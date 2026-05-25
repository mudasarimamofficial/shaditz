"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HomepageContent } from "@/content/homepage";

type DeviceMode = "desktop" | "tablet" | "mobile";

type Props = {
  content: HomepageContent;
  templateHtml?: string;
  device?: DeviceMode;
  className?: string;
  height?: string;
};

function escapeInlineRawText(value: string) {
  return value.replace(/<\/(script|style)/gi, "<\\/$1");
}

function safeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function jsonForInline(value: unknown) {
  return escapeInlineRawText(JSON.stringify(value ?? null));
}

function injectBeforeCloseTag(html: string, tag: "head" | "body", insertion: string) {
  const close = `</${tag}>`;
  const idx = html.toLowerCase().lastIndexOf(close);
  if (idx === -1) return html + insertion;
  return html.slice(0, idx) + insertion + html.slice(idx);
}

export function RebuiltLandingFrame({
  content,
  templateHtml,
  device = "desktop",
  className,
  height = "100vh",
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [fetchedTemplate, setFetchedTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (templateHtml && templateHtml.trim().length) return;
    let alive = true;
    fetch("/shaditz-rebuilt-1.html", { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`template_fetch_${r.status}`))))
      .then((t) => {
        if (alive) setFetchedTemplate(t);
      })
      .catch(() => {
        if (alive) setFetchedTemplate("");
      });
    return () => {
      alive = false;
    };
  }, [templateHtml]);

  const baseTemplate = (templateHtml && templateHtml.trim().length ? templateHtml : fetchedTemplate) ?? null;

  const srcDoc = useMemo(() => {
    if (!baseTemplate) return "";

    const customCss = safeText(content.site?.customCss).trim();
    const customJs = safeText(content.site?.customJs).trim();
    const initial = {
      shaditz: content.shaditz,
      page: content.page,
      site: content.site,
      whatsapp: content.whatsapp,
    };

    const bootstrap = `
<script id="shaditz-landing-bootstrap">
(function(){
  function q(sel){ return document.querySelector(sel); }
  function qa(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function text(v){ return typeof v === "string" ? v : ""; }
  function bool(v){ return v === true; }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function esc(v){
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function setText(el, value){ if(el) el.textContent = text(value); }
  function setTitle(el, value){ if(el) el.innerHTML = esc(text(value)).replace(/\\n/g, "<br>"); }
  function setHref(el, href){ if(el && text(href)) el.setAttribute("href", text(href)); }
  function setTargetBlank(el, enabled){
    if(!el) return;
    if(enabled) el.setAttribute("target", "_blank");
    else el.removeAttribute("target");
  }
  function ensureHref(el, href){
    if(!el) return;
    if(text(href)) el.setAttribute("href", text(href));
    else el.removeAttribute("href");
  }
  function setButtonLabelKeepingIcon(el, label){
    if(!el) return;
    var svg = el.querySelector ? el.querySelector("svg") : null;
    if(svg){
      el.innerHTML = svg.outerHTML + " " + esc(text(label));
    } else {
      setText(el, label);
    }
  }
  function waDigits(value){
    return text(value).replace(/[^0-9]/g, "");
  }
  function buildWaHref(number, message){
    var digits = waDigits(number);
    if(!digits) return "";
    var msg = text(message || "").trim();
    var base = "https://wa.me/" + digits;
    return msg ? (base + "?text=" + encodeURIComponent(msg)) : base;
  }
  function sectionByType(content, type){
    var sections = content && content.page && Array.isArray(content.page.sections) ? content.page.sections : [];
    for(var i=0;i<sections.length;i++){ if(sections[i] && sections[i].type === type) return sections[i]; }
    return null;
  }
  function sectionSelector(type){
    return {
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
      footer: "footer"
    }[type] || "";
  }
  function settings(content, type){
    var section = sectionByType(content, type);
    return section && section.settings && typeof section.settings === "object" ? section.settings : {};
  }
  function imageFrom(cfg){
    if(!cfg || typeof cfg !== "object") return "";
    if(typeof cfg.backgroundImage === "string") return cfg.backgroundImage;
    if(cfg.background && typeof cfg.background.url === "string") return cfg.background.url;
    return "";
  }
  function applyBackground(content, type){
    if(type === "nav" || type === "footer") return;
    var el = q(sectionSelector(type));
    if(!el) return;
    var cfg = settings(content, type);
    var backgroundType = text(cfg.backgroundType);
    var img = imageFrom(cfg);
    var overlay = text(cfg.overlayColor);
    var color = text(cfg.backgroundColor || cfg.backgroundColorHex);

    el.style.position = el.style.position || "relative";
    if(backgroundType === "image" && img){
      var layer = overlay ? "linear-gradient(" + overlay + "," + overlay + "), " : "";
      el.style.backgroundImage = layer + "url(" + img + ")";
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      el.style.backgroundRepeat = "no-repeat";
    } else if(backgroundType === "color" && color) {
      el.style.backgroundImage = "";
      el.style.backgroundColor = color;
    } else {
      el.style.backgroundImage = "";
    }
  }
  function toEmbedUrl(url){
    var raw = text(url).trim();
    if(!raw) return "";
    try{
      var u = new URL(raw, window.location.href);
      if(u.hostname.indexOf("youtu.be") !== -1){
        var id = u.pathname.replace(/^\\//, "");
        return id ? "https://www.youtube.com/embed/" + encodeURIComponent(id) : raw;
      }
      if(u.hostname.indexOf("youtube.com") !== -1){
        var v = u.searchParams.get("v");
        if(v) return "https://www.youtube.com/embed/" + encodeURIComponent(v);
        if(u.pathname.indexOf("/shorts/") === 0) return "https://www.youtube.com/embed/" + encodeURIComponent(u.pathname.split("/")[2] || "");
      }
      if(u.hostname.indexOf("vimeo.com") !== -1){
        var parts = u.pathname.split("/").filter(Boolean);
        if(parts[0]) return "https://player.vimeo.com/video/" + encodeURIComponent(parts[0]);
      }
    } catch(e){}
    return raw;
  }
  function renderNav(data){
    setText(q(".logo"), data.nav && data.nav.logo);
    var links = arr(data.nav && data.nav.links);
    var root = q(".nav-links");
    if(root){
      root.innerHTML = links.map(function(link){
        return '<li><a href="' + esc(link.href || "#") + '">' + esc(link.label) + "</a></li>";
      }).join("");
    }
    var cta = q(".nav-wa");
    if(cta && data.nav && data.nav.cta){
      setText(cta, data.nav.cta.label || data.nav.cta.text);
      ensureHref(cta, data.nav.cta.href);
    }
  }
  function renderHero(data){
    var hero = data.hero || {};
    setText(q(".hero-tag"), hero.eyebrow || hero.badgeText);
    var title = q(".hero-name");
    if(title) title.innerHTML = esc(hero.titleLine1 || "SHA") + "<span>" + esc(hero.titleHighlight || "DITZ") + "</span>";
    setText(q(".hero-role"), hero.subtitle);
    var buttons = qa(".hero-cta-row a");
    if(buttons[0] && hero.primaryCta){ setText(buttons[0], hero.primaryCta.label); setHref(buttons[0], hero.primaryCta.href); }
    if(buttons[1] && hero.secondaryCta){ setText(buttons[1], hero.secondaryCta.label); setHref(buttons[1], hero.secondaryCta.href); }
    var stats = arr(hero.stats);
    var statsRoot = q(".hero-stats-row");
    if(statsRoot){
      statsRoot.innerHTML = stats.map(function(stat){
        return '<div class="hstat"><div class="hstat-num">' + esc(stat.value) + '</div><div class="hstat-lbl">' + esc(stat.label) + "</div></div>";
      }).join("");
    }
    setText(q(".hero-scroll"), hero.scrollText || "Scroll Down");
  }
  function renderShowreel(data){
    var reel = data.showreel || {};
    setText(q("#reel .s-label"), reel.label);
    setTitle(q("#reel .s-title"), reel.title);
    setText(q("#reel .reel-note"), reel.note);
    var root = q("#reel .reel-embed");
    if(!root) return;
    var url = text(reel.videoUrl).trim();
    if(url){
      var embed = toEmbedUrl(url);
      if(/\\.(mp4|webm|mov)(\\?|#|$)/i.test(embed)){
        root.innerHTML = '<video src="' + esc(embed) + '" controls playsinline style="width:100%;height:100%;display:block;object-fit:cover"></video>';
      } else {
        root.innerHTML = '<iframe src="' + esc(embed) + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
      }
    } else {
      root.innerHTML = '<div class="reel-placeholder"><div class="play-ring"><div class="play-arrow"></div></div><p class="reel-label">' + esc(reel.placeholderText || "PLAY SHOWREEL") + "</p></div>";
    }
  }
  function renderServices(data){
    var sec = data.services || {};
    setText(q("#services .s-label"), sec.label);
    setTitle(q("#services .s-title"), sec.title);
    var root = q("#services .services-list");
    if(!root) return;
    root.innerHTML = arr(sec.items).map(function(item, idx){
      return '<div class="service-row"><span class="srv-num">' + esc(item.number || "") + '</span><span class="srv-name">' + esc(item.title) + '</span><span class="srv-desc">' + esc(item.description) + '</span><span class="srv-price">' + esc(item.price || "") + "</span></div>";
    }).join("");
  }
  function renderPortfolio(data){
    var sec = data.portfolio || {};
    setText(q("#work .s-label"), sec.label);
    setTitle(q("#work .s-title"), sec.title);
    var root = q("#work .work-grid");
    if(!root) return;
    root.innerHTML = arr(sec.items).map(function(item, idx){
      var media = item.image && item.image.url
        ? '<img class="wi-img" src="' + esc(item.image.url) + '" alt="' + esc(item.title) + '">'
        : '<div class="wi-placeholder wp' + esc(String((idx%5)+1)) + '"><span class="wp-icon">' + esc(item.icon || "🎬") + "</span></div>";
      var body = media +
        '<div class="wi-num">' + esc(item.number || String(idx + 1).padStart(2,"0")) + '</div>' +
        '<div class="wi-always"><div class="wi-always-cat">' + esc(item.category) + '</div><div class="wi-always-title">' + esc(item.title) + '</div></div>' +
        '<div class="wi-overlay"><div class="wi-cat">' + esc(item.meta || item.category) + '</div><div class="wi-title">' + esc(item.title) + "</div></div>";
      var cls = "wi";
      if(item.href) return '<a class="' + cls + '" href="' + esc(item.href) + '">' + body + "</a>";
      return '<div class="' + cls + '">' + body + "</div>";
    }).join("");
  }
  function renderTools(data){
    var sec = data.tools || {};
    var toolsRoot = q("#tools, .tools-section");
    if(toolsRoot){
      var lbl = toolsRoot.querySelector(".s-label");
      if(lbl) setText(lbl, sec.label);
    }
    var root = toolsRoot ? toolsRoot.querySelector(".tools-row") : null;
    if(!root) return;
    root.innerHTML = arr(sec.items).map(function(item){
      return '<div class="tool-item"><span class="tool-icon2">' + esc(item.icon) + '</span><span class="tool-name2">' + esc(item.name) + "</span></div>";
    }).join("");
  }
  function renderProcess(data){
    var sec = data.process || {};
    setText(q("#process .s-label"), sec.label);
    setTitle(q("#process .s-title"), sec.title);
    var root = q("#process .process-track");
    if(!root) return;
    root.innerHTML = arr(sec.steps).map(function(step){
      return '<div class="pstep"><div class="pstep-circle">' + esc(step.number) + '</div><h3 class="pstep-title">' + esc(step.title) + '</h3><p class="pstep-desc">' + esc(step.description) + "</p></div>";
    }).join("");
  }
  function renderTestimonials(data){
    var sec = data.testimonials || data.reviews || {};
    setText(q("#reviews .s-label"), sec.label);
    setTitle(q("#reviews .s-title"), sec.title);
    var root = q("#reviews .reviews-grid");
    if(!root) return;
    root.innerHTML = arr(sec.items).map(function(item){
      return '<div class="review-card"><div class="review-stars"><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div></div><p class="review-text">' + esc(item.quote) + '</p><div class="review-author"><div class="reviewer-avatar">' + esc(item.avatar || "👤") + '</div><div><div class="reviewer-name">' + esc(item.author) + '</div><div class="reviewer-info">' + esc(item.role) + '</div><div class="review-platform">' + esc(item.platform || "") + "</div></div></div></div>";
    }).join("");
  }
  function renderPricing(data){
    var sec = data.pricing || {};
    setText(q("#pricing .section-label"), sec.label);
    setTitle(q("#pricing .section-title"), sec.title);
    var root = q("#pricing .pricing-grid");
    if(!root) return;
    root.innerHTML = arr(sec.tiers).map(function(tier){
      var features = arr(tier.features).map(function(f){ return "<li>" + esc(f) + "</li>"; }).join("");
      var cls = tier.featured ? "pricing-card featured" : "pricing-card";
      var cta = tier.cta || {};
      return '<div class="' + cls + '"><div class="pricing-tier">' + esc(tier.name) + '</div><div class="pricing-price">' + esc(tier.price) + '</div><div class="pricing-unit">' + esc(tier.unit) + '</div><ul class="pricing-features">' + features + '</ul><a href="' + esc(cta.href || "#contact") + '" class="pricing-btn">' + esc(cta.label || "Get Started") + "</a></div>";
    }).join("");
  }
  function renderContact(data){
    var sec = data.contact || {};
    setText(q("#contact .contact-left .s-label"), sec.label);
    setTitle(q("#contact .contact-left .s-title"), sec.title);
    setText(q("#contact .contact-right .s-label"), sec.formLabel);
    var infoRoot = q("#contact .contact-info-items");
    if(infoRoot){
      infoRoot.innerHTML = arr(sec.info).map(function(item){
        var value = item.href ? '<a href="' + esc(item.href) + '">' + esc(item.value) + "</a>" : esc(item.value);
        return '<div class="ci-item"><div class="ci-icon">' + esc(item.icon) + '</div><div><div class="ci-label">' + esc(item.label) + '</div><div class="ci-val">' + value + "</div></div></div>";
      }).join("");
    }
    var fields = sec.fields || {};
    var inputs = qa("#contact .contact-right .fi");
    if(inputs[0]) inputs[0].setAttribute("placeholder", text(fields.namePlaceholder || "Your Name"));
    if(inputs[1]) inputs[1].setAttribute("placeholder", text(fields.emailPlaceholder || "your@email.com"));
    if(inputs[2]) inputs[2].setAttribute("placeholder", text(fields.projectPlaceholder || "Project Type"));
    if(inputs[3]) inputs[3].setAttribute("placeholder", text(fields.budgetPlaceholder || "Budget Range"));
    if(inputs[4]) inputs[4].setAttribute("placeholder", text(fields.messagePlaceholder || "Tell me about your project..."));
    var btn = q("#contact .fsubmit");
    if(btn) setText(btn, sec.submitText || "Send Message →");
  }
  function renderFooter(data){
    var sec = data.footer || {};
    setText(q("footer .foot-logo"), sec.logo);
    setText(q("footer .foot-copy"), sec.copyright);
    var root = q("footer .foot-socials");
    if(root){
      root.innerHTML = arr(sec.socialLinks).map(function(link){
        return '<a href="' + esc(link.href || "#") + '" title="' + esc(link.label) + '">' + esc(link.label) + "</a>";
      }).join("");
    }
  }
  function renderMarquee(data){
    var marqueeRoot = q("#marquee, .marquee-section");
    var root = marqueeRoot ? marqueeRoot.querySelector(".marquee-track") : null;
    if(!root || !Array.isArray(data.marqueeItems)) return;
    var items = data.marqueeItems;
    root.innerHTML = items.concat(items).map(function(item){
      return '<span class="marquee-item">' + esc(item) + '</span><span class="marquee-dot"> ✦ </span>';
    }).join("");
  }
  function renderAbout(data){
    var sec = data.about || {};
    setText(q("#about .s-label"), sec.label);
    setTitle(q("#about .s-title"), sec.title);
    var paragraphs = qa("#about .about-text p:not(.s-label)");
    var p = arr(sec.paragraphs);
    paragraphs.forEach(function(node, idx){
      if(p[idx]) node.innerHTML = esc(p[idx]);
    });
    var skills = q("#about .about-skills");
    if(skills && Array.isArray(sec.skills)){
      skills.innerHTML = sec.skills.map(function(skill){
        return '<span class="skill-chip">' + esc(skill) + "</span>";
      }).join("");
    }
    var avail = q("#about .avail-badge");
    if(avail && sec.availabilityText){
      avail.innerHTML = '<span class="avail-dot"></span>' + esc(sec.availabilityText);
    }
  }
  function renderWhatsapp(data){
    var wa = data.whatsapp || {};
    var enabled = wa.enabled !== false;
    var href = enabled ? buildWaHref(wa.number, wa.message || "Hi Shaditz! I want to discuss a project.") : "";
    var openBlank = wa.openInNewTab !== false;

    var nav = q(".nav-wa");
    if(nav){
      nav.style.display = enabled && href ? "" : "none";
      if(enabled && wa.navLabel) setText(nav, wa.navLabel);
      ensureHref(nav, href);
      setTargetBlank(nav, openBlank);
    }
  }
  const lucideToSvg: Record<string, string> = {
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
    file: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'
  };

  function getSvgForIcon(iconName: string) {
    if (lucideToSvg[iconName]) return lucideToSvg[iconName];
    if (/[^ -]+/.test(iconName)) return iconName;
    return lucideToSvg['star'] || iconName;
  }

  function applyOrderAndVisibility(content){
    var page = content && content.page ? content.page : {};
    var sections = arr(page.sections);
    var byType = {};
    sections.forEach(function(section){ if(section && section.type) byType[section.type] = section; });
    Object.keys(sectionSelectorMap).forEach(function(type){});
    ["loader","nav","whatsapp","hero","marquee","about","showreel","services","portfolio","process","reviews","tools","contact","footer"].forEach(function(type){
      var el = q(sectionSelector(type));
      if(!el) return;
      var section = byType[type];
      el.style.display = section && section.enabled === false ? "none" : "";
    });
    var anchor = document.getElementById("shaditz-landing-bootstrap");
    sections.forEach(function(section){
      if(!section || section.type === "nav") return;
      var el = q(sectionSelector(section.type));
      if(el && anchor && el.parentNode === document.body) document.body.insertBefore(el, anchor);
    });
  }
  function refreshReveal(){
    var revealItems = qa(".reveal");
    if(!("IntersectionObserver" in window)){
      revealItems.forEach(function(el){ el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealItems.forEach(function(el){
      if(el.dataset.shaditzObserved) return;
      el.dataset.shaditzObserved = "1";
      io.observe(el);
    });
  }
  function bindCursor(){
    var cursor = document.getElementById("cursor");
    var follower = document.getElementById("cursorFollower");
    if(!cursor || !follower) return;
    qa("a, button").forEach(function(el){
      if(el.dataset.cursorBound) return;
      el.dataset.cursorBound = "1";
      el.addEventListener("mouseenter", function(){
        cursor.style.transform = "translate(-50%, -50%) scale(2)";
        follower.style.transform = "translate(-50%, -50%) scale(1.5)";
        follower.style.borderColor = "rgba(201,168,76,0.8)";
      });
      el.addEventListener("mouseleave", function(){
        cursor.style.transform = "translate(-50%, -50%) scale(1)";
        follower.style.transform = "translate(-50%, -50%) scale(1)";
        follower.style.borderColor = "rgba(201,168,76,0.4)";
      });
    });
  }
  function bindContactForm(content){
      var btn = q("#contact .fsubmit");
    if(!btn || btn.dataset.submitBound) return;
    btn.dataset.submitBound = "1";
    var status = document.createElement("div");
    status.id = "shaditz-form-status";
    status.style.marginTop = "16px";
    status.style.fontSize = "13px";
    status.style.letterSpacing = "1px";
    btn.parentNode.insertBefore(status, btn.nextSibling);
    btn.addEventListener("click", function(){
      var data = (window.__SHADITZ_CURRENT__ && window.__SHADITZ_CURRENT__.shaditz) || {};
      var contact = data.contact || {};
      var inputs = qa("#contact .contact-right .fi");
      var name = inputs[0] ? String(inputs[0].value || "").trim() : "";
      var email = inputs[1] ? String(inputs[1].value || "").trim() : "";
      var project = inputs[2] ? String(inputs[2].value || "").trim() : "";
      var budget = inputs[3] ? String(inputs[3].value || "").trim() : "";
      var message = inputs[4] ? String(inputs[4].value || "").trim() : "";
      if(!name || !email || !project || !message){
        status.style.color = "#e8c97a";
        status.textContent = "Please complete all fields.";
        return;
      }
      btn.disabled = true;
      btn.textContent = contact.loadingText || "Sending...";
      status.textContent = "";
      fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name, email: email, business_type: project, revenue: budget, message: message })
      }).then(function(r){
        if(!r.ok) throw new Error("submit_failed");
        return r.json();
      }).then(function(){
        status.style.color = "#e8c97a";
        status.textContent = contact.successText || "Message sent.";
        inputs.forEach(function(input){ input.value = ""; });
        if(inputs[4]) inputs[4].value = "";
      }).catch(function(){
        status.style.color = "#e03030";
        status.textContent = contact.errorText || "Something went wrong. Please try again.";
      }).finally(function(){
        btn.disabled = false;
        btn.textContent = contact.submitText || "Send Message →";
      });
    });
  }
  function applyContent(content){
    try{
      if(!content) return;
      window.__SHADITZ_CURRENT__ = content;
      var data = content.shaditz || {};
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
      ["hero","about","showreel","services","portfolio","tools","process","reviews","contact"].forEach(function(type){
        applyBackground(content, type);
      });
      applyOrderAndVisibility(content);
      bindContactForm(content);
      bindCursor();
      refreshReveal();
    } catch(e){
      console.error("Shaditz renderer failed", e);
    }
  }
  var sectionSelectorMap = {};
  window.addEventListener("message", function(e){
    if(e.origin !== window.location.origin) return;
    var data = e.data || {};
    if((data.type === "shaditz_builder_preview" || data.type === "cf_rebuilt_apply") && data.content){
      applyContent(data.content);
    }
  });
  try{ applyContent(window.__SHADITZ_INITIAL__); } catch(e){}
})();
</script>
`;

    const initialVar = `<script>window.__SHADITZ_INITIAL__ = JSON.parse(${JSON.stringify(jsonForInline(initial))});</script>`;
    const deviceVar = `<script>document.documentElement.dataset.device=${JSON.stringify(device)};</script>`;
    const customCssTag = customCss.length
      ? `<style id="shaditz-custom-css">${escapeInlineRawText(customCss)}</style>`
      : "";
    const customJsTag = customJs.length
      ? `<script id="shaditz-custom-js">(function(){\n${escapeInlineRawText(customJs)}\n})();</script>`
      : "";

    let out = baseTemplate;
    out = injectBeforeCloseTag(out, "head", customCssTag + deviceVar + initialVar);
    out = injectBeforeCloseTag(out, "body", bootstrap + customJsTag);
    return out;
  }, [baseTemplate, content, device]);

  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    try {
      win.postMessage({ type: "cf_rebuilt_apply", content }, window.location.origin);
    } catch {}
  }, [content]);

  if (!baseTemplate) return null;

  return (
    <iframe
      ref={iframeRef}
      title="Shaditz landing"
      className={className}
      data-shaditz-landing="true"
      sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
      style={{ width: "100%", height, border: "none", background: "#080808" }}
      srcDoc={srcDoc}
    />
  );
}
