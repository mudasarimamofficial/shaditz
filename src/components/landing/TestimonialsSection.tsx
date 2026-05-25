"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { HomepageContent } from "@/content/homepage";
import Image from "next/image";

type PageSection = NonNullable<HomepageContent["page"]>["sections"][number];

type Props = {
  section: PageSection;
};

type ProofItem = {
  id: string;
  name: string;
  role: string;
  body: string;
  rating: number;
  avatarUrl: string;
  metric: string;
  isRealTestimonial: boolean;
};

function objectValue<T extends Record<string, unknown>>(value: unknown) {
  if (!value || typeof value !== "object") return null;
  return value as T;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getAvatarUrl(value: unknown) {
  const avatar = objectValue<{ url?: unknown }>(value);
  return asString(avatar?.url);
}

function asBoolean(value: unknown) {
  return value === true;
}

function isGeneratedAvatar(url: string) {
  return /text_to_image|picsum\.photos|coresg-normal/i.test(url);
}

function fallbackProofBody(index: number) {
  const bodies = [
    "Campaign activity is measured around qualified conversations, booked calls, and follow-up discipline instead of vanity reach.",
    "Prospects are segmented before outreach, so the system can prioritize fit, intent, and high-ticket readiness.",
    "Pipeline visibility keeps the coach focused on the highest-leverage conversations and the next optimization lever.",
    "Follow-up windows are tracked tightly so warm leads do not disappear during busy delivery weeks.",
    "The operating rhythm is built for weekly optimization, not one-off campaign guessing.",
    "Every stage is designed to protect brand authority while increasing sales-call consistency.",
  ];
  return bodies[index % bodies.length];
}

function fallbackProofTitle(index: number) {
  const titles = [
    "Qualified conversations",
    "Audience fit",
    "Pipeline visibility",
    "Follow-up discipline",
    "Weekly optimization",
    "Brand-safe outreach",
  ];
  return titles[index % titles.length];
}

function fallbackProofMetric(index: number) {
  const metrics = ["Intent", "Fit", "Clarity", "Speed", "Iteration", "Authority"];
  return metrics[index % metrics.length];
}

function hasClaimyNumbers(value: string) {
  return /\d|\$|%|\+/.test(value);
}

export function TestimonialsSection({ section }: Props) {
  const settings = useMemo(() => objectValue<Record<string, unknown>>(section.settings) || {}, [section.settings]);
  const eyebrow = asString(settings.eyebrow) || "Proof of pipeline";
  const heading = asString(settings.heading) || "Built for coaches who need booked calls, not vanity metrics";
  const subcopy =
    asString(settings.subcopy) ||
    "Concrete pipeline indicators and client-style proof before asking a serious buyer to choose a partnership tier.";
  const stats = useMemo(
    () =>
      Array.isArray(settings.stats)
        ? settings.stats
            .map((stat) => objectValue<{ value?: unknown; label?: unknown }>(stat))
            .filter(Boolean)
            .map((stat) => ({ value: asString(stat?.value), label: asString(stat?.label) }))
            .filter((stat) => stat.value && stat.label)
        : [],
    [settings],
  );

  const showStats = useMemo(() => {
    if (!stats.length) return false;
    const explicit = typeof (settings as any).statsVerified === "boolean" ? Boolean((settings as any).statsVerified) : false;
    if (explicit) return true;
    return !stats.some((s) => hasClaimyNumbers(`${s.value} ${s.label}`));
  }, [settings, stats]);

  const blocks = Array.isArray(section.blocks) ? section.blocks : [];
  const items: ProofItem[] = blocks
    .filter((block) => block.type === "testimonial" || block.type === "proof_card")
    .map((block, index) => {
      const content = block.content || {};
      const avatarUrl = getAvatarUrl((content as any).avatar);
      const explicitlyReal = asBoolean((content as any).isReal) || asBoolean((content as any).verified);
      const isRealTestimonial = block.type === "testimonial" && explicitlyReal && !isGeneratedAvatar(avatarUrl);
      const isProofCard = block.type === "proof_card";
      const quote = asString((content as any).quote || (content as any).body || (content as any).description);
      const bodyText = isProofCard
        ? asString((content as any).body || (content as any).description || (content as any).quote)
        : quote;
      const safeBody = !isRealTestimonial && hasClaimyNumbers(bodyText) ? "" : bodyText;
      const metricRaw = asString((content as any).metric);
      const safeMetric = !isRealTestimonial && hasClaimyNumbers(metricRaw) ? "" : metricRaw;
      return {
        id: block.id,
        name: isRealTestimonial ? asString((content as any).name) || "Shaditz client" : fallbackProofTitle(index),
        role:
          isRealTestimonial
            ? asString((content as any).role || (content as any).title) || "Shaditz client"
            : "System proof point",
        body: (safeBody || "").trim().length ? safeBody : fallbackProofBody(index),
        rating: asNumber(content.rating) || 5,
        avatarUrl,
        metric: (safeMetric || "").trim().length
          ? safeMetric
          : isRealTestimonial
            ? "Qualified pipeline"
            : fallbackProofMetric(index),
        isRealTestimonial,
      };
    })
    .filter((item) => item.body.trim().length);

  const limited = useMemo(() => {
    const hasRealTestimonials = items.some((item) => item.isRealTestimonial);
    return items.slice(0, hasRealTestimonials ? 10 : 6);
  }, [items]);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [perView, setPerView] = useState(3);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : 3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const pageCount = Math.max(1, Math.ceil(limited.length / perView));

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const target = el;
    function onScroll() {
      const step = target.clientWidth;
      const idx = step ? Math.round(target.scrollLeft / step) : 0;
      setPageIndex(Math.max(0, Math.min(pageCount - 1, idx)));
    }
    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [pageCount]);

  function scrollToPage(nextIndex: number) {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.max(0, Math.min(pageCount - 1, nextIndex));
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }

  if (!limited.length) return null;

  return (
    <section className="proof-section" id={section.id} data-reveal>
      <div className="proof-shell">
        <div className="proof-copy">
          <div className="proof-eyebrow">
            <span />
            {eyebrow}
          </div>
          <h2>{heading}</h2>
          <p>{subcopy}</p>
        </div>

        {showStats ? (
          <div className="proof-stats" aria-label="Shaditz proof metrics">
            {stats.map((stat) => (
              <div key={`${stat.value}-${stat.label}`} className="proof-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="proof-carousel" aria-label="Shaditz proof signals">
          <div className="proof-carousel-controls">
            <button
              type="button"
              className="proof-carousel-btn"
              onClick={() => scrollToPage(pageIndex - 1)}
              disabled={pageIndex <= 0}
                  aria-label="Previous proof signals"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="proof-carousel-btn"
              onClick={() => scrollToPage(pageIndex + 1)}
              disabled={pageIndex >= pageCount - 1}
                  aria-label="Next proof signals"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div
            ref={trackRef}
            className="proof-carousel-track"
            style={{
              ...(perView ? ({ ["--perView" as any]: String(perView) } as any) : null),
            }}
          >
            {limited.map((item) => (
              <article
                key={item.id}
                className={`proof-card ${item.isRealTestimonial ? "" : "proof-card--signal"}`}
                aria-label={item.isRealTestimonial ? `Review from ${item.name}` : `Proof signal: ${item.name}`}
              >
                <div className="proof-card-top">
                  {item.isRealTestimonial ? (
                    <div className="proof-avatar-wrap">
                      {item.avatarUrl ? (
                      <Image src={item.avatarUrl} alt={item.name} className="proof-avatar" width={44} height={44} unoptimized />
                      ) : (
                        <div className="proof-avatar proof-avatar-fallback" aria-hidden="true" />
                      )}
                    </div>
                  ) : (
                    <div className="proof-signal-mark" aria-hidden="true">
                      <span />
                    </div>
                  )}
                  <div>
                    <div className="proof-name">{item.name}</div>
                    <div className="proof-role">{item.role}</div>
                  </div>
                </div>
                <p className="proof-quote">
                  {item.isRealTestimonial ? <>&quot;{item.body}&quot;</> : item.body}
                </p>
                <div className="proof-card-bottom">
                  {item.isRealTestimonial ? (
                    <div className="proof-stars" aria-label={`${Math.max(1, Math.min(5, item.rating))} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, index) => {
                        const filled = index < Math.max(1, Math.min(5, item.rating));
                        return (
                          <Star
                            key={index}
                            size={14}
                            className={filled ? "proof-star is-filled" : "proof-star"}
                            aria-hidden="true"
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="proof-signal-label">Pipeline signal</div>
                  )}
                  <span>{item.metric}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="proof-carousel-dots" aria-label="Proof signal pages">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`proof-dot ${i === pageIndex ? "is-active" : ""}`}
                aria-label={`Go to reviews page ${i + 1}`}
                aria-current={i === pageIndex}
                onClick={() => scrollToPage(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
