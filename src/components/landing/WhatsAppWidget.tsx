"use client";

import { useEffect, useMemo, useState } from "react";
import type { HomepageContent } from "@/content/homepage";
import Image from "next/image";

type Props = {
  content: HomepageContent;
};

function digitsOnly(v: string) {
  return v.replace(/[^0-9]/g, "");
}

export function WhatsAppWidget({ content }: Props) {
  const cfg = content.whatsapp;
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [suppressedOnTinyTop, setSuppressedOnTinyTop] = useState(false);

  const data = useMemo(() => {
    if (!cfg || !cfg.enabled) return null;
    const phoneDigits = digitsOnly(cfg.phone || "");
    if (!phoneDigits.length) return null;
    const message = (cfg.message || "").trim();
    const url = `https://wa.me/${phoneDigits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
    const headerColor = (cfg.headerColorHex || "#25D366").trim() || "#25D366";
    const position = cfg.position === "left" ? "left" : "right";
    const delayMs = typeof cfg.delayMs === "number" && cfg.delayMs >= 0 ? cfg.delayMs : 0;
    const autoOpen = Boolean(cfg.autoOpen);

    return {
      url,
      tooltip: cfg.tooltip || "Chat with us!",
      modalTitle: cfg.modalTitle || content.header.brandText || "Shaditz",
      modalSubtitle: cfg.modalSubtitle || "Usually replies instantly",
      buttonText: cfg.buttonText || "Start Chat",
      avatarUrl:
        cfg.avatar?.url ||
        content.site?.favicon?.url ||
        "/favicon.png",
      headerColor,
      position,
      delayMs,
      autoOpen,
    };
  }, [cfg, content.header.brandText, content.site?.favicon?.url]);

  useEffect(() => {
    if (!data) return;
    const t = window.setTimeout(() => {
      setVisible(true);
      if (data.autoOpen) setOpen(true);
    }, data.delayMs);
    return () => window.clearTimeout(t);
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const mq = window.matchMedia("(max-width: 360px)");
    const update = () => {
      const shouldSuppress = mq.matches && window.scrollY < 520;
      setSuppressedOnTinyTop(shouldSuppress);
      if (shouldSuppress) setOpen(false);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const anyMq = mq as unknown as {
      addEventListener?: (type: "change", listener: () => void) => void;
      removeEventListener?: (type: "change", listener: () => void) => void;
      addListener?: (listener: () => void) => void;
      removeListener?: (listener: () => void) => void;
    };
    if (anyMq.addEventListener) anyMq.addEventListener("change", update);
    else if (anyMq.addListener) anyMq.addListener(update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (anyMq.removeEventListener) anyMq.removeEventListener("change", update);
      else if (anyMq.removeListener) anyMq.removeListener(update);
    };
  }, [data]);

  if (!data) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .whatsapp-widget{position:fixed;bottom:30px;${data.position === "left" ? "left:30px" : "right:30px"};z-index:9999;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
          .whatsapp-widget__button{width:60px;height:60px;border-radius:9999px;background:#25D366;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(37,211,102,.4);display:flex;align-items:center;justify-content:center;transition:all .3s ease;animation:slideInUp .8s ease .2s both}
          .whatsapp-widget__button:hover{transform:scale(1.1);box-shadow:0 6px 20px rgba(37,211,102,.6)}
          .whatsapp-widget__button svg{width:32px;height:32px;fill:white}
          .whatsapp-widget__tooltip{position:absolute;bottom:75px;right:0;background:rgba(255,255,255,.95);backdrop-filter:blur(12px);padding:12px 20px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.15);white-space:nowrap;font-size:14px;font-weight:600;color:#111827;opacity:0;visibility:hidden;transition:all .3s ease}
          .whatsapp-widget__button:hover + .whatsapp-widget__tooltip{opacity:1;visibility:visible}
          .whatsapp-widget__modal{position:fixed;bottom:100px;${data.position === "left" ? "left:30px" : "right:30px"};width:360px;max-width:calc(100vw - 40px);background:white;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,.2);overflow:hidden;opacity:0;visibility:hidden;transform:scale(.9) translateY(20px);transition:all .3s ease;z-index:10000}
          .whatsapp-widget__modal.active{opacity:1;visibility:visible;transform:scale(1) translateY(0)}
          .whatsapp-widget__modal-header{background:${data.headerColor};padding:20px;display:flex;align-items:center;gap:12px}
          .whatsapp-widget__modal-avatar{width:50px;height:50px;border-radius:9999px;border:2px solid white;object-fit:cover;background:rgba(255,255,255,.2)}
          .whatsapp-widget__modal-info h3{margin:0;color:white;font-size:16px;font-weight:700}
          .whatsapp-widget__modal-info p{margin:4px 0 0 0;color:rgba(255,255,255,.9);font-size:13px}
          .whatsapp-widget__modal-close{margin-left:auto;background:none;border:none;color:white;cursor:pointer;font-size:24px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:9999px;transition:background .2s}
          .whatsapp-widget__modal-close:hover{background:rgba(255,255,255,.2)}
          .whatsapp-widget__modal-body{padding:20px}
          .whatsapp-widget__modal-message{background:#f3f4f6;padding:12px 16px;border-radius:12px;margin-bottom:16px;font-size:14px;line-height:1.5;color:#111827}
          .whatsapp-widget__modal-button{width:100%;background:${data.headerColor};color:white;border:none;padding:14px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px}
          .whatsapp-widget__modal-button:hover{filter:brightness(.95);transform:translateY(-2px);box-shadow:0 4px 12px rgba(37,211,102,.3)}
          @keyframes slideInUp{from{opacity:0;transform:translateY(30px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}
          @media (max-width:479px){.whatsapp-widget{bottom:max(16px,env(safe-area-inset-bottom));${data.position === "left" ? "left:14px" : "right:14px"}}.whatsapp-widget__button{width:52px;height:52px}.whatsapp-widget__button svg{width:28px;height:28px}.whatsapp-widget__tooltip{display:none}.whatsapp-widget__modal{bottom:82px;${data.position === "left" ? "left:14px" : "right:14px"};width:calc(100vw - 28px);border-radius:16px}}
        `,
        }}
      />
      <div className="whatsapp-widget" style={{ display: visible && !suppressedOnTinyTop ? "block" : "none" }}>
        <button
          type="button"
          className="whatsapp-widget__button"
          aria-label={data.tooltip}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.164 0 0 7.163 0 16c0 2.828.74 5.48 2.031 7.781L0 32l8.438-2.219A15.93 15.93 0 0016 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm0 29.333c-2.547 0-4.98-.719-7.063-1.948l-.5-.313-5.188 1.365 1.385-5.052-.344-.531A13.299 13.299 0 012.667 16c0-7.364 5.969-13.333 13.333-13.333S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.292-9.958c-.396-.198-2.354-1.156-2.719-1.292-.365-.135-.635-.198-.896.198-.26.396-1.021 1.292-1.25 1.563-.229.26-.458.302-.854.104-.396-.198-1.677-.615-3.188-1.958-1.177-1.042-1.969-2.333-2.198-2.729-.229-.396-.021-.614.177-.812.177-.177.396-.458.594-.688.198-.229.26-.396.396-.656.135-.26.062-.49-.031-.688-.094-.198-.896-2.146-1.229-2.938-.323-.771-.646-.667-.896-.677-.229-.01-.49-.01-.75-.01s-.688.094-1.042.49c-.365.396-1.385 1.354-1.385 3.302s1.417 3.833 1.615 4.094c.198.26 2.771 4.229 6.708 5.927.938.406 1.667.646 2.24.833.938.292 1.792.25 2.469.156.75-.115 2.354-.969 2.688-1.896.333-.927.333-1.719.229-1.896-.094-.177-.354-.281-.75-.479z" />
          </svg>
        </button>
        <div className="whatsapp-widget__tooltip">{data.tooltip}</div>

        <div className={`whatsapp-widget__modal${open ? " active" : ""}`} role="dialog" aria-modal="false">
          <div className="whatsapp-widget__modal-header">
            <Image
              src={data.avatarUrl || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="}
              alt={data.modalTitle}
              className="whatsapp-widget__modal-avatar"
              width={50}
              height={50}
              unoptimized
            />
            <div className="whatsapp-widget__modal-info">
              <h3>{data.modalTitle}</h3>
              <p>{data.modalSubtitle}</p>
            </div>
            <button
              type="button"
              className="whatsapp-widget__modal-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="whatsapp-widget__modal-body">
            <div className="whatsapp-widget__modal-message">{cfg?.message}</div>
            <button
              type="button"
              className="whatsapp-widget__modal-button"
              onClick={() => {
                window.open(data.url, "_blank", "noreferrer");
                setOpen(false);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                <path d="M16 0C7.164 0 0 7.163 0 16c0 2.828.74 5.48 2.031 7.781L0 32l8.438-2.219A15.93 15.93 0 0016 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm7.292 20.375c-.396-.198-2.354-1.156-2.719-1.292-.365-.135-.635-.198-.896.198-.26.396-1.021 1.292-1.25 1.563-.229.26-.458.302-.854.104-.396-.198-1.677-.615-3.188-1.958-1.177-1.042-1.969-2.333-2.198-2.729-.229-.396-.021-.614.177-.812.177-.177.396-.458.594-.688.198-.229.26-.396.396-.656.135-.26.062-.49-.031-.688-.094-.198-.896-2.146-1.229-2.938-.323-.771-.646-.667-.896-.677-.229-.01-.49-.01-.75-.01s-.688.094-1.042.49c-.365.396-1.385 1.354-1.385 3.302s1.417 3.833 1.615 4.094c.198.26 2.771 4.229 6.708 5.927.938.406 1.667.646 2.24.833.938.292 1.792.25 2.469.156.75-.115 2.354-.969 2.688-1.896.333-.927.333-1.719.229-1.896-.094-.177-.354-.281-.75-.479z" />
              </svg>
              {data.buttonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
