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

export function RebuiltLandingFrame({ content, templateHtml, device = "desktop", className, height = "100vh" }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [fetchedTemplate, setFetchedTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (templateHtml && templateHtml.trim().length) return;
    let alive = true;
    fetch("/shaditz-rebuilt-1.html", { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`template_fetch_${r.status}`))))
      .then((t) => {
        if (!alive) return;
        setFetchedTemplate(t);
      })
      .catch(() => {
        if (!alive) return;
        setFetchedTemplate("");
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
      header: content.header,
      hero: content.hero,
      pricing: content.pricing,
      application: content.application,
      footer: content.footer,
      whatsapp: content.whatsapp,
      rebuilt: content.rebuilt,
      page: content.page,
      socialLinks: content.socialLinks,
      socialLinksV2: content.socialLinksV2,
    };

    const bootstrap = `
<script id="cf-rebuilt-bootstrap">
(function(){
  function q(sel){return document.querySelector(sel);}
  function qa(sel){return Array.prototype.slice.call(document.querySelectorAll(sel));}
  function setText(el, text){ if(!el) return; el.textContent = String(text || ""); }
  function setRichText(el, raw){
    if(!el) return;
    var s = String(raw || "");
    s = s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    s = s.replace(/&lt;(\\/?)\\s*(strong|em)\\s*&gt;/gi, "<$1$2>");
    s = s.replace(/&lt;br\\s*\\/?&gt;/gi, "<br>");
    el.innerHTML = s;
  }
  function clampArray(arr, n){ var out = []; for (var i=0;i<n;i++){ out.push(arr && arr[i] ? arr[i] : ""); } return out; }
  function safeItems(arr){ return Array.isArray(arr) ? arr.map(function(v){ return typeof v === "string" ? v : ""; }).filter(Boolean) : []; }
  function sectionByType(content, type){
    var sections = content && content.page && Array.isArray(content.page.sections) ? content.page.sections : [];
    for (var i=0; i<sections.length; i++){
      if (sections[i] && sections[i].type === type) return sections[i];
    }
    return null;
  }
  function sectionBg(section){
    var settings = section && section.settings ? section.settings : {};
    var background = settings && settings.background ? settings.background : {};
    var type = typeof settings.backgroundType === "string" ? settings.backgroundType : "";
    var image = typeof settings.backgroundImage === "string" ? settings.backgroundImage : "";
    var url = typeof background.url === "string" ? background.url : "";
    var overlay = typeof settings.overlayColor === "string" ? settings.overlayColor : "";
    var color = typeof settings.backgroundColor === "string"
      ? settings.backgroundColor
      : (typeof settings.backgroundColorHex === "string" ? settings.backgroundColorHex : "");
    return { type: type, image: image || url, overlay: overlay, color: color };
  }
  function applyBg(target, cfg){
    if(!target) return;
    target.style.backgroundImage = cfg && cfg.type === "image" && cfg.image ? ("url(" + cfg.image + ")") : "";
    target.style.backgroundSize = cfg && cfg.type === "image" && cfg.image ? "cover" : "";
    target.style.backgroundPosition = cfg && cfg.type === "image" && cfg.image ? "center" : "";
    target.style.backgroundRepeat = cfg && cfg.type === "image" && cfg.image ? "no-repeat" : "";
    target.style.backgroundColor = cfg && cfg.type === "color" && cfg.color ? cfg.color : "";
  }
  function applyOverlay(target, rgba){
    if(!target) return;
    var ov = target.querySelector(":scope > .cf-bg-overlay");
    if(!rgba){
      if(ov && ov.parentNode) ov.parentNode.removeChild(ov);
      return;
    }
    if(!ov){
      ov = document.createElement("div");
      ov.className = "cf-bg-overlay";
      ov.style.position = "absolute";
      ov.style.inset = "0";
      ov.style.pointerEvents = "none";
      target.insertBefore(ov, target.firstChild || null);
    }
    ov.style.backgroundColor = rgba;
  }
  function applySectionBackgrounds(content){
    var heroSection = sectionByType(content, "hero");
    var heroCfg = sectionBg(heroSection);
    var heroFallback = content && content.hero && content.hero.backgroundImage && content.hero.backgroundImage.url
      ? String(content.hero.backgroundImage.url)
      : "";
    if(!heroCfg.image && heroFallback){
      heroCfg.image = heroFallback;
      if(!heroCfg.type) heroCfg.type = "image";
    }
    var heroEl = q(".hero");
    if(heroEl){
      heroEl.style.position = heroEl.style.position || "relative";
      applyBg(heroEl, heroCfg);
      applyOverlay(heroEl, heroCfg.overlay);
    }

    var sectionMap = [
      { type: "founder", selector: "#founder", contentKey: "rebuilt", nestedKey: "founder" },
      { type: "promise", selector: "#promise", contentKey: "rebuilt", nestedKey: "promise" },
      { type: "how", selector: "#how", contentKey: "rebuilt", nestedKey: "how" },
      { type: "honest", selector: "#honest", contentKey: "rebuilt", nestedKey: "honest" },
      { type: "pricing", selector: "#pricing", contentKey: "pricing", nestedKey: null },
      { type: "application", selector: "#apply", contentKey: "application", nestedKey: null }
    ];
    for (var i=0; i<sectionMap.length; i++){
      var item = sectionMap[i];
      var sec = sectionByType(content, item.type);
      var cfg = sectionBg(sec);
      var fallbackImage = "";
      if(item.contentKey === "pricing" && content && content.pricing && content.pricing.backgroundImage && content.pricing.backgroundImage.url){
        fallbackImage = String(content.pricing.backgroundImage.url);
      }
      if(item.contentKey === "application" && content && content.application && content.application.backgroundImage && content.application.backgroundImage.url){
        fallbackImage = String(content.application.backgroundImage.url);
      }
      if(!cfg.image && fallbackImage){
        cfg.image = fallbackImage;
        if(!cfg.type) cfg.type = "image";
      }
      var el = q(item.selector);
      if(!el) continue;
      el.style.position = el.style.position || "relative";
      applyBg(el, cfg);
      applyOverlay(el, cfg.overlay);
    }
  }
  function applySectionEnabled(map){
    if(!map) return;
    var byType = {};
    if(map.sections && map.sections.length){
      for (var i=0;i<map.sections.length;i++){
        var s = map.sections[i];
        if(!s || !s.type) continue;
        byType[String(s.type)] = s.enabled !== false;
      }
    }
    function show(idOrSelector, enabled){
      var el = document.getElementById(idOrSelector) || q(idOrSelector);
      if(!el) return;
      el.style.display = enabled ? "" : "none";
    }
    show(".hero", byType.hero !== false);
    show(".trust-strip", byType.trust_strip !== false);
    show("#founder", byType.founder !== false);
    show("#promise", byType.promise !== false);
    show("#how", byType.how !== false);
    show("#honest", byType.honest !== false);
    show("#pricing", byType.pricing !== false);
    show("#apply", byType.application !== false);
    show("footer", byType.footer !== false);
  }

  function applyContent(content){
    try{
      if(!content) return;
      var rebuilt = content.rebuilt || {};

      var brandText = (content.header && content.header.brandText) ? String(content.header.brandText) : "Shaditz";
      setText(q(".nav-logo"), brandText);
      setText(q("footer .footer-logo"), (content.footer && content.footer.brandText) ? content.footer.brandText : brandText);

      var navItems = (content.header && Array.isArray(content.header.nav)) ? content.header.nav : [];
      var navCta = content.header && content.header.primaryCta ? content.header.primaryCta : null;
      var navAnchors = qa("nav .nav-links a");
      if(navAnchors.length >= 4){
        for (var i=0;i<3;i++){
          var n = navItems[i] || null;
          if(n && n.label) setText(navAnchors[i], n.label);
          if(n && n.href) navAnchors[i].setAttribute("href", n.href);
        }
        if(navCta && navCta.text) setText(navAnchors[3], navCta.text);
        if(navCta && navCta.href) navAnchors[3].setAttribute("href", navCta.href);
      }

      var mobileAnchors = qa("#mobile-menu a");
      if(mobileAnchors.length >= 4){
        for (var j=0;j<3;j++){
          var mn = navItems[j] || null;
          if(mn && mn.label) setText(mobileAnchors[j], mn.label);
          if(mn && mn.href) mobileAnchors[j].setAttribute("href", mn.href);
        }
        if(navCta && navCta.text) setText(mobileAnchors[3], navCta.text);
        if(navCta && navCta.href) mobileAnchors[3].setAttribute("href", navCta.href);
      }

      var hero = rebuilt.hero || {};
      if(hero.tag) setText(q(".hero-tag"), hero.tag);
      if(hero.headlineLine1 || hero.headlineLine2Prefix || hero.headlineHighlight){
        var h1 = q(".hero h1");
        if(h1){
          var line1 = String(hero.headlineLine1 || "");
          var line2p = String(hero.headlineLine2Prefix || "");
          var hi = String(hero.headlineHighlight || "");
          setRichText(h1, line1 + "<br>" + line2p + "<em>" + hi + "</em>");
        }
      }
      if(hero.subcopyBeforeStrong || hero.subcopyStrong || hero.subcopyAfterStrong){
        var p = q(".hero-sub");
        if(p){
          var pre = String(hero.subcopyBeforeStrong || "");
          var strong = String(hero.subcopyStrong || "");
          var post = String(hero.subcopyAfterStrong || "");
          setRichText(p, pre + "<strong>" + strong + "</strong>" + post);
        }
      }
      if(hero.note) setText(q(".hero-note"), hero.note);

      var heroActions = qa(".hero-actions a");
      if(heroActions.length >= 2){
        var cta1 = content.hero && content.hero.primaryCta ? content.hero.primaryCta : null;
        var cta2 = content.hero && content.hero.secondaryCta ? content.hero.secondaryCta : null;
        if(cta1){
          if(cta1.text) setText(heroActions[0], cta1.text);
          if(cta1.href) heroActions[0].setAttribute("href", cta1.href);
        }
        if(cta2){
          if(cta2.text) setText(heroActions[1], cta2.text);
          if(cta2.href) heroActions[1].setAttribute("href", cta2.href);
        }
      }

      var trust = rebuilt.trustStrip || {};
      var trustItems = clampArray(trust.items || [], 5);
      var trustEls = qa(".trust-strip .trust-item");
      if(trustEls.length){
        for (var t=0;t<trustEls.length;t++){
          if(trustItems[t]) setText(trustEls[t], trustItems[t]);
        }
      }

      var founder = rebuilt.founder || {};
      if(founder.label) setText(q("#founder .founder-label"), founder.label);
      if(founder.avatarText) setText(q("#founder .founder-avatar"), founder.avatarText);
      if(founder.name) setText(q("#founder .founder-name"), founder.name);
      if(founder.title) setText(q("#founder .founder-title"), founder.title);
      if(founder.quote) setText(q("#founder .founder-quote"), founder.quote);
      var founderPs = qa("#founder .founder-body p");
      var fp = safeItems(founder.paragraphs);
      if(founderPs.length && fp.length){
        for (var fi=0; fi<founderPs.length; fi++){
          if(fp[fi]) setRichText(founderPs[fi], fp[fi]);
        }
      }

      var promise = rebuilt.promise || {};
      if(promise.tag) setText(q("#promise .section-tag"), promise.tag);
      if(promise.heading) setText(q("#promise .section-title"), promise.heading);
      if(promise.subcopy) setText(q("#promise .section-body"), promise.subcopy);
      var promiseCards = Array.isArray(promise.cards) ? promise.cards : [];
      var cardEls = qa("#promise .promise-card");
      for (var ci=0; ci<cardEls.length; ci++){
        var c = promiseCards[ci] || null;
        if(!c) continue;
        setText(cardEls[ci].querySelector(".promise-title"), c.title);
        setText(cardEls[ci].querySelector(".promise-body"), c.body);
      }

      var how = rebuilt.how || {};
      if(how.tag) setText(q("#how .section-tag"), how.tag);
      if(how.heading) setText(q("#how .section-title"), how.heading);
      if(how.subcopy) setText(q("#how .section-body"), how.subcopy);
      var steps = Array.isArray(how.steps) ? how.steps : [];
      var stepEls = qa("#how .step");
      for (var si=0; si<stepEls.length; si++){
        var st = steps[si] || null;
        if(!st) continue;
        setText(stepEls[si].querySelector(".step-title"), st.title);
        setText(stepEls[si].querySelector(".step-body"), st.body);
      }

      var honest = rebuilt.honest || {};
      if(honest.tag){
        var honestTag = q("#honest .section-tag");
        if(honestTag) setText(honestTag, honest.tag);
      }
      if(honest.quote) setText(q("#honest .honest-quote"), honest.quote);
      var honestPs = qa("#honest .honest-body p");
      var hp = safeItems(honest.paragraphs);
      if(honestPs.length && hp.length){
        for (var hi=0; hi<honestPs.length; hi++){
          if(hp[hi]) setRichText(honestPs[hi], hp[hi]);
        }
      }
      if(honest.pledgeTitle) setText(q("#honest .honest-pledge-title"), honest.pledgeTitle);
      var pledgeItems = safeItems(honest.pledgeItems);
      var pledgeEls = qa("#honest .honest-pledge-items li");
      for (var pi=0; pi<pledgeEls.length; pi++){
        if(pledgeItems[pi]) setText(pledgeEls[pi], pledgeItems[pi]);
      }

      var pricing = content.pricing || {};
      if(pricing.tag) setText(q("#pricing .founding-header .section-tag"), pricing.tag);
      if(pricing.heading) setText(q("#pricing .founding-header .section-title"), pricing.heading);
      if(pricing.subcopy){
        var sideNote = q("#pricing .founding-header p");
        if(sideNote) setText(sideNote, pricing.subcopy);
      }
      if(pricing.note) setText(q("#pricing .founding-note"), pricing.note);

      var tiers = Array.isArray(pricing.tiers) ? pricing.tiers : [];
      var tierEls = qa("#pricing .tier");
      for (var ti=0; ti<tierEls.length; ti++){
        var tr = tiers[ti] || null;
        if(!tr) continue;
        var badge = tierEls[ti].querySelector(".tier-badge");
        if(badge){
          if(tr.highlight && tr.highlight.badge) setText(badge, tr.highlight.badge);
          if(tr.badge) setText(badge, tr.badge);
        }
        if(tr.highlight){ tierEls[ti].classList.add("featured"); } else { tierEls[ti].classList.remove("featured"); }
        setText(tierEls[ti].querySelector(".tier-name"), tr.name);
        setText(tierEls[ti].querySelector(".tier-desc"), tr.tagline);
        var priceNum = tierEls[ti].querySelector(".tier-price-num");
        if(priceNum) setText(priceNum, tr.price);
        var priceWas = tierEls[ti].querySelector(".tier-price-was");
        if(priceWas && tr.priceWas) setText(priceWas, tr.priceWas);
        var priceMo = tierEls[ti].querySelector(".tier-price-mo");
        if(priceMo) setText(priceMo, tr.priceSuffix || "");
        var cta = tierEls[ti].querySelector("a.tier-cta");
        if(cta){
          if(tr.ctaText) setText(cta, tr.ctaText);
          if(tr.ctaHref) cta.setAttribute("href", tr.ctaHref);
        }
        var bulletEls = Array.prototype.slice.call(tierEls[ti].querySelectorAll(".tier-features li"));
        var bullets = Array.isArray(tr.bullets) ? tr.bullets : [];
        for (var bi=0; bi<bulletEls.length; bi++){
          if(typeof bullets[bi] === "string" && bullets[bi]) setText(bulletEls[bi], bullets[bi]);
        }
      }

      var app = content.application || {};
      if(app.headingTag) setText(q("#apply .form-left .section-tag"), app.headingTag);
      if(app.heading){
        var applyH = q("#apply .form-left .section-title");
        if(applyH) setRichText(applyH, String(app.heading || "").split("\\n").join("<br>"));
      }
      if(app.subcopy){
        var applyBody = q("#apply .form-left .section-body");
        if(applyBody) setText(applyBody, app.subcopy);
      }
      if(Array.isArray(app.promiseItems)){
        var piEls = qa("#apply .form-promise-item");
        for (var api=0; api<piEls.length; api++){
          var it = app.promiseItems[api] || null;
          if(!it) continue;
          var strongEl = piEls[api].querySelector("strong");
          var spanEl = piEls[api].querySelector("span");
          if(strongEl) setText(strongEl, it.title);
          if(spanEl) setText(spanEl, it.body);
        }
      }
      if(app.formTitle) setText(q("#apply .form-title"), app.formTitle);
      if(app.formSubtitle) setText(q("#apply .form-subtitle"), app.formSubtitle);

      var fields = app.fields || {};
      if(fields.firstNameLabel) setText(q('label[for="fname"]'), fields.firstNameLabel);
      if(fields.lastNameLabel) setText(q('label[for="lname"]'), fields.lastNameLabel);
      if(fields.emailLabel) setText(q('label[for="email"]'), fields.emailLabel);
      if(fields.revenueLabel) setText(q('label[for="revenue"]'), fields.revenueLabel);
      if(fields.bottleneckLabel) setText(q('label[for="bottleneck"]'), fields.bottleneckLabel);
      if(fields.firstNamePlaceholder) { var f = q("#fname"); if(f) f.setAttribute("placeholder", fields.firstNamePlaceholder); }
      if(fields.lastNamePlaceholder) { var l = q("#lname"); if(l) l.setAttribute("placeholder", fields.lastNamePlaceholder); }
      if(fields.emailPlaceholder) { var em = q("#email"); if(em) em.setAttribute("placeholder", fields.emailPlaceholder); }
      if(fields.bottleneckPlaceholder) { var b = q("#bottleneck"); if(b) b.setAttribute("placeholder", fields.bottleneckPlaceholder); }

      if(Array.isArray(fields.revenueOptions)){
        var sel = q("#revenue");
        if(sel){
          var placeholder = String(fields.revenuePlaceholder || "Select your range");
          var opts = ['<option value="">' + placeholder.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;") + "</option>"];
          for (var ro=0; ro<fields.revenueOptions.length; ro++){
            var opt = fields.revenueOptions[ro] || null;
            if(!opt) continue;
            var value = String(opt.value || "");
            var label = String(opt.label || "");
            opts.push(
              '<option value="' +
                value.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;") +
                '">' +
                label.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;") +
                "</option>"
            );
          }
          sel.innerHTML = opts.join("");
        }
      }

      if(app.submitText) setText(q("#apply .form-submit"), app.submitText);
      if(app.footnote) setText(q("#apply .form-disclaimer"), app.footnote);
      if(app.successTitle) setText(q("#apply #form-success h3"), app.successTitle);
      if(app.successBody) setText(q("#apply #form-success p"), app.successBody);

      var footer = content.footer || {};
      if(Array.isArray(footer.links)){
        var fLinks = qa("footer .footer-links li a");
        for (var fl=0; fl<fLinks.length; fl++){
          var link = footer.links[fl] || null;
          if(!link) continue;
          if(link.label) setText(fLinks[fl], link.label);
          if(link.href) fLinks[fl].setAttribute("href", link.href);
        }
      }
      if(footer.copyright) setText(q("footer .footer-copy"), footer.copyright);

      applySectionEnabled(content.page || {});
      applySectionBackgrounds(content);
    } catch(e){}
  }

  function closeMenu(){
    var menu = document.getElementById("mobile-menu");
    var btn = document.getElementById("hamburger");
    if(menu) menu.classList.remove("open");
    if(btn) btn.classList.remove("open");
  }

  function handleSubmit(){
    try{
      var fname = (document.getElementById("fname") || {}).value || "";
      var lname = (document.getElementById("lname") || {}).value || "";
      var email = (document.getElementById("email") || {}).value || "";
      var revenue = (document.getElementById("revenue") || {}).value || "";
      var message = (document.getElementById("bottleneck") || {}).value || "";

      if(!fname || !email){
        alert("Please fill in your name and email to apply.");
        return;
      }

      var btn = qa(".form-submit")[0];
      if(btn){ btn.disabled = true; btn.textContent = "Submitting…"; }
      fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ first_name: String(fname), last_name: String(lname), email: String(email), revenue: revenue ? String(revenue) : null, message: message ? String(message) : null })
      }).then(function(r){
        if(!r.ok) throw new Error("lead_submit_failed");
        return r.json();
      }).then(function(){
        var fc = document.getElementById("form-content");
        var fs = document.getElementById("form-success");
        if(fc) fc.style.display = "none";
        if(fs) fs.style.display = "block";
      }).catch(function(){
        alert("Something went wrong. Please try again.");
      }).finally(function(){
        if(btn){ btn.disabled = false; btn.textContent = "Submit Application →"; }
      });
    } catch(e){
      alert("Something went wrong. Please try again.");
    }
  }

  window.closeMenu = closeMenu;
  window.handleSubmit = handleSubmit;

  window.addEventListener("message", function(e){
    if(e.origin !== window.location.origin) return;
    var data = e.data || {};
    if(data.type === "shaditz_builder_preview" && data.content){
      applyContent(data.content);
      return;
    }
    if(data.type === "cf_rebuilt_apply" && data.content){
      applyContent(data.content);
      return;
    }
  });

  document.addEventListener("click", function(e){
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if(!a) return;
    var href = a.getAttribute("href") || "";
    if(href && href.charAt(0) === "#"){ closeMenu(); }
  }, true);

  try{
    applyContent(window.__CF_REBUILT_INITIAL__);
  } catch(e){}
})();
</script>
`;

    const initialVar = `<script>window.__CF_REBUILT_INITIAL__ = JSON.parse(${JSON.stringify(jsonForInline(initial))});</script>`;
    const deviceVar = `<script>document.documentElement.dataset.device=${JSON.stringify(device)};</script>`;
    const customCssTag = customCss.length
      ? `<style id="cf-rebuilt-custom-css">${escapeInlineRawText(customCss)}</style>`
      : "";
    const customJsTag = customJs.length
      ? `<script id="cf-rebuilt-custom-js">(function(){\n${escapeInlineRawText(customJs)}\n})();</script>`
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
      title="Rebuilt landing"
      className={className}
      data-cf-rebuilt="true"
      sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
      style={{ width: "100%", height, border: "none", background: "#0A0A0A" }}
      srcDoc={srcDoc}
    />
  );
}
