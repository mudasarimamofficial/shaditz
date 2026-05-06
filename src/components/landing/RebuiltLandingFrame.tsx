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
  function sectionByType(content, type){
    var sections = content && content.page && Array.isArray(content.page.sections) ? content.page.sections : [];
    for(var i=0;i<sections.length;i++){ if(sections[i] && sections[i].type === type) return sections[i]; }
    return null;
  }
  function sectionSelector(type){
    return {
      nav: "nav",
      hero: "#home",
      showreel: "#reel",
      services: "#services",
      portfolio: "#work",
      tools: "#tools",
      process: "#process",
      testimonials: "#testimonials",
      pricing: "#pricing",
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
    setText(q(".nav-logo"), data.nav && data.nav.logo);
    var links = arr(data.nav && data.nav.links);
    var root = q(".nav-links");
    if(root){
      root.innerHTML = links.map(function(link){
        return '<li><a href="' + esc(link.href || "#") + '">' + esc(link.label) + "</a></li>";
      }).join("");
    }
    var cta = q(".nav-cta");
    if(cta && data.nav && data.nav.cta){
      setText(cta, data.nav.cta.label);
      setHref(cta, data.nav.cta.href);
    }
  }
  function renderHero(data){
    var hero = data.hero || {};
    setText(q(".hero-eyebrow"), hero.eyebrow);
    var title = q(".hero-title");
    if(title) title.innerHTML = esc(hero.titleLine1) + "<br><span>" + esc(hero.titleHighlight) + "</span>";
    setText(q(".hero-subtitle"), hero.subtitle);
    var buttons = qa(".hero-actions a");
    if(buttons[0] && hero.primaryCta){ setText(buttons[0], hero.primaryCta.label); setHref(buttons[0], hero.primaryCta.href); }
    if(buttons[1] && hero.secondaryCta){ setText(buttons[1], hero.secondaryCta.label); setHref(buttons[1], hero.secondaryCta.href); }
    var stats = arr(hero.stats);
    var statsRoot = q(".hero-stats");
    if(statsRoot){
      statsRoot.innerHTML = stats.map(function(stat){
        return '<div><div class="stat-num">' + esc(stat.value) + '</div><div class="stat-label">' + esc(stat.label) + "</div></div>";
      }).join("");
    }
    var scroll = q(".scroll-indicator");
    if(scroll){
      scroll.innerHTML = '<div class="scroll-line"></div>' + esc(hero.scrollText || "");
    }
    var heroEl = q("#home");
    if(heroEl && hero.background && hero.background.url){
      heroEl.style.backgroundImage = "url(" + hero.background.url + ")";
      heroEl.style.backgroundSize = "cover";
      heroEl.style.backgroundPosition = "center";
    }
  }
  function renderShowreel(data){
    var reel = data.showreel || {};
    setText(q("#reel .section-label"), reel.label);
    setTitle(q("#reel .section-title"), reel.title);
    setText(q("#reel .reel-note"), reel.note);
    var root = q("#reel .reel-container");
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
      root.innerHTML = '<div class="reel-placeholder"><div class="play-btn"></div><p class="reel-text">' + esc(reel.placeholderText || "SHOWREEL") + "</p></div>";
    }
  }
  function renderServices(data){
    var sec = data.services || {};
    setText(q("#services .section-label"), sec.label);
    setTitle(q("#services .section-title"), sec.title);
    var root = q("#services .services-grid");
    if(!root) return;
    root.innerHTML = arr(sec.items).map(function(item){
      var tags = arr(item.tags).map(function(tag){ return '<span class="tag">' + esc(tag) + "</span>"; }).join("");
      return '<div class="service-card reveal"><span class="service-icon">' + esc(item.icon) + '</span><div class="service-num">' + esc(item.number) + '</div><h3 class="service-title">' + esc(item.title) + '</h3><p class="service-desc">' + esc(item.description) + '</p><div class="service-tags">' + tags + "</div></div>";
    }).join("");
  }
  function renderPortfolio(data){
    var sec = data.portfolio || {};
    setText(q("#work .section-label"), sec.label);
    setTitle(q("#work .section-title"), sec.title);
    var root = q("#work .portfolio-grid");
    if(!root) return;
    root.innerHTML = arr(sec.items).map(function(item){
      var media = item.image && item.image.url
        ? '<img class="portfolio-thumb" src="' + esc(item.image.url) + '" alt="' + esc(item.title) + '">'
        : '<div class="portfolio-thumb-placeholder"><span class="portfolio-placeholder-icon">' + esc(item.icon || "🎬") + "</span></div>";
      var body = media +
        '<div class="portfolio-always-text"><div class="portfolio-always-cat">' + esc(item.category) + '</div><div class="portfolio-always-name">' + esc(item.title) + '</div></div>' +
        '<div class="portfolio-overlay"><div class="portfolio-cat">' + esc(item.meta || item.category) + '</div><div class="portfolio-name">' + esc(item.title) + "</div></div>";
      var cls = item.wide ? "portfolio-item wide" : "portfolio-item";
      if(item.href) return '<a class="' + cls + '" href="' + esc(item.href) + '">' + body + "</a>";
      return '<div class="' + cls + '">' + body + "</div>";
    }).join("");
  }
  function renderTools(data){
    var sec = data.tools || {};
    setText(q("#tools .section-label"), sec.label);
    setTitle(q("#tools .section-title"), sec.title);
    var root = q("#tools .tools-grid");
    if(!root) return;
    root.innerHTML = arr(sec.items).map(function(item){
      return '<div class="tool-card"><div class="tool-icon">' + esc(item.icon) + '</div><div class="tool-name">' + esc(item.name) + "</div></div>";
    }).join("");
  }
  function renderProcess(data){
    var sec = data.process || {};
    setText(q("#process .section-label"), sec.label);
    setTitle(q("#process .section-title"), sec.title);
    var root = q("#process .process-steps");
    if(!root) return;
    root.innerHTML = arr(sec.steps).map(function(step){
      return '<div class="process-step"><div class="step-num">' + esc(step.number) + '</div><h3 class="step-title">' + esc(step.title) + '</h3><p class="step-desc">' + esc(step.description) + "</p></div>";
    }).join("");
  }
  function renderTestimonials(data){
    var sec = data.testimonials || {};
    setText(q("#testimonials .section-label"), sec.label);
    setTitle(q("#testimonials .section-title"), sec.title);
    var root = q("#testimonials .testimonials-grid");
    if(!root) return;
    root.innerHTML = arr(sec.items).map(function(item){
      return '<div class="testimonial-card reveal"><div class="quote-mark">"</div><p class="quote-text">' + esc(item.quote) + '</p><div class="quote-author"><div class="author-avatar">' + esc(item.avatar || "👤") + '</div><div><div class="stars">' + esc(item.stars || "★★★★★") + '</div><div class="author-name">' + esc(item.author) + '</div><div class="author-title">' + esc(item.role) + "</div></div></div></div>";
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
    setText(q("#contact .contact-left .section-label"), sec.label);
    setTitle(q("#contact .contact-left .section-title"), sec.title);
    setText(q("#contact .contact-right .section-label"), sec.formLabel);
    var infoRoot = q("#contact .contact-info");
    if(infoRoot){
      infoRoot.innerHTML = arr(sec.info).map(function(item){
        var value = item.href ? '<a href="' + esc(item.href) + '">' + esc(item.value) + "</a>" : esc(item.value);
        return '<div class="contact-item"><span class="contact-icon">' + esc(item.icon) + '</span><div><div class="contact-label">' + esc(item.label) + '</div><div class="contact-value">' + value + "</div></div></div>";
      }).join("");
    }
    var fields = sec.fields || {};
    var labels = qa("#contact .contact-right .form-label");
    var inputs = qa("#contact .contact-right .form-input");
    var textarea = q("#contact .contact-right .form-textarea");
    setText(labels[0], fields.nameLabel);
    setText(labels[1], fields.emailLabel);
    setText(labels[2], fields.projectLabel);
    setText(labels[3], fields.messageLabel);
    if(inputs[0]) inputs[0].setAttribute("placeholder", text(fields.namePlaceholder));
    if(inputs[1]) inputs[1].setAttribute("placeholder", text(fields.emailPlaceholder));
    if(inputs[2]) inputs[2].setAttribute("placeholder", text(fields.projectPlaceholder));
    if(textarea) textarea.setAttribute("placeholder", text(fields.messagePlaceholder));
    var btn = q("#contact .form-submit");
    if(btn) setText(btn, sec.submitText || "Send Message →");
  }
  function renderFooter(data){
    var sec = data.footer || {};
    setText(q("footer .footer-logo"), sec.logo);
    setText(q("footer .footer-copy"), sec.copyright);
    var root = q("footer .social-links");
    if(root){
      root.innerHTML = arr(sec.socialLinks).map(function(link){
        return '<a href="' + esc(link.href || "#") + '" title="' + esc(link.label) + '">' + esc(link.label) + "</a>";
      }).join("");
    }
  }
  function applyOrderAndVisibility(content){
    var page = content && content.page ? content.page : {};
    var sections = arr(page.sections);
    var byType = {};
    sections.forEach(function(section){ if(section && section.type) byType[section.type] = section; });
    Object.keys(sectionSelectorMap).forEach(function(type){});
    ["nav","hero","showreel","services","portfolio","tools","process","testimonials","pricing","contact","footer"].forEach(function(type){
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
    var btn = q("#contact .form-submit");
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
      var inputs = qa("#contact .contact-right .form-input");
      var textarea = q("#contact .contact-right .form-textarea");
      var name = inputs[0] ? String(inputs[0].value || "").trim() : "";
      var email = inputs[1] ? String(inputs[1].value || "").trim() : "";
      var project = inputs[2] ? String(inputs[2].value || "").trim() : "";
      var message = textarea ? String(textarea.value || "").trim() : "";
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
        body: JSON.stringify({ name: name, email: email, business_type: project, message: message })
      }).then(function(r){
        if(!r.ok) throw new Error("submit_failed");
        return r.json();
      }).then(function(){
        status.style.color = "#e8c97a";
        status.textContent = contact.successText || "Message sent.";
        inputs.forEach(function(input){ input.value = ""; });
        if(textarea) textarea.value = "";
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
      renderNav(data);
      renderHero(data);
      renderShowreel(data);
      renderServices(data);
      renderPortfolio(data);
      renderTools(data);
      renderProcess(data);
      renderTestimonials(data);
      renderPricing(data);
      renderContact(data);
      renderFooter(data);
      ["hero","showreel","services","portfolio","tools","process","testimonials","pricing","contact"].forEach(function(type){
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
