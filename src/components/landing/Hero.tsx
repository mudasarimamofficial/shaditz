import type { HomepageContent } from "@/content/homepage";
import type { PageSection } from "@/components/landing/sectionRegistry";
import Image from "next/image";

type Props = {
  content: HomepageContent;
  section?: PageSection;
};

type HeroMetric = {
  title: string;
  value: string;
  change?: string;
  icon?: string;
  tone?: "gold" | "blue" | "green";
};

export function Hero({ content, section }: Props) {
  const hero = content.hero as HomepageContent["hero"] & {
    proof?: { title?: string; eyebrow?: string; avatars?: { url: string; alt?: string }[] };
    metrics?: HeroMetric[];
    revenueVisual?: { value?: string; label?: string };
  };
  const trustText = hero.trust?.text || content.trust?.eyebrow || "";
  const trustPills = Array.isArray(hero.trust?.pills) ? hero.trust.pills.filter(Boolean) : [];
  const showBackground = (section?.settings as any)?.heroBackground !== false;
  const showPanel = (section?.settings as any)?.heroPanel !== false;
  const primaryHref = hero.primaryCta?.href || "#lead-form";
  const secondaryHref = hero.secondaryCta?.href || "#workflow";
  const primaryText = (hero.primaryCta?.text || "").toString();
  const secondaryText = (hero.secondaryCta?.text || "").toString();
  const allowProofNumbers = Boolean((hero as any).proofVerified || (hero as any).metricsVerified);
  const metricsRaw = Array.isArray(hero.metrics) && hero.metrics.length ? hero.metrics.slice(0, 3) : [];
  const metrics = metricsRaw.map((metric) => {
    if (allowProofNumbers) return metric;
    const unsafe = hasClaimyNumbers(metric.value) || hasClaimyNumbers(metric.change);
    if (!unsafe) return { ...metric, change: undefined };
    return { ...metric, value: fallbackMetricValue(metric.title), change: undefined };
  });
  const proof = hero.proof;
  const safeAvatars = Array.isArray(proof?.avatars)
    ? proof.avatars.filter((avatar) => avatar?.url && !isGeneratedAvatar(avatar.url))
    : [];
  const proofTitle =
    proof?.title && !/trusted by\s+\d+\+?\s+coaches/i.test(proof.title)
      ? proof.title
      : trustText || "Built for high-ticket coaching teams";
  const proofEyebrow =
    proof?.eyebrow && !/averaging\s+\d+\+?\s+booked calls/i.test(proof.eyebrow)
      ? proof.eyebrow
      : trustPills.length
        ? trustPills.join(" / ")
        : "Pipeline signals over vanity metrics";

  return (
    <section id="hero" className="hero-section">
      {showBackground ? <HeroBackground /> : null}

      <div className={`container hero-shell${showPanel ? "" : " hero-shell--no-panel"}`}>
        <div className="hero-content" data-reveal="left">
          {hero.badge?.text ? (
            <div className="hero-tagline">
              <span aria-hidden="true" />
              {hero.badge.text}
            </div>
          ) : null}

          <h1 className="hero-h1">
            {renderMultilineText(hero.heading?.prefix || "")}
            <em>{hero.heading?.highlight || ""}</em>
          </h1>

          {hero.subcopy ? <p className="hero-sub">{hero.subcopy}</p> : null}

          <div className="hero-ctas">
            {(hero.primaryCta as any)?.enabled !== false && primaryText ? (
              <a className="btn-primary hero-primary" href={primaryHref}>
                {primaryText}
                <ArrowIcon />
              </a>
            ) : null}
            {(hero.secondaryCta as any)?.enabled !== false && secondaryText ? (
              <a className="btn-ghost hero-secondary" href={secondaryHref}>
                {secondaryText}
                <ChevronDownIcon />
              </a>
            ) : null}
          </div>

          {proofTitle || proofEyebrow ? (
            <div className="hero-proof">
              {safeAvatars.length ? (
                <div className="hero-avatars" aria-hidden="true">
                  {safeAvatars.slice(0, 4).map((avatar, idx) => (
                    <Image
                      key={`${avatar.url}-${idx}`}
                      src={avatar.url}
                      alt={avatar.alt || ""}
                      width={34}
                      height={34}
                      unoptimized
                    />
                  ))}
                </div>
              ) : null}
              <div>
                <div className="hero-proof-title">{proofTitle}</div>
                <div className="hero-proof-sub">{proofEyebrow}</div>
              </div>
            </div>
          ) : null}
        </div>

        {showPanel ? (
          <div className="hero-visual" data-reveal="right" aria-label="Shaditz pipeline metrics">
            <div className="hero-panel">
              <div className="hero-panel-glow" aria-hidden="true" />
              <div className="hero-metrics">
                {metrics.map((metric, idx) => (
                  <div className="hero-metric-card" key={`${metric.title}-${idx}`}>
                    <div className="hero-metric-main">
                      <div className={`hero-metric-icon tone-${metric.tone || "gold"}`}>
                        {renderMetricIcon(metric.icon || metric.title)}
                      </div>
                      <div>
                        <div className="hero-metric-title">{metric.title}</div>
                        <div className="hero-metric-value">{metric.value}</div>
                      </div>
                    </div>
                    {metric.change ? <div className="hero-metric-change">{metric.change}</div> : null}
                  </div>
                ))}
              </div>

              <div className="hero-revenue-orbit">
                <div className="hero-ring ring-one" />
                <div className="hero-ring ring-two" />
                <div className="hero-revenue-copy">
                  <div>
                    {allowProofNumbers || !hasClaimyNumbers(hero.revenueVisual?.value)
                      ? hero.revenueVisual?.value || ""
                      : ""}
                  </div>
                  <span>{hero.revenueVisual?.label || "Pipeline visibility"}</span>
                </div>
              </div>
            </div>
            <div className="hero-float float-one" aria-hidden="true" />
            <div className="hero-float float-two" aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function hasClaimyNumbers(value: unknown) {
  if (typeof value !== "string") return false;
  return /\d|\$|%|\+/.test(value);
}

function fallbackMetricValue(title: string) {
  const t = title.toLowerCase();
  if (t.includes("prospect")) return "Consistent";
  if (t.includes("lead") || t.includes("qualified")) return "Qualified";
  if (t.includes("call") || t.includes("book")) return "Booked";
  return "Pipeline";
}

function HeroBackground() {
  return (
    <div className="hero-bg" aria-hidden="true">
      <div className="hero-bg-grid" />
      <svg className="hero-flow-line" viewBox="0 0 1600 520" preserveAspectRatio="none">
        <defs>
          <linearGradient id="heroFlowGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--gold2)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path d="M -100 200 Q 400 100 800 400 T 1700 200" fill="none" stroke="url(#heroFlowGold)" strokeWidth="1" />
      </svg>
    </div>
  );
}

function renderMultilineText(text: string) {
  const normalized = text.replace(/\s+$/, "");
  const parts = normalized.split("\n").filter((part) => part.length);
  if (parts.length > 1) {
    return (
      <>
        {parts.map((part) => (
          <span key={part}>
            {part}
            <br />
          </span>
        ))}
      </>
    );
  }

  if (normalized.toLowerCase() === "predictable booked calls for") {
    return (
      <>
        Predictable <br />
        Booked Calls For <br />
      </>
    );
  }

  return <>{normalized} </>;
}

function isGeneratedAvatar(url: string) {
  return /text_to_image|picsum\.photos|coresg-normal/i.test(url);
}

function renderMetricIcon(key: string) {
  const k = key.toLowerCase();
  if (k.includes("lead") || k.includes("target")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      </svg>
    );
  }
  if (k.includes("call") || k.includes("calendar")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 2v4M16 2v4M4 9h16" />
        <rect x="4" y="4" width="16" height="18" rx="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
