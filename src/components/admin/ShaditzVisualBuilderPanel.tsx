"use client";

import type { ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  ImageIcon,
  LogOut,
  Monitor,
  Plus,
  RotateCcw,
  Save,
  Send,
  Smartphone,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { RebuiltLandingFrame } from "@/components/landing/RebuiltLandingFrame";
import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import type { ShaditzLandingContent } from "@/content/shaditzLanding";
import { shaditzLandingDefaults } from "@/content/shaditzLanding";
import { mergePageSectionsWithDefaults } from "@/utils/homepageSections";
import { MediaPickerModal } from "@/components/admin/builder/MediaPickerModal";
import type { Tab } from "@/components/admin/types";

type Props = {
  supabase: SupabaseClient;
  onNavigateTab?: (tab: Tab) => void;
  onSignOut?: () => Promise<void>;
};

type DeviceMode = "desktop" | "tablet" | "mobile";
type PageSection = NonNullable<HomepageContent["page"]>["sections"][number];
type SectionType =
  | "loader"
  | "nav"
  | "whatsapp"
  | "hero"
  | "marquee"
  | "about"
  | "showreel"
  | "services"
  | "portfolio"
  | "process"
  | "reviews"
  | "tools"
  | "contact"
  | "footer";

const SECTION_TYPES: SectionType[] = [
  "loader",
  "nav",
  "whatsapp",
  "hero",
  "marquee",
  "about",
  "showreel",
  "services",
  "portfolio",
  "process",
  "reviews",
  "tools",
  "contact",
  "footer",
];

const SECTION_LABELS: Record<SectionType, string> = {
  loader: "Loader",
  nav: "Nav",
  whatsapp: "WhatsApp Float",
  hero: "Hero",
  marquee: "Marquee",
  about: "About",
  showreel: "Showreel",
  services: "Services",
  portfolio: "Portfolio",
  process: "Process",
  reviews: "Reviews",
  tools: "Tools",
  contact: "Contact",
  footer: "Footer",
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sectionId(type: SectionType) {
  if (type === "portfolio") return "work";
  return type;
}

function defaultSection(type: SectionType): PageSection {
  return { id: sectionId(type), type, enabled: true } as PageSection;
}

function makePreset(): HomepageContent {
  const preset = clone(homepageDefaults);
  preset.shaditz = clone(shaditzLandingDefaults);
  preset.page = { sections: SECTION_TYPES.map(defaultSection) };
  preset.header = {
    ...preset.header,
    brandText: "Shaditz",
    nav: shaditzLandingDefaults.nav.links.map((link) => ({ label: link.label, href: link.href })),
    primaryCta: { text: shaditzLandingDefaults.nav.cta.label, href: shaditzLandingDefaults.nav.cta.href },
  };
  preset.footer = {
    ...preset.footer,
    brandText: "Shaditz",
    copyright: shaditzLandingDefaults.footer.copyright,
  };
  preset.site = { ...preset.site, designPreset: "landing_html_v1" };
  preset.rebuilt = undefined;
  return preset;
}

function mergeArray<T>(incoming: unknown, fallback: T[]): T[] {
  return Array.isArray(incoming) ? (incoming as T[]) : clone(fallback);
}

function mergeShaditz(raw?: Partial<ShaditzLandingContent> | null): ShaditzLandingContent {
  const base = clone(shaditzLandingDefaults);
  const value = raw || {};
  return {
    ...base,
    ...value,
    nav: { ...base.nav, ...(value.nav || {}), links: mergeArray(value.nav?.links, base.nav.links), cta: { ...base.nav.cta, ...(value.nav?.cta || {}) } },
    hero: { ...base.hero, ...(value.hero || {}), stats: mergeArray(value.hero?.stats, base.hero.stats) },
    showreel: { ...base.showreel, ...(value.showreel || {}) },
    services: { ...base.services, ...(value.services || {}), items: mergeArray(value.services?.items, base.services.items) },
    portfolio: { ...base.portfolio, ...(value.portfolio || {}), items: mergeArray(value.portfolio?.items, base.portfolio.items) },
    tools: { ...base.tools, ...(value.tools || {}), items: mergeArray(value.tools?.items, base.tools.items) },
    process: { ...base.process, ...(value.process || {}), steps: mergeArray(value.process?.steps, base.process.steps) },
    testimonials: { ...base.testimonials, ...(value.testimonials || {}), items: mergeArray(value.testimonials?.items, base.testimonials.items) },
    pricing: { ...base.pricing, ...(value.pricing || {}), tiers: mergeArray(value.pricing?.tiers, base.pricing.tiers) },
    contact: {
      ...base.contact,
      ...(value.contact || {}),
      info: mergeArray(value.contact?.info, base.contact.info),
      fields: { ...base.contact.fields, ...(value.contact?.fields || {}) },
    },
    footer: {
      ...base.footer,
      ...(value.footer || {}),
      socialLinks: mergeArray(value.footer?.socialLinks, base.footer.socialLinks),
    },
  };
}

function mergeContent(raw: Partial<HomepageContent> | null | undefined): HomepageContent {
  const base = makePreset();
  const merged = {
    ...base,
    ...(raw || {}),
    site: { ...base.site, ...(raw?.site || {}), designPreset: "landing_html_v1" as const },
    shaditz: mergeShaditz((raw as any)?.shaditz),
    page: { sections: mergePageSectionsWithDefaults((raw as any)?.page?.sections) },
  };
  merged.rebuilt = undefined;
  return merged;
}

function sectionSubtitle(content: HomepageContent, type: SectionType) {
  const data = content.shaditz || shaditzLandingDefaults;
  if (type === "loader") return "LOADING PORTFOLIO";
  if (type === "nav") return data.nav.logo;
  if (type === "whatsapp") return data.whatsapp?.enabled === false ? "Disabled" : data.whatsapp?.number || "";
  if (type === "hero") return data.hero.subtitle;
  if (type === "marquee") return `${(data.marqueeItems || []).length} items`;
  if (type === "about") return data.about?.title || "";
  if (type === "showreel") return data.showreel.videoUrl || data.showreel.placeholderText;
  if (type === "services") return `${data.services.items.length} services`;
  if (type === "portfolio") return `${data.portfolio.items.length} projects`;
  if (type === "process") return `${data.process.steps.length} steps`;
  if (type === "reviews") return `${data.testimonials.items.length} quotes`;
  if (type === "tools") return `${data.tools.items.length} tools`;
  if (type === "contact") return data.contact.formLabel;
  return data.footer.logo;
}

function PanelGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-xs font-bold uppercase tracking-wide text-white/45">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InlineActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

export function ShaditzVisualBuilderPanel({ supabase, onNavigateTab, onSignOut }: Props) {
  const router = useRouter();
  const [content, setContent] = useState<HomepageContent>(() => makePreset());
  const [publishedUpdatedAt, setPublishedUpdatedAt] = useState<string | null>(null);
  const [versions, setVersions] = useState<{ id: number; created_at: string }[]>([]);
  const [selectedType, setSelectedType] = useState<SectionType>("hero");
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTitle, setMediaTitle] = useState("Pick media");
  const [mediaAccept, setMediaAccept] = useState<string | undefined>("image/*");
  const mediaPickRef = useRef<null | ((asset: { url: string; path: string }) => void)>(null);

  const shaditz = content.shaditz || shaditzLandingDefaults;
  const sections = useMemo(
    () => (content.page?.sections || []).filter((section) => SECTION_TYPES.includes(section.type as SectionType)),
    [content.page?.sections],
  );
  const selectedSection = sections.find((section) => section.type === selectedType) || defaultSection(selectedType);

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }, [supabase]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        setError("Missing auth session");
        return;
      }
      const res = await fetch("/api/admin/homepage", {
        headers: { authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.message || "Failed to load homepage");
        return;
      }
      const draftContent = json.draft?.content && Object.keys(json.draft.content).length ? json.draft.content : null;
      setContent(mergeContent(draftContent || json.published?.content || null));
      setPublishedUpdatedAt(json.published?.updated_at || null);
      setVersions((json.versions || []).map((v: any) => ({ id: Number(v.id), created_at: String(v.created_at || "") })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load homepage");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  async function postHomepage(body: Record<string, unknown>) {
    const token = await getToken();
    if (!token) throw new Error("Missing auth session");
    const res = await fetch("/api/admin/homepage", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) throw new Error(json?.message || "Homepage action failed");
    return json;
  }

  async function saveDraft() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await postHomepage({ action: "save-draft", content, publishedUpdatedAt });
      setNotice("Draft saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Draft save failed");
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    setPublishing(true);
    setError(null);
    setNotice(null);
    try {
      const json = await postHomepage({ action: "publish", content });
      setPublishedUpdatedAt(json.updatedAt || null);
      setNotice("Published live");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  async function restoreVersion(versionId: number) {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await postHomepage({ action: "restore-version", versionId, target: "draft" });
      setNotice("Version restored to draft");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Restore failed");
    } finally {
      setSaving(false);
    }
  }

  function updateContent(next: HomepageContent) {
    setContent(mergeContent(next));
  }

  function updateShaditz<K extends keyof ShaditzLandingContent>(key: K, value: ShaditzLandingContent[K]) {
    updateContent({ ...content, shaditz: { ...shaditz, [key]: value } });
  }

  function updateSection(type: SectionType, patch: Partial<PageSection>) {
    const next = sections.map((section) => (section.type === type ? ({ ...section, ...patch } as PageSection) : section));
    updateContent({ ...content, page: { sections: next } });
  }

  function updateSectionSettings(type: SectionType, patch: Record<string, unknown>) {
    const section = sections.find((item) => item.type === type) || defaultSection(type);
    updateSection(type, { settings: { ...(section.settings || {}), ...patch } });
  }

  function moveSection(type: SectionType, direction: -1 | 1) {
    const index = sections.findIndex((section) => section.type === type);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= sections.length) return;
    const next = [...sections];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    updateContent({ ...content, page: { sections: next } });
  }

  function openMedia(title: string, onPick: (asset: { url: string; path: string }) => void, accept = "image/*") {
    setMediaTitle(title);
    setMediaAccept(accept);
    mediaPickRef.current = onPick;
    setMediaOpen(true);
  }

  function renderBackgroundControls(type: SectionType) {
    if (type === "loader" || type === "nav" || type === "whatsapp" || type === "marquee" || type === "footer") return null;
    const settings = (selectedSection.settings || {}) as Record<string, any>;
    const image = String(settings.backgroundImage || settings.background?.url || "");
    return (
      <PanelGroup title="Background">
        <Select
          label="Type"
          value={String(settings.backgroundType || "none")}
          onChange={(e) => updateSectionSettings(type, { backgroundType: e.target.value })}
          options={[
            { value: "none", label: "Default" },
            { value: "image", label: "Image" },
            { value: "color", label: "Color" },
          ]}
        />
        <Input
          label="Image URL"
          value={image}
          onChange={(e) => updateSectionSettings(type, { backgroundImage: e.target.value, background: { url: e.target.value } })}
          placeholder="https://..."
        />
        <InlineActions>
          <Button
            type="button"
            variant="secondary"
            className="h-10"
            onClick={() =>
              openMedia("Pick background image", (asset) =>
                updateSectionSettings(type, { backgroundType: "image", backgroundImage: asset.url, background: asset }),
              )
            }
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Pick image
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-10"
            onClick={() => updateSectionSettings(type, { backgroundType: "none", backgroundImage: "", background: null })}
          >
            Clear
          </Button>
        </InlineActions>
        <Input
          label="Background color"
          value={String(settings.backgroundColor || "")}
          onChange={(e) => updateSectionSettings(type, { backgroundType: "color", backgroundColor: e.target.value })}
          placeholder="#080808"
        />
        <Input
          label="Image overlay"
          value={String(settings.overlayColor || "")}
          onChange={(e) => updateSectionSettings(type, { overlayColor: e.target.value })}
          placeholder="rgba(0,0,0,0.35)"
        />
      </PanelGroup>
    );
  }

  function renderLoaderInspector() {
    return (
      <PanelGroup title="Loader">
        <div className="text-sm text-white/65">
          Loader visuals are controlled by the cinematic template. Use section visibility to show/hide loader behavior.
        </div>
      </PanelGroup>
    );
  }

  function renderWhatsappInspector() {
    const wa = shaditz.whatsapp || {};
    const topWa: any = content.whatsapp || {
      enabled: false,
      phone: "",
      message: "",
      tooltip: "Chat with us!",
      modalTitle: "Shaditz",
      modalSubtitle: "Usually replies instantly",
      buttonText: "Start Chat"
    };
    return (
      <PanelGroup title="WhatsApp">
        <Select
          label="Enabled"
          value={wa.enabled === false ? "no" : "yes"}
          onChange={(e) => {
            const enabled = e.target.value === "yes";
            updateShaditz("whatsapp", { ...(wa || {}), enabled });
            updateContent({ ...content, whatsapp: { ...topWa, enabled } });
          }}
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
        />
        <Input
          label="Phone Number"
          value={topWa.phone || wa.number || ""}
          onChange={(e) => {
            updateShaditz("whatsapp", { ...(wa || {}), number: e.target.value });
            updateContent({ ...content, whatsapp: { ...topWa, phone: e.target.value } });
          }}
        />
        <Input
          label="Nav label"
          value={wa.navLabel || ""}
          onChange={(e) => updateShaditz("whatsapp", { ...(wa || {}), navLabel: e.target.value })}
        />
        <Input
          label="Hero button label"
          value={wa.heroLabel || ""}
          onChange={(e) => updateShaditz("whatsapp", { ...(wa || {}), heroLabel: e.target.value })}
        />
        <Input
          label="Contact button label"
          value={wa.contactLabel || ""}
          onChange={(e) => updateShaditz("whatsapp", { ...(wa || {}), contactLabel: e.target.value })}
        />
        <Textarea
          label="Prefill message"
          rows={2}
          value={topWa.message || wa.message || ""}
          onChange={(e) => {
            updateShaditz("whatsapp", { ...(wa || {}), message: e.target.value });
            updateContent({ ...content, whatsapp: { ...topWa, message: e.target.value } });
          }}
        />
        <div className="mt-4 text-xs font-semibold text-white/50 uppercase tracking-widest">Floating Widget Settings</div>
        <Input
          label="Tooltip text"
          value={topWa.tooltip || ""}
          onChange={(e) => updateContent({ ...content, whatsapp: { ...topWa, tooltip: e.target.value } })}
        />
        <Input
          label="Modal title"
          value={topWa.modalTitle || ""}
          onChange={(e) => updateContent({ ...content, whatsapp: { ...topWa, modalTitle: e.target.value } })}
        />
        <Input
          label="Modal subtitle"
          value={topWa.modalSubtitle || ""}
          onChange={(e) => updateContent({ ...content, whatsapp: { ...topWa, modalSubtitle: e.target.value } })}
        />
        <Input
          label="Button text"
          value={topWa.buttonText || ""}
          onChange={(e) => updateContent({ ...content, whatsapp: { ...topWa, buttonText: e.target.value } })}
        />
        <Input
          label="Header hex color"
          value={topWa.headerColorHex || "#25D366"}
          onChange={(e) => updateContent({ ...content, whatsapp: { ...topWa, headerColorHex: e.target.value } })}
        />
        <Select
          label="Open in new tab"
          value={wa.openInNewTab === false ? "no" : "yes"}
          onChange={(e) => updateShaditz("whatsapp", { ...(wa || {}), openInNewTab: e.target.value === "yes" })}
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
        />
      </PanelGroup>
    );
  }

  function renderMarqueeInspector() {
    return (
      <PanelGroup title="Marquee">
        <Textarea
          label="Items (one per line)"
          rows={8}
          value={(shaditz.marqueeItems || []).join("\n")}
          onChange={(e) =>
            updateShaditz(
              "marqueeItems",
              e.target.value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
        />
      </PanelGroup>
    );
  }

  function renderAboutInspector() {
    const about = shaditz.about || {};
    const paragraphs = about.paragraphs || [];
    return (
      <>
        <PanelGroup title="About Header">
          <Input
            label="Label"
            value={about.label || ""}
            onChange={(e) => updateShaditz("about", { ...about, label: e.target.value })}
          />
          <Textarea
            label="Title"
            rows={4}
            value={about.title || ""}
            onChange={(e) => updateShaditz("about", { ...about, title: e.target.value })}
          />
        </PanelGroup>
        <PanelGroup title="About Body">
          <Textarea
            label="Paragraphs (one per line)"
            rows={6}
            value={paragraphs.join("\n")}
            onChange={(e) =>
              updateShaditz("about", {
                ...about,
                paragraphs: e.target.value.split("\n").map((line) => line.trim()).filter(Boolean),
              })
            }
          />
          <Input
            label="Availability text"
            value={about.availabilityText || ""}
            onChange={(e) => updateShaditz("about", { ...about, availabilityText: e.target.value })}
          />
          <Input
            label="Skills (comma separated)"
            value={(about.skills || []).join(", ")}
            onChange={(e) =>
              updateShaditz("about", {
                ...about,
                skills: e.target.value.split(",").map((item) => item.trim()).filter(Boolean),
              })
            }
          />
        </PanelGroup>
      </>
    );
  }

  function renderNavInspector() {
    return (
      <>
        <PanelGroup title="Brand">
          <Input
            label="Logo text"
            value={shaditz.nav.logo}
            onChange={(e) => updateShaditz("nav", { ...shaditz.nav, logo: e.target.value })}
          />
        </PanelGroup>
        <PanelGroup title="Navigation Links">
          {shaditz.nav.links.map((link, index) => (
            <div key={index} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <Input
                label="Label"
                value={link.label}
                onChange={(e) => {
                  const links = [...shaditz.nav.links];
                  links[index] = { ...link, label: e.target.value };
                  updateShaditz("nav", { ...shaditz.nav, links });
                }}
              />
              <Input
                label="Href"
                className="mt-3"
                value={link.href}
                onChange={(e) => {
                  const links = [...shaditz.nav.links];
                  links[index] = { ...link, href: e.target.value };
                  updateShaditz("nav", { ...shaditz.nav, links });
                }}
              />
              <InlineActions>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-3 h-9"
                  onClick={() => updateShaditz("nav", { ...shaditz.nav, links: shaditz.nav.links.filter((_, i) => i !== index) })}
                >
                  Remove
                </Button>
              </InlineActions>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            className="h-10"
            onClick={() => updateShaditz("nav", { ...shaditz.nav, links: [...shaditz.nav.links, { label: "New Link", href: "#" }] })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add link
          </Button>
        </PanelGroup>
        <PanelGroup title="CTA">
          <Input
            label="Text"
            value={shaditz.whatsapp?.navLabel || shaditz.nav.cta.label}
            onChange={(e) => updateShaditz("whatsapp", { ...(shaditz.whatsapp || {}), navLabel: e.target.value })}
          />
          <div className="text-xs text-white/55">Href is auto-generated from WhatsApp settings.</div>
        </PanelGroup>
      </>
    );
  }

  function renderHeroInspector() {
    return (
      <>
        <PanelGroup title="Copy">
          <Input label="Eyebrow" value={shaditz.hero.eyebrow} onChange={(e) => updateShaditz("hero", { ...shaditz.hero, eyebrow: e.target.value })} />
          <Input label="Title line" value={shaditz.hero.titleLine1} onChange={(e) => updateShaditz("hero", { ...shaditz.hero, titleLine1: e.target.value })} />
          <Input label="Gold title" value={shaditz.hero.titleHighlight} onChange={(e) => updateShaditz("hero", { ...shaditz.hero, titleHighlight: e.target.value })} />
          <Textarea label="Subtitle" rows={3} value={shaditz.hero.subtitle} onChange={(e) => updateShaditz("hero", { ...shaditz.hero, subtitle: e.target.value })} />
          <Input label="Scroll text" value={shaditz.hero.scrollText} onChange={(e) => updateShaditz("hero", { ...shaditz.hero, scrollText: e.target.value })} />
        </PanelGroup>
        <PanelGroup title="Buttons">
          <Input label="Primary text" value={shaditz.hero.primaryCta.label} onChange={(e) => updateShaditz("hero", { ...shaditz.hero, primaryCta: { ...shaditz.hero.primaryCta, label: e.target.value } })} />
          <Input label="Primary href" value={shaditz.hero.primaryCta.href} onChange={(e) => updateShaditz("hero", { ...shaditz.hero, primaryCta: { ...shaditz.hero.primaryCta, href: e.target.value } })} />
          <Input
            label="Secondary (WhatsApp) text"
            value={shaditz.whatsapp?.heroLabel || shaditz.hero.secondaryCta.label}
            onChange={(e) => updateShaditz("whatsapp", { ...(shaditz.whatsapp || {}), heroLabel: e.target.value })}
          />
          <div className="text-xs text-white/55">Secondary button href is auto-generated from WhatsApp settings.</div>
        </PanelGroup>
        <PanelGroup title="Stats">
          {shaditz.hero.stats.map((stat, index) => (
            <div key={index} className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <Input label="Value" value={stat.value} onChange={(e) => {
                const stats = [...shaditz.hero.stats];
                stats[index] = { ...stat, value: e.target.value };
                updateShaditz("hero", { ...shaditz.hero, stats });
              }} />
              <Input label="Label" value={stat.label} onChange={(e) => {
                const stats = [...shaditz.hero.stats];
                stats[index] = { ...stat, label: e.target.value };
                updateShaditz("hero", { ...shaditz.hero, stats });
              }} />
            </div>
          ))}
        </PanelGroup>
      </>
    );
  }

  function renderShowreelInspector() {
    return (
      <PanelGroup title="Showreel">
        <Input label="Label" value={shaditz.showreel.label} onChange={(e) => updateShaditz("showreel", { ...shaditz.showreel, label: e.target.value })} />
        <Textarea label="Title" rows={2} value={shaditz.showreel.title} onChange={(e) => updateShaditz("showreel", { ...shaditz.showreel, title: e.target.value })} />
        <Input label="YouTube / Vimeo / video URL" value={shaditz.showreel.videoUrl} onChange={(e) => updateShaditz("showreel", { ...shaditz.showreel, videoUrl: e.target.value })} />
        <InlineActions>
          <Button type="button" variant="secondary" className="h-10" onClick={() => openMedia("Pick showreel video", (asset) => updateShaditz("showreel", { ...shaditz.showreel, videoUrl: asset.url }), "video/*")}>
            Pick video
          </Button>
        </InlineActions>
        <Input label="Placeholder" value={shaditz.showreel.placeholderText} onChange={(e) => updateShaditz("showreel", { ...shaditz.showreel, placeholderText: e.target.value })} />
        <Textarea label="Note" rows={2} value={shaditz.showreel.note} onChange={(e) => updateShaditz("showreel", { ...shaditz.showreel, note: e.target.value })} />
      </PanelGroup>
    );
  }

  function renderServicesInspector() {
    return (
      <>
        <PanelGroup title="Header">
          <Input label="Label" value={shaditz.services.label} onChange={(e) => updateShaditz("services", { ...shaditz.services, label: e.target.value })} />
          <Input label="Title" value={shaditz.services.title} onChange={(e) => updateShaditz("services", { ...shaditz.services, title: e.target.value })} />
        </PanelGroup>
        <PanelGroup title="Service Cards">
          {shaditz.services.items.map((item, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Icon" value={item.icon} onChange={(e) => {
                  const items = [...shaditz.services.items];
                  items[index] = { ...item, icon: e.target.value };
                  updateShaditz("services", { ...shaditz.services, items });
                }} />
                <Input label="Number" value={item.number} onChange={(e) => {
                  const items = [...shaditz.services.items];
                  items[index] = { ...item, number: e.target.value };
                  updateShaditz("services", { ...shaditz.services, items });
                }} />
              </div>
              <Input label="Title" value={item.title} onChange={(e) => {
                const items = [...shaditz.services.items];
                items[index] = { ...item, title: e.target.value };
                updateShaditz("services", { ...shaditz.services, items });
              }} />
              <Textarea label="Description" rows={2} value={item.description} onChange={(e) => {
                const items = [...shaditz.services.items];
                items[index] = { ...item, description: e.target.value };
                updateShaditz("services", { ...shaditz.services, items });
              }} />
              <Input label="Tags" value={item.tags.join(", ")} onChange={(e) => {
                const items = [...shaditz.services.items];
                items[index] = { ...item, tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) };
                updateShaditz("services", { ...shaditz.services, items });
              }} />
              <Button type="button" variant="secondary" className="h-9" onClick={() => updateShaditz("services", { ...shaditz.services, items: shaditz.services.items.filter((_, i) => i !== index) })}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" className="h-10" onClick={() => updateShaditz("services", { ...shaditz.services, items: [...shaditz.services.items, { icon: "video", number: String(shaditz.services.items.length + 1).padStart(2, "0"), title: "New Service", description: "", tags: [] }] })}>
            <Plus className="mr-2 h-4 w-4" />
            Add service
          </Button>
        </PanelGroup>
      </>
    );
  }

  function renderPortfolioInspector() {
    return (
      <>
        <PanelGroup title="Header">
          <Input label="Label" value={shaditz.portfolio.label} onChange={(e) => updateShaditz("portfolio", { ...shaditz.portfolio, label: e.target.value })} />
          <Input label="Title" value={shaditz.portfolio.title} onChange={(e) => updateShaditz("portfolio", { ...shaditz.portfolio, title: e.target.value })} />
        </PanelGroup>
        <PanelGroup title="Portfolio Cards">
          {shaditz.portfolio.items.map((item, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Category" value={item.category} onChange={(e) => {
                  const items = [...shaditz.portfolio.items];
                  items[index] = { ...item, category: e.target.value };
                  updateShaditz("portfolio", { ...shaditz.portfolio, items });
                }} />
                <Input label="Overlay meta" value={item.meta} onChange={(e) => {
                  const items = [...shaditz.portfolio.items];
                  items[index] = { ...item, meta: e.target.value };
                  updateShaditz("portfolio", { ...shaditz.portfolio, items });
                }} />
              </div>
              <Input label="Title" value={item.title} onChange={(e) => {
                const items = [...shaditz.portfolio.items];
                items[index] = { ...item, title: e.target.value };
                updateShaditz("portfolio", { ...shaditz.portfolio, items });
              }} />
              <Input label="Placeholder icon" value={item.icon} onChange={(e) => {
                const items = [...shaditz.portfolio.items];
                items[index] = { ...item, icon: e.target.value };
                updateShaditz("portfolio", { ...shaditz.portfolio, items });
              }} />
              <Input label="Project link" value={item.href || ""} onChange={(e) => {
                const items = [...shaditz.portfolio.items];
                items[index] = { ...item, href: e.target.value };
                updateShaditz("portfolio", { ...shaditz.portfolio, items });
              }} />
              <Input label="Image URL" value={item.image?.url || ""} onChange={(e) => {
                const items = [...shaditz.portfolio.items];
                items[index] = { ...item, image: e.target.value ? { url: e.target.value } : undefined };
                updateShaditz("portfolio", { ...shaditz.portfolio, items });
              }} />
              <InlineActions>
                <Button type="button" variant="secondary" className="h-9" onClick={() => openMedia("Pick portfolio image", (asset) => {
                  const items = [...shaditz.portfolio.items];
                  items[index] = { ...item, image: asset };
                  updateShaditz("portfolio", { ...shaditz.portfolio, items });
                })}>
                  Pick image
                </Button>
                <Button type="button" variant="secondary" className="h-9" onClick={() => {
                  const items = [...shaditz.portfolio.items];
                  items[index] = { ...item, wide: !item.wide };
                  updateShaditz("portfolio", { ...shaditz.portfolio, items });
                }}>
                  {item.wide ? "Normal width" : "Make wide"}
                </Button>
                <Button type="button" variant="secondary" className="h-9" onClick={() => updateShaditz("portfolio", { ...shaditz.portfolio, items: shaditz.portfolio.items.filter((_, i) => i !== index) })}>
                  Remove
                </Button>
              </InlineActions>
            </div>
          ))}
          <Button type="button" variant="secondary" className="h-10" onClick={() => updateShaditz("portfolio", { ...shaditz.portfolio, items: [...shaditz.portfolio.items, { category: "New Category", title: "New Project", meta: "Project · 2026", icon: "video" }] })}>
            <Plus className="mr-2 h-4 w-4" />
            Add project
          </Button>
        </PanelGroup>
      </>
    );
  }

  function renderToolsInspector() {
    return (
      <>
        <PanelGroup title="Header">
          <Input label="Label" value={shaditz.tools.label} onChange={(e) => updateShaditz("tools", { ...shaditz.tools, label: e.target.value })} />
          <Textarea label="Title" rows={2} value={shaditz.tools.title} onChange={(e) => updateShaditz("tools", { ...shaditz.tools, title: e.target.value })} />
        </PanelGroup>
        <PanelGroup title="Tools">
          {shaditz.tools.items.map((item, index) => (
            <div key={index} className="grid grid-cols-[80px_1fr_auto] gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <Input label="Icon" value={item.icon} onChange={(e) => {
                const items = [...shaditz.tools.items];
                items[index] = { ...item, icon: e.target.value };
                updateShaditz("tools", { ...shaditz.tools, items });
              }} />
              <Input label="Name" value={item.name} onChange={(e) => {
                const items = [...shaditz.tools.items];
                items[index] = { ...item, name: e.target.value };
                updateShaditz("tools", { ...shaditz.tools, items });
              }} />
              <button type="button" className="mt-7 h-10 rounded-xl border border-white/10 px-3 text-white/70" onClick={() => updateShaditz("tools", { ...shaditz.tools, items: shaditz.tools.items.filter((_, i) => i !== index) })}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="secondary" className="h-10" onClick={() => updateShaditz("tools", { ...shaditz.tools, items: [...shaditz.tools.items, { icon: "sparkles", name: "New Tool" }] })}>
            <Plus className="mr-2 h-4 w-4" />
            Add tool
          </Button>
        </PanelGroup>
      </>
    );
  }

  function renderProcessInspector() {
    return (
      <>
        <PanelGroup title="Header">
          <Input label="Label" value={shaditz.process.label} onChange={(e) => updateShaditz("process", { ...shaditz.process, label: e.target.value })} />
          <Input label="Title" value={shaditz.process.title} onChange={(e) => updateShaditz("process", { ...shaditz.process, title: e.target.value })} />
        </PanelGroup>
        <PanelGroup title="Steps">
          {shaditz.process.steps.map((step, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="grid grid-cols-[90px_1fr] gap-3">
                <Input label="Number" value={step.number} onChange={(e) => {
                  const steps = [...shaditz.process.steps];
                  steps[index] = { ...step, number: e.target.value };
                  updateShaditz("process", { ...shaditz.process, steps });
                }} />
                <Input label="Title" value={step.title} onChange={(e) => {
                  const steps = [...shaditz.process.steps];
                  steps[index] = { ...step, title: e.target.value };
                  updateShaditz("process", { ...shaditz.process, steps });
                }} />
              </div>
              <Textarea label="Description" rows={2} value={step.description} onChange={(e) => {
                const steps = [...shaditz.process.steps];
                steps[index] = { ...step, description: e.target.value };
                updateShaditz("process", { ...shaditz.process, steps });
              }} />
              <Button type="button" variant="secondary" className="h-9" onClick={() => updateShaditz("process", { ...shaditz.process, steps: shaditz.process.steps.filter((_, i) => i !== index) })}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" className="h-10" onClick={() => updateShaditz("process", { ...shaditz.process, steps: [...shaditz.process.steps, { number: String(shaditz.process.steps.length + 1).padStart(2, "0"), title: "New Step", description: "" }] })}>
            <Plus className="mr-2 h-4 w-4" />
            Add step
          </Button>
        </PanelGroup>
      </>
    );
  }

  function renderTestimonialsInspector() {
    return (
      <>
        <PanelGroup title="Header">
          <Input label="Label" value={shaditz.testimonials.label} onChange={(e) => updateShaditz("testimonials", { ...shaditz.testimonials, label: e.target.value })} />
          <Input label="Title" value={shaditz.testimonials.title} onChange={(e) => updateShaditz("testimonials", { ...shaditz.testimonials, title: e.target.value })} />
        </PanelGroup>
        <PanelGroup title="Quotes">
          {shaditz.testimonials.items.map((item, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <Textarea label="Quote" rows={3} value={item.quote} onChange={(e) => {
                const items = [...shaditz.testimonials.items];
                items[index] = { ...item, quote: e.target.value };
                updateShaditz("testimonials", { ...shaditz.testimonials, items });
              }} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Author" value={item.author} onChange={(e) => {
                  const items = [...shaditz.testimonials.items];
                  items[index] = { ...item, author: e.target.value };
                  updateShaditz("testimonials", { ...shaditz.testimonials, items });
                }} />
                <Input label="Role" value={item.role} onChange={(e) => {
                  const items = [...shaditz.testimonials.items];
                  items[index] = { ...item, role: e.target.value };
                  updateShaditz("testimonials", { ...shaditz.testimonials, items });
                }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Avatar" value={item.avatar} onChange={(e) => {
                  const items = [...shaditz.testimonials.items];
                  items[index] = { ...item, avatar: e.target.value };
                  updateShaditz("testimonials", { ...shaditz.testimonials, items });
                }} />
                <Input label="Stars" value={item.stars} onChange={(e) => {
                  const items = [...shaditz.testimonials.items];
                  items[index] = { ...item, stars: e.target.value };
                  updateShaditz("testimonials", { ...shaditz.testimonials, items });
                }} />
              </div>
              <Button type="button" variant="secondary" className="h-9" onClick={() => updateShaditz("testimonials", { ...shaditz.testimonials, items: shaditz.testimonials.items.filter((_, i) => i !== index) })}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" className="h-10" onClick={() => updateShaditz("testimonials", { ...shaditz.testimonials, items: [...shaditz.testimonials.items, { quote: "", author: "Client Name", role: "Role", avatar: "user", stars: "★★★★★" }] })}>
            <Plus className="mr-2 h-4 w-4" />
            Add quote
          </Button>
        </PanelGroup>
      </>
    );
  }

  function renderContactInspector() {
    return (
      <>
        <PanelGroup title="Contact Copy">
          <Input label="Label" value={shaditz.contact.label} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, label: e.target.value })} />
          <Textarea label="Title" rows={3} value={shaditz.contact.title} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, title: e.target.value })} />
          <Input label="Form label" value={shaditz.contact.formLabel} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, formLabel: e.target.value })} />
        </PanelGroup>
        <PanelGroup title="Contact Info">
          {shaditz.contact.info.map((item, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="grid grid-cols-[80px_1fr] gap-3">
                <Input label="Icon" value={item.icon} onChange={(e) => {
                  const info = [...shaditz.contact.info];
                  info[index] = { ...item, icon: e.target.value };
                  updateShaditz("contact", { ...shaditz.contact, info });
                }} />
                <Input label="Label" value={item.label} onChange={(e) => {
                  const info = [...shaditz.contact.info];
                  info[index] = { ...item, label: e.target.value };
                  updateShaditz("contact", { ...shaditz.contact, info });
                }} />
              </div>
              <Input label="Value" value={item.value} onChange={(e) => {
                const info = [...shaditz.contact.info];
                info[index] = { ...item, value: e.target.value };
                updateShaditz("contact", { ...shaditz.contact, info });
              }} />
              <Input label="Href" value={item.href || ""} onChange={(e) => {
                const info = [...shaditz.contact.info];
                info[index] = { ...item, href: e.target.value };
                updateShaditz("contact", { ...shaditz.contact, info });
              }} />
            </div>
          ))}
        </PanelGroup>
        <PanelGroup title="Form Fields">
          <Input label="Name label" value={shaditz.contact.fields.nameLabel} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, fields: { ...shaditz.contact.fields, nameLabel: e.target.value } })} />
          <Input label="Name placeholder" value={shaditz.contact.fields.namePlaceholder} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, fields: { ...shaditz.contact.fields, namePlaceholder: e.target.value } })} />
          <Input label="Email label" value={shaditz.contact.fields.emailLabel} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, fields: { ...shaditz.contact.fields, emailLabel: e.target.value } })} />
          <Input label="Email placeholder" value={shaditz.contact.fields.emailPlaceholder} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, fields: { ...shaditz.contact.fields, emailPlaceholder: e.target.value } })} />
          <Input label="Project label" value={shaditz.contact.fields.projectLabel} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, fields: { ...shaditz.contact.fields, projectLabel: e.target.value } })} />
          <Input label="Project placeholder" value={shaditz.contact.fields.projectPlaceholder} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, fields: { ...shaditz.contact.fields, projectPlaceholder: e.target.value } })} />
          <Input label="Budget placeholder" value={(shaditz.contact.fields as any).budgetPlaceholder || "Budget Range"} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, fields: { ...(shaditz.contact.fields as any), budgetPlaceholder: e.target.value } as any })} />
          <Input label="Message label" value={shaditz.contact.fields.messageLabel} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, fields: { ...shaditz.contact.fields, messageLabel: e.target.value } })} />
          <Textarea label="Message placeholder" rows={2} value={shaditz.contact.fields.messagePlaceholder} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, fields: { ...shaditz.contact.fields, messagePlaceholder: e.target.value } })} />
        </PanelGroup>
        <PanelGroup title="Submit States">
          <Input label="Button text" value={shaditz.contact.submitText} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, submitText: e.target.value })} />
          <Input label="Loading text" value={shaditz.contact.loadingText} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, loadingText: e.target.value })} />
          <Input label="Success text" value={shaditz.contact.successText} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, successText: e.target.value })} />
          <Input label="Error text" value={shaditz.contact.errorText} onChange={(e) => updateShaditz("contact", { ...shaditz.contact, errorText: e.target.value })} />
        </PanelGroup>
      </>
    );
  }

  function renderFooterInspector() {
    return (
      <>
        <PanelGroup title="Footer">
          <Input label="Logo" value={shaditz.footer.logo} onChange={(e) => updateShaditz("footer", { ...shaditz.footer, logo: e.target.value })} />
          <Input label="Copyright" value={shaditz.footer.copyright} onChange={(e) => updateShaditz("footer", { ...shaditz.footer, copyright: e.target.value })} />
        </PanelGroup>
        <PanelGroup title="Social Links">
          {shaditz.footer.socialLinks.map((link, index) => (
            <div key={index} className="grid grid-cols-[90px_1fr_auto] gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <Input label="Label" value={link.label} onChange={(e) => {
                const links = [...shaditz.footer.socialLinks];
                links[index] = { ...link, label: e.target.value };
                updateShaditz("footer", { ...shaditz.footer, socialLinks: links });
              }} />
              <Input label="Href" value={link.href} onChange={(e) => {
                const links = [...shaditz.footer.socialLinks];
                links[index] = { ...link, href: e.target.value };
                updateShaditz("footer", { ...shaditz.footer, socialLinks: links });
              }} />
              <button type="button" className="mt-7 h-10 rounded-xl border border-white/10 px-3 text-white/70" onClick={() => updateShaditz("footer", { ...shaditz.footer, socialLinks: shaditz.footer.socialLinks.filter((_, i) => i !== index) })}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="secondary" className="h-10" onClick={() => updateShaditz("footer", { ...shaditz.footer, socialLinks: [...shaditz.footer.socialLinks, { label: "NEW", href: "#" }] })}>
            <Plus className="mr-2 h-4 w-4" />
            Add social
          </Button>
        </PanelGroup>
      </>
    );
  }

  function renderInspector() {
    return (
      <div className="space-y-4">
        <PanelGroup title="Section">
          <Select
            label="Visible"
            value={selectedSection.enabled === false ? "no" : "yes"}
            onChange={(e) => updateSection(selectedType, { enabled: e.target.value === "yes" })}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
        </PanelGroup>
        {renderBackgroundControls(selectedType)}
        {selectedType === "loader" ? renderLoaderInspector() : null}
        {selectedType === "nav" ? renderNavInspector() : null}
        {selectedType === "whatsapp" ? renderWhatsappInspector() : null}
        {selectedType === "hero" ? renderHeroInspector() : null}
        {selectedType === "marquee" ? renderMarqueeInspector() : null}
        {selectedType === "about" ? renderAboutInspector() : null}
        {selectedType === "showreel" ? renderShowreelInspector() : null}
        {selectedType === "services" ? renderServicesInspector() : null}
        {selectedType === "portfolio" ? renderPortfolioInspector() : null}
        {selectedType === "process" ? renderProcessInspector() : null}
        {selectedType === "reviews" ? renderTestimonialsInspector() : null}
        {selectedType === "tools" ? renderToolsInspector() : null}
        {selectedType === "contact" ? renderContactInspector() : null}
        {selectedType === "footer" ? renderFooterInspector() : null}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#080808] text-sm text-white/60">
        Loading Shaditz builder...
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#080808] text-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0f0f0f] px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm font-bold">Shaditz Landing Builder</div>
            <div className="text-xs text-white/45">Preview and live use the same HTML renderer.</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" className="h-10 px-3" onClick={() => setDevice("desktop")} title="Desktop">
            <Monitor className="h-4 w-4" />
          </Button>
          <Button type="button" variant="secondary" className="h-10 px-3" onClick={() => setDevice("mobile")} title="Mobile">
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button type="button" variant="secondary" className="h-10" onClick={() => updateContent(makePreset())}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Load preset
          </Button>
          <Button type="button" variant="secondary" className="h-10" onClick={saveDraft} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button type="button" className="h-10" onClick={publish} disabled={publishing}>
            <Send className="mr-2 h-4 w-4" />
            Publish
          </Button>
          <Button type="button" variant="secondary" className="h-10" onClick={() => onNavigateTab?.("media")}>
            Media
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-10 px-3"
            onClick={async () => {
              if (onSignOut) await onSignOut();
              else await supabase.auth.signOut();
              router.refresh();
            }}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error ? <div className="border-b border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">{error}</div> : null}
      {notice ? <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">{notice}</div> : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_1fr_420px]">
        <aside className="min-h-0 overflow-y-auto border-b border-white/10 bg-[#0f0f0f] p-3 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wide text-white/45">Sections</div>
            <Eye className="h-4 w-4 text-white/35" />
          </div>
          <div className="space-y-2">
            {sections.map((section, index) => {
              const type = section.type as SectionType;
              return (
                <div
                  key={section.id}
                  className={
                    selectedType === type
                      ? "rounded-2xl border border-[#c9a84c]/50 bg-[#c9a84c]/10 p-3"
                      : "rounded-2xl border border-white/10 bg-white/5 p-3"
                  }
                >
                  <button type="button" className="w-full text-left" onClick={() => setSelectedType(type)}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-bold">{SECTION_LABELS[type]}</div>
                      <div className={section.enabled === false ? "text-xs text-rose-200" : "text-xs text-emerald-200"}>
                        {section.enabled === false ? "Hidden" : "Live"}
                      </div>
                    </div>
                    <div className="mt-1 truncate text-xs text-white/45">{sectionSubtitle(content, type)}</div>
                  </button>
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" className="rounded-lg border border-white/10 p-2 text-white/70 disabled:opacity-30" disabled={index === 0} onClick={() => moveSection(type, -1)} aria-label="Move up">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" className="rounded-lg border border-white/10 p-2 text-white/70 disabled:opacity-30" disabled={index === sections.length - 1} onClick={() => moveSection(type, 1)} aria-label="Move down">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" className="ml-auto rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70" onClick={() => updateSection(type, { enabled: section.enabled === false })}>
                      {section.enabled === false ? "Show" : "Hide"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {versions.length ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-white/45">Restore</div>
              <Select
                aria-label="Restore version"
                value=""
                onChange={(e) => {
                  const id = Number(e.target.value);
                  if (Number.isFinite(id) && id > 0) void restoreVersion(id);
                }}
                options={[
                  { value: "", label: "Choose version" },
                  ...versions.map((version) => ({
                    value: String(version.id),
                    label: new Date(version.created_at).toLocaleString(),
                  })),
                ]}
              />
            </div>
          ) : null}
        </aside>

        <main className="min-h-[520px] overflow-hidden bg-black">
          <div className={device === "mobile" ? "mx-auto h-full max-w-[390px] border-x border-white/10" : "h-full"}>
            <RebuiltLandingFrame content={content} device={device} height="100%" />
          </div>
        </main>

        <aside className="min-h-0 overflow-y-auto border-t border-white/10 bg-[#0f0f0f] p-4 lg:border-l lg:border-t-0">
          <div className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wide text-[#c9a84c]">{SECTION_LABELS[selectedType]}</div>
            <div className="mt-1 text-sm text-white/55">Edits update preview immediately, then persist when saved or published.</div>
          </div>
          {renderInspector()}
          <div className="h-8" />
        </aside>
      </div>

      <MediaPickerModal
        supabase={supabase}
        open={mediaOpen}
        title={mediaTitle}
        accept={mediaAccept}
        onClose={() => setMediaOpen(false)}
        onPick={(asset) => mediaPickRef.current?.(asset)}
      />
    </div>
  );
}
