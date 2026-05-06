"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { IconPicker, type IconRef } from "@/components/admin/builder/IconPicker";
import { MediaPickerModal } from "@/components/admin/builder/MediaPickerModal";
import { applyBuilderOverrides } from "@/utils/homepageBuilder";
import { mergePageSectionsWithDefaults } from "@/utils/homepageSections";
import { neutralizeLegacyProofContent } from "@/utils/homepageMerge";
import { requestAdminRevalidate } from "@/utils/adminRevalidate";
import { mergeTypographyScale } from "@/utils/typographyScale";
import { RebuiltLandingFrame } from "@/components/landing/RebuiltLandingFrame";
import type { Tab } from "@/components/admin/types";
import {
  Monitor,
  Tablet as TabletIcon,
  Smartphone,
  Undo2,
  Redo2,
  MoreHorizontal,
  PanelLeft,
  Eye,
  SlidersHorizontal,
  Layers,
  LogOut,
} from "lucide-react";

type Props = {
  supabase: SupabaseClient;
  onNavigateTab?: (tab: Tab) => void;
  onSignOut?: () => Promise<void>;
};

type PreviewMode = "desktop" | "tablet" | "mobile";
type MobilePane = "preview" | "sections" | "inspector";

const SOCIAL_PLATFORM_PRESETS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
] as const;

type PageSection = NonNullable<HomepageContent["page"]>["sections"][number];

type SectionItem = {
  id: string;
  type:
    | NonNullable<HomepageContent["page"]>["sections"][number]["type"]
    | "whatsapp";
  enabled: boolean;
};

function mergeContent(c: Partial<HomepageContent> | null): HomepageContent {
  if (!c) return homepageDefaults;

  const mergeScale = (base: any, extra: any) => {
    return mergeTypographyScale(extra, mergeTypographyScale(base));
  };

  const mergeTheme = (base: any, extra: any) => {
    const b = base || homepageDefaults.site.theme;
    const e = extra || {};
    return {
      ...b,
      ...e,
      colors: { ...(b?.colors || {}), ...(e.colors || {}) },
      typography: {
        ...(b?.typography || {}),
        ...(e.typography || {}),
        scale: mergeScale(b?.typography?.scale, e.typography?.scale),
      },
    };
  };

  const mergeBranding = (base: any, extra: any) => {
    const b = base || homepageDefaults.branding;
    const e = extra || {};
    return {
      ...b,
      ...e,
      colors: { ...(b?.colors || {}), ...(e.colors || {}) },
      typography: {
        ...(b?.typography || {}),
        ...(e.typography || {}),
        scale: mergeScale(b?.typography?.scale, e.typography?.scale),
      },
    };
  };

  const mergeSocialLinksV2 = (
    base: HomepageContent["socialLinksV2"] | undefined,
    extra: HomepageContent["socialLinksV2"] | undefined,
  ) => {
    const b = Array.isArray(base) ? base : [];
    const e = Array.isArray(extra) ? extra : [];
    const byId = new Map<string, any>();
    for (const item of e) {
      const id = String((item as any)?.id || "").trim();
      if (!id) continue;
      byId.set(id, item);
    }
    const out: any[] = [];
    for (const preset of b) {
      const id = String((preset as any)?.id || "").trim();
      const override = id ? byId.get(id) : null;
      out.push(override ? { ...(preset as any), ...(override as any) } : preset);
      if (id) byId.delete(id);
    }
    for (const rest of byId.values()) out.push(rest);
    return out as HomepageContent["socialLinksV2"];
  };

  return neutralizeLegacyProofContent({
    ...homepageDefaults,
    ...c,
    site: { ...homepageDefaults.site, ...(c.site || {}), theme: mergeTheme(homepageDefaults.site.theme, c.site?.theme) },
    branding: mergeBranding(homepageDefaults.branding, c.branding),
    header: {
      ...homepageDefaults.header,
      ...(c.header || {}),
      brandIcon: { ...homepageDefaults.header.brandIcon, ...(c.header?.brandIcon || {}) },
      primaryCta: { ...homepageDefaults.header.primaryCta, ...(c.header?.primaryCta || {}) },
    },
    hero: {
      ...homepageDefaults.hero,
      ...(c.hero || {}),
      badge: { ...homepageDefaults.hero.badge, ...(c.hero?.badge || {}) },
      heading: { ...homepageDefaults.hero.heading, ...(c.hero?.heading || {}) },
      primaryCta: { ...homepageDefaults.hero.primaryCta, ...(c.hero?.primaryCta || {}) },
      secondaryCta: { ...homepageDefaults.hero.secondaryCta, ...(c.hero?.secondaryCta || {}) },
      proof: {
        ...(homepageDefaults.hero.proof || { title: "", eyebrow: "", avatars: [] }),
        ...(c.hero?.proof || {}),
        avatars: c.hero?.proof?.avatars || homepageDefaults.hero.proof?.avatars || [],
      },
      metrics: c.hero?.metrics || homepageDefaults.hero.metrics,
      revenueVisual: {
        ...(homepageDefaults.hero.revenueVisual || { value: "", label: "" }),
        ...(c.hero?.revenueVisual || {}),
      },
      backgroundImage: c.hero?.backgroundImage || homepageDefaults.hero.backgroundImage,
    },
    trust: { ...homepageDefaults.trust, ...(c.trust || {}), icons: c.trust?.icons || homepageDefaults.trust.icons },
    features: {
      ...homepageDefaults.features,
      ...(c.features || {}),
      cards: c.features?.cards || homepageDefaults.features.cards,
      backgroundImage: c.features?.backgroundImage || homepageDefaults.features.backgroundImage,
    },
    workflow: {
      ...homepageDefaults.workflow,
      ...(c.workflow || {}),
      steps: c.workflow?.steps || homepageDefaults.workflow.steps,
      backgroundImage: c.workflow?.backgroundImage || homepageDefaults.workflow.backgroundImage,
    },
    pricing: {
      ...homepageDefaults.pricing,
      ...(c.pricing || {}),
      tiers: c.pricing?.tiers || homepageDefaults.pricing.tiers,
      backgroundImage: c.pricing?.backgroundImage || homepageDefaults.pricing.backgroundImage,
    },
    application: {
      ...homepageDefaults.application,
      ...(c.application || {}),
      fields: {
        ...homepageDefaults.application.fields,
        ...(c.application?.fields || {}),
        revenueOptions: c.application?.fields?.revenueOptions || homepageDefaults.application.fields.revenueOptions,
      },
      backgroundImage: c.application?.backgroundImage || homepageDefaults.application.backgroundImage,
    },
    footer: {
      ...homepageDefaults.footer,
      ...(c.footer || {}),
      brandIcon: { ...homepageDefaults.footer.brandIcon, ...(c.footer?.brandIcon || {}) },
      links: c.footer?.links || homepageDefaults.footer.links,
    },
    socialLinks: c.socialLinks || homepageDefaults.socialLinks,
    socialLinksV2: mergeSocialLinksV2(homepageDefaults.socialLinksV2, c.socialLinksV2),
    whatsapp: {
      ...(homepageDefaults.whatsapp || {
        enabled: false,
        phone: "",
        message: "",
        tooltip: "Chat with us!",
        modalTitle: "Shaditz",
        modalSubtitle: "Usually replies instantly",
        buttonText: "Start Chat",
        headerColorHex: "#25D366",
      }),
      ...(c.whatsapp || {}),
      enabled: c.whatsapp?.enabled ?? (homepageDefaults.whatsapp?.enabled ?? false),
      phone: c.whatsapp?.phone ?? (homepageDefaults.whatsapp?.phone ?? ""),
      message: c.whatsapp?.message ?? (homepageDefaults.whatsapp?.message ?? ""),
      tooltip: c.whatsapp?.tooltip ?? (homepageDefaults.whatsapp?.tooltip ?? "Chat with us!"),
      modalTitle: c.whatsapp?.modalTitle ?? (homepageDefaults.whatsapp?.modalTitle ?? "Shaditz"),
      modalSubtitle:
        c.whatsapp?.modalSubtitle ?? (homepageDefaults.whatsapp?.modalSubtitle ?? "Usually replies instantly"),
      buttonText: c.whatsapp?.buttonText ?? (homepageDefaults.whatsapp?.buttonText ?? "Start Chat"),
      headerColorHex: c.whatsapp?.headerColorHex ?? (homepageDefaults.whatsapp?.headerColorHex || "#25D366"),
      avatar: c.whatsapp?.avatar || homepageDefaults.whatsapp?.avatar,
    },
    page: { sections: mergePageSectionsWithDefaults(c.page?.sections) },
    customSections: c.customSections || homepageDefaults.customSections,
  });
}

function SectionRow({ item, selected, subtitle, children, onSelect, onToggle, onDuplicate }: {
  item: SectionItem;
  selected: boolean;
  subtitle?: string;
  children?: string[];
  onSelect: () => void;
  onToggle: () => void;
  onDuplicate?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as const;

  const title = String(item.type || "").replaceAll("_", " ");
  const nested = Array.isArray(children) ? children.filter(Boolean) : [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        selected
          ? "rounded-2xl border border-[var(--cf-accent)]/40 bg-[var(--cf-accent)]/10"
          : "rounded-2xl border border-white/10 bg-white/5 hover:bg-white/7"
      }
    >
      <div className="px-3 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab text-white/45 active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label="Drag"
          >
            <MaterialIcon name="drag_indicator" className="text-[20px]" />
          </button>
          <button type="button" className="flex-1 text-left" onClick={onSelect}>
            <div className="text-sm font-semibold text-white">{title}</div>
            {subtitle && subtitle.trim().length ? (
              <div className="mt-0.5 line-clamp-1 text-xs text-white/50">{subtitle}</div>
            ) : null}
          </button>
          <div className="ml-auto flex items-center gap-1">
            {onDuplicate ? (
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={onDuplicate}
                aria-label="Duplicate"
              >
                <MaterialIcon name="content_copy" className="text-[18px]" />
              </button>
            ) : null}
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={onToggle}
              aria-label="Toggle"
            >
              <MaterialIcon name={item.enabled ? "visibility" : "visibility_off"} className="text-[18px]" />
            </button>
          </div>
        </div>

        {nested.length ? (
          <div className="mt-3 hidden space-y-2 pl-7 lg:block">
            {nested.map((c) => (
              <div key={c} className="flex items-center gap-2 text-xs text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
                <span className="truncate">{c}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {isDragging ? <span className="sr-only">Dragging</span> : null}
    </div>
  );
}

function BlockRow({ id, title, selected, onSelect, onDuplicate, onRemove }: {
  id: string;
  title: string;
  selected: boolean;
  onSelect: () => void;
  onDuplicate?: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as const;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        selected
          ? "flex items-center gap-2 rounded-lg border border-[#0fa3a3]/40 bg-[#0fa3a3]/10 px-3 py-2"
          : "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#0b1414]"
      }
    >
      <button
        type="button"
        className="cursor-grab text-slate-400 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag"
      >
        <MaterialIcon name="drag_indicator" className="text-[20px]" />
      </button>
      <button type="button" className="flex-1 text-left text-sm font-semibold" onClick={onSelect}>
        {title}
      </button>
      {onDuplicate ? (
        <button
          type="button"
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          onClick={onDuplicate}
          aria-label="Duplicate"
        >
          <MaterialIcon name="content_copy" className="text-[20px]" />
        </button>
      ) : null}
      <button type="button" className="text-slate-400 hover:text-rose-500" onClick={onRemove} aria-label="Delete">
        <MaterialIcon name="delete" className="text-[20px]" />
      </button>
    </div>
  );
}

function pill(text: string, tone: "published" | "draft") {
  const cls =
    tone === "published"
      ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/20"
      : "bg-amber-500/15 text-amber-200 border-amber-500/20";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{text}</span>;
}

function deviceButton(active: boolean, onClick: () => void, icon: ReactNode, label: string) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "inline-flex h-9 w-10 items-center justify-center rounded-lg bg-white/10 text-white"
          : "inline-flex h-9 w-10 items-center justify-center rounded-lg text-white/60 hover:bg-white/5 hover:text-white"
      }
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function labelRow(left: string, right?: string) {
  return (
    <span className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold tracking-wide text-white/70">{left}</span>
      {right ? <span className="text-[11px] font-semibold text-white/45">{right}</span> : null}
    </span>
  );
}

function isProofBlock(block: { type?: string }) {
  return block.type === "testimonial" || block.type === "proof_card";
}

function InspectorGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wide text-white/50">{title}</div>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export function VisualBuilderPanel({ supabase, onNavigateTab, onSignOut }: Props) {
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<PreviewMode>("desktop");
  const [mobilePane, setMobilePane] = useState<MobilePane>("preview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("hero");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [addType, setAddType] = useState<string>("hero");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTitle, setMediaTitle] = useState("Pick media");
  const [mediaAccept, setMediaAccept] = useState<string | undefined>("image/*");
  const mediaPickRef = useRef<null | ((asset: { url: string; path: string }) => void)>(null);

  const [published, setPublished] = useState<HomepageContent>(homepageDefaults);
  const [draft, setDraft] = useState<HomepageContent | null>(null);
  const [publishedUpdatedAt, setPublishedUpdatedAt] = useState<string | null>(null);
  const [backups, setBackups] = useState<{ id: number; createdAt: string; content: HomepageContent }[]>([]);
  const [backupsOpen, setBackupsOpen] = useState(false);
  const backupsRef = useRef<HTMLDivElement | null>(null);
  const [publishConflict, setPublishConflict] = useState<{ latestUpdatedAt: string; latestContent: HomepageContent } | null>(null);

  const historyRef = useRef<HomepageContent[]>([]);
  const futureRef = useRef<HomepageContent[]>([]);
  const [historySize, setHistorySize] = useState(0);
  const [futureSize, setFutureSize] = useState(0);
  const historyBatchRef = useRef(false);

  const content = draft || published;
  const resolved = applyBuilderOverrides(content);
  const isRebuiltTemplate = String((content.site as any)?.designPreset || "landing_html_v1") !== "classic";
  const contentRef = useRef<HomepageContent>(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);
  const draftSaveTimer = useRef<number | null>(null);

  const formatTimestamp = useCallback((value: string) => {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  }, []);

  const toMs = useCallback((value: string | null | undefined) => {
    if (!value) return null;
    const ms = new Date(value).getTime();
    if (Number.isNaN(ms)) return null;
    return ms;
  }, []);

  const cloneContent = useCallback((v: HomepageContent): HomepageContent => {
    return JSON.parse(JSON.stringify(v)) as HomepageContent;
  }, []);

  const resetHistory = useCallback(() => {
    historyRef.current = [];
    futureRef.current = [];
    setHistorySize(0);
    setFutureSize(0);
    historyBatchRef.current = false;
  }, []);

  const loadBackups = useCallback(async () => {
    const res = await supabase
      .from("homepage_content_versions")
      .select("id, created_at, content")
      .eq("homepage_id", 1)
      .order("created_at", { ascending: false })
      .limit(5);
    if (res.error) return;
    const next = (res.data || [])
      .map((row: any) => ({
        id: Number(row.id),
        createdAt: String(row.created_at || ""),
        content: mergeContent(row.content as Partial<HomepageContent>),
      }))
      .filter((x) => Number.isFinite(x.id) && x.createdAt);
    setBackups(next);
  }, [supabase]);

  useEffect(() => {
    if (!backupsOpen) return;
    function onDown(e: MouseEvent) {
      const root = backupsRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return;
      setBackupsOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [backupsOpen]);

  const loadLandingPreset = useCallback(() => {
    const base = cloneContent(homepageDefaults);
    const current = cloneContent(contentRef.current);

    base.site = {
      ...base.site,
      favicon: current.site?.favicon || base.site.favicon,
      customCss: current.site?.customCss || base.site.customCss,
      customJs: current.site?.customJs || base.site.customJs,
    };
    base.socialLinks = current.socialLinks;
    base.socialLinksV2 = current.socialLinksV2;
    base.whatsapp = current.whatsapp;

    setDraft(base);
    setSelectedId("hero");
    setSelectedBlockId(null);
    resetHistory();
    setNotice("Landing preset loaded (not published). Save Draft to keep it.");
  }, [cloneContent, resetHistory]);

  const pageSections: PageSection[] = useMemo(() => {
    const list = content.page?.sections?.length ? content.page.sections : homepageDefaults.page!.sections;
    return list as PageSection[];
  }, [content.page?.sections]);

  const sectionItems: SectionItem[] = useMemo(() => {
    return [
      ...pageSections.map((s) => ({ id: s.id, type: s.type, enabled: s.enabled })),
      { id: "__whatsapp", type: "whatsapp", enabled: Boolean(content.whatsapp?.enabled) },
    ];
  }, [pageSections, content.whatsapp?.enabled]);

  const loadAll = useCallback(async () => {
    setError(null);
    setNotice(null);
    setPublishConflict(null);
    setLoading(true);
    try {
      const pub = await supabase
        .from("homepage_content")
        .select("content, updated_at")
        .eq("id", 1)
        .single();
      if (pub.error) {
        setError(pub.error.message);
        return;
      }
      const latestPublishedUpdatedAt = pub.data.updated_at;
      setPublishedUpdatedAt(latestPublishedUpdatedAt);
      setPublished(mergeContent(pub.data.content as Partial<HomepageContent>));

      const dr = await supabase
        .from("homepage_content_drafts")
        .select("content, published_updated_at")
        .eq("id", 1)
        .maybeSingle();
      if (dr.error) {
        setDraft(null);
        return;
      }
      const c = (dr.data?.content as Partial<HomepageContent> | null) || null;
      const has = c && Object.keys(c).length;
      setDraft(has ? mergeContent(c) : null);
      if (dr.data?.published_updated_at && latestPublishedUpdatedAt) {
        const baseMs = toMs(dr.data.published_updated_at);
        const latestMs = toMs(latestPublishedUpdatedAt);
        const sameInstant = baseMs !== null && latestMs !== null && Math.abs(baseMs - latestMs) <= 1000;
        setPublishedUpdatedAt(sameInstant ? latestPublishedUpdatedAt : dr.data.published_updated_at);
      } else if (dr.data?.published_updated_at) {
        setPublishedUpdatedAt(dr.data.published_updated_at);
      }
      resetHistory();
      await loadBackups();
    } finally {
      setLoading(false);
    }
  }, [loadBackups, resetHistory, supabase, toMs]);

  const saveDraft = useCallback(async (next: HomepageContent): Promise<boolean> => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const { error } = await supabase
        .from("homepage_content_drafts")
        .upsert({ id: 1, content: next, published_updated_at: publishedUpdatedAt }, { onConflict: "id" });
      if (error) {
        setError(error.message);
        return false;
      }
      setNotice("Draft saved");
      return true;
    } finally {
      setSaving(false);
    }
  }, [publishedUpdatedAt, supabase]);

  async function createBackupSnapshot(next: HomepageContent) {
    const res = await supabase.from("homepage_content_versions").insert({ homepage_id: 1, content: next, created_by: null });
    if (res.error) return;
    await loadBackups();
  }

  async function publishNow() {
    if (!draft) return;
    setPublishing(true);
    setError(null);
    setNotice(null);
    setPublishConflict(null);
    try {
      const latest = await supabase
        .from("homepage_content")
        .select("updated_at, content")
        .eq("id", 1)
        .single();
      if (latest.error) {
        setError(latest.error.message);
        return;
      }

      const baseUpdatedAt = publishedUpdatedAt || latest.data.updated_at;
      const baseMs = toMs(baseUpdatedAt);
      const latestMs = toMs(latest.data.updated_at);
      const sameInstant = baseMs !== null && latestMs !== null && Math.abs(baseMs - latestMs) <= 1000;
      const expectedUpdatedAt = sameInstant ? latest.data.updated_at : baseUpdatedAt;

      let updateQuery = supabase.from("homepage_content").update({ content: draft }).eq("id", 1);
      if (expectedUpdatedAt) updateQuery = updateQuery.eq("updated_at", expectedUpdatedAt);

      const upd = await updateQuery.select("updated_at").maybeSingle();
      if (upd.error) {
        setError(upd.error.message);
        return;
      }

      if (!upd.data?.updated_at) {
        setPublishConflict({
          latestUpdatedAt: latest.data.updated_at,
          latestContent: mergeContent(latest.data.content as Partial<HomepageContent>),
        });
        setError("Publish conflict: the published homepage changed since you started editing.");
        return;
      }

      await supabase.from("homepage_content_versions").insert({ homepage_id: 1, content: draft, created_by: null });
      await loadBackups();

      await supabase
        .from("homepage_content_drafts")
        .upsert({ id: 1, content: {}, published_updated_at: upd.data.updated_at }, { onConflict: "id" });

      setPublishedUpdatedAt(upd.data.updated_at);
      setPublished(draft);
      setDraft(null);
      resetHistory();
      await requestAdminRevalidate(supabase, ["/"]);
      setNotice("Published");
    } finally {
      setPublishing(false);
    }
  }

  async function forcePublishNow() {
    if (!draft) return;
    setPublishing(true);
    setError(null);
    setNotice(null);
    try {
      const latest = await supabase
        .from("homepage_content")
        .select("updated_at, content")
        .eq("id", 1)
        .single();
      if (latest.error) {
        setError(latest.error.message);
        return;
      }

      await supabase.from("homepage_content_versions").insert({ homepage_id: 1, content: latest.data.content as any, created_by: null });

      const upd = await supabase
        .from("homepage_content")
        .update({ content: draft })
        .eq("id", 1)
        .select("updated_at")
        .single();
      if (upd.error) {
        setError(upd.error.message);
        return;
      }

      await supabase.from("homepage_content_versions").insert({ homepage_id: 1, content: draft, created_by: null });
      await loadBackups();

      await supabase
        .from("homepage_content_drafts")
        .upsert({ id: 1, content: {}, published_updated_at: upd.data.updated_at }, { onConflict: "id" });

      setPublishedUpdatedAt(upd.data.updated_at);
      setPublished(draft);
      setDraft(null);
      resetHistory();
      await requestAdminRevalidate(supabase, ["/"]);
      setNotice("Published (overwrote latest)");
    } finally {
      setPublishing(false);
      setPublishConflict(null);
    }
  }

  const setContent = useCallback((next: HomepageContent, opts?: { recordHistory?: boolean }) => {
    const recordHistory = opts?.recordHistory !== false;
    if (recordHistory && !historyBatchRef.current) {
      historyBatchRef.current = true;
      Promise.resolve().then(() => {
        historyBatchRef.current = false;
      });

      const prev = cloneContent(contentRef.current);
      const nextHistory = [...historyRef.current, prev].slice(-60);
      historyRef.current = nextHistory;
      futureRef.current = [];
      setHistorySize(nextHistory.length);
      setFutureSize(0);
    }

    setDraft(next);
    if (draftSaveTimer.current) window.clearTimeout(draftSaveTimer.current);
    draftSaveTimer.current = window.setTimeout(() => {
      saveDraft(next);
    }, 600);
  }, [cloneContent, saveDraft]);

  const undo = useCallback(() => {
    if (!historyRef.current.length) return;
    const current = cloneContent(contentRef.current);
    const prev = historyRef.current[historyRef.current.length - 1];
    const nextHistory = historyRef.current.slice(0, -1);
    historyRef.current = nextHistory;
    setHistorySize(nextHistory.length);

    const nextFuture = [...futureRef.current, current].slice(-60);
    futureRef.current = nextFuture;
    setFutureSize(nextFuture.length);

    setContent(cloneContent(prev), { recordHistory: false });
  }, [cloneContent, setContent]);

  const redo = useCallback(() => {
    if (!futureRef.current.length) return;
    const current = cloneContent(contentRef.current);
    const next = futureRef.current[futureRef.current.length - 1];
    const nextFuture = futureRef.current.slice(0, -1);
    futureRef.current = nextFuture;
    setFutureSize(nextFuture.length);

    const nextHistory = [...historyRef.current, current].slice(-60);
    historyRef.current = nextHistory;
    setHistorySize(nextHistory.length);

    setContent(cloneContent(next), { recordHistory: false });
  }, [cloneContent, setContent]);

  useEffect(() => {
    function shouldIgnoreShortcut(target: EventTarget | null) {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = (el.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return true;
      if ((el as any).isContentEditable) return true;
      return false;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (shouldIgnoreShortcut(e.target)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [undo, redo]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const channel = supabase
      .channel("homepage_drafts_admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homepage_content_drafts", filter: "id=eq.1" },
        async () => {
          const dr = await supabase
            .from("homepage_content_drafts")
            .select("content, published_updated_at")
            .eq("id", 1)
            .maybeSingle();
          if (dr.data?.content) {
            const c = dr.data.content as Partial<HomepageContent>;
            const has = c && Object.keys(c).length;
            setDraft(has ? mergeContent(c) : null);
            if (dr.data.published_updated_at) setPublishedUpdatedAt(dr.data.published_updated_at);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const previewWidth =
    mode === "mobile" ? "w-[375px]" : mode === "tablet" ? "w-[768px]" : "w-full";

  const selectedSection = useMemo(
    () => pageSections.find((s) => s.id === selectedId) || null,
    [pageSections, selectedId],
  );
  const supportsBackgroundMedia = useMemo(() => {
    if (!selectedSection) return false;
    const rebuiltSupported = new Set(["hero", "founder", "promise", "how", "honest", "pricing", "application"]);
    const classicSupported = new Set(["hero", "trust", "features", "workflow", "pricing", "application", "testimonials", "custom", "custom_html", "rich_text"]);
    return isRebuiltTemplate ? rebuiltSupported.has(selectedSection.type) : classicSupported.has(selectedSection.type);
  }, [isRebuiltTemplate, selectedSection]);

  const updateSections = useCallback((next: PageSection[], opts?: { recordHistory?: boolean }) => {
    setContent({ ...content, page: { sections: next } }, opts);
  }, [content, setContent]);

  const updateSection = useCallback((id: string, updater: (s: PageSection) => PageSection, opts?: { recordHistory?: boolean }) => {
    updateSections(pageSections.map((s) => (s.id === id ? updater(s) : s)), opts);
  }, [pageSections, updateSections]);

  const updateSectionSilent = useCallback((id: string, updater: (s: PageSection) => PageSection) => {
    updateSection(id, updater, { recordHistory: false });
  }, [updateSection]);

  function makeId(prefix: string) {
    const safePrefix = prefix.replace(/[^a-z0-9_]+/gi, "_");
    const rand = (() => {
      if (typeof crypto !== "undefined") {
        const c = crypto as unknown as { randomUUID?: () => string };
        if (typeof c.randomUUID === "function") return c.randomUUID();
      }
      return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    })();
    return `${safePrefix}_${rand}`;
  }

  function duplicateSection(sectionId: string) {
    const idx = pageSections.findIndex((s) => s.id === sectionId);
    if (idx < 0) return;
    const original = pageSections[idx];
    const nextId = makeId(original.type);
    const clone = JSON.parse(JSON.stringify(original)) as PageSection;
    clone.id = nextId;
    if (Array.isArray(clone.blocks)) {
      clone.blocks = clone.blocks.map((b) => ({ ...b, id: makeId(b.type) }));
    }

    const nextSections = [...pageSections.slice(0, idx + 1), clone, ...pageSections.slice(idx + 1)];

    if (original.type === "custom") {
      const base = (content.customSections || []).find((x) => x.id === original.id);
      const nextCustom = base
        ? [...(content.customSections || []), { ...JSON.parse(JSON.stringify(base)), id: nextId }]
        : content.customSections;
      setContent({ ...content, page: { sections: nextSections }, customSections: nextCustom });
    } else {
      updateSections(nextSections);
    }

    setSelectedId(nextId);
  }

  function duplicateBlock(sectionId: string, blockId: string) {
    updateSection(sectionId, (s) => {
      const list = s.blocks || [];
      const idx = list.findIndex((b) => b.id === blockId);
      if (idx < 0) return s;
      const original = list[idx];
      const clone = JSON.parse(JSON.stringify(original));
      clone.id = makeId(original.type);
      const next = [...list.slice(0, idx + 1), clone, ...list.slice(idx + 1)];
      setSelectedBlockId(clone.id);
      return { ...s, blocks: next };
    });
  }

  function openMediaPicker(opts: { title: string; accept?: string; onPick: (asset: { url: string; path: string }) => void }) {
    mediaPickRef.current = opts.onPick;
    setMediaTitle(opts.title);
    setMediaAccept(opts.accept);
    setMediaOpen(true);
  }

  useEffect(() => {
    setSelectedBlockId(null);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedSection) return;
    if (selectedSection.type === "hero") {
      if (selectedSection.settings) return;
      updateSectionSilent(selectedSection.id, (s) => ({
        ...s,
        settings: {
          headingPrefix: content.hero.heading.prefix,
          headingHighlight: content.hero.heading.highlight,
          subcopy: content.hero.subcopy,
          note: content.hero.note || "",
          primaryText: content.hero.primaryCta.text,
          primaryHref: content.hero.primaryCta.href,
          secondaryText: content.hero.secondaryCta.text,
          secondaryHref: content.hero.secondaryCta.href,
          proofTitle: (content.hero as any).proof?.title || "",
          proofEyebrow: (content.hero as any).proof?.eyebrow || "",
          metricsText: Array.isArray((content.hero as any).metrics)
            ? (content.hero as any).metrics
                .map((metric: any) =>
                  [metric.title || "", metric.value || "", metric.change || "", metric.tone || "gold"].join(" | "),
                )
                .join("\n")
            : "",
          revenueValue: (content.hero as any).revenueVisual?.value || "",
          revenueLabel: (content.hero as any).revenueVisual?.label || "",
          background: content.hero.backgroundImage?.url ? { url: content.hero.backgroundImage.url } : undefined,
        },
      }));
      return;
    }
    if (selectedSection.type === "trust") {
      if (selectedSection.settings) return;
      updateSectionSilent(selectedSection.id, (s) => ({ ...s, settings: { eyebrow: content.trust.eyebrow } }));
      return;
    }
    if (selectedSection.type === "features") {
      if (selectedSection.blocks?.length) return;
      updateSectionSilent(selectedSection.id, (s) => ({
        ...s,
        blocks: content.features.cards.map((c, idx) => ({
          id: `feature_${idx + 1}`,
          type: "feature",
          content: {
            title: c.title,
            description: c.copy,
            icon: c.iconRef || (c.icon ? { type: "library", value: c.icon } : { type: "library", value: "website" }),
            materialIcon: c.icon || "",
          },
        })),
      }));
      return;
    }
    if (selectedSection.type === "pricing") {
      if (selectedSection.blocks?.length) return;
      updateSectionSilent(selectedSection.id, (s) => ({
        ...s,
        settings: { note: content.pricing.note || "" },
        blocks: content.pricing.tiers.map((t, idx) => ({
          id: `tier_${idx + 1}`,
          type: "tier",
          content: {
            badge: (t as any).badge || "",
            name: t.name,
            tagline: t.tagline,
            price: t.price,
            priceWas: (t as any).priceWas || "",
            priceSuffix: t.priceSuffix || "",
            outcome: (t as any).outcome || "",
            ctaText: t.ctaText,
            ctaHref: t.ctaHref,
            highlighted: Boolean(t.highlight),
            highlightBadge: t.highlight?.badge || "",
            highlightAccentHex: t.highlight?.accentHex || "",
            bullets: t.bullets,
          },
        })),
      }));
      return;
    }

    if (selectedSection.type === "audit_bridge") {
      if (selectedSection.settings) return;
      updateSectionSilent(selectedSection.id, (s) => ({
        ...s,
        settings: {
          heading: "",
          subcopy: "",
          ctaText: "",
          ctaHref: "#lead-form",
        },
      }));
      return;
    }
    if (selectedSection.type === "footer") {
      if (selectedSection.blocks?.length) return;
      const base = (content.socialLinksV2 || []).length
        ? content.socialLinksV2 || []
        : (content.socialLinks || []).map((l, idx) => ({
            id: `legacy_${idx + 1}`,
            platform: l.label,
            url: l.href,
            enabled: true,
          }));
      updateSectionSilent(selectedSection.id, (s) => ({
        ...s,
        blocks: base.map((x) => ({
          id: x.id,
          type: "social_link",
          content: {
            platform: x.platform,
            url: x.url,
            enabled: x.enabled,
            icon: (x as any).icon || { type: "library", value: x.platform },
          },
        })),
      }));
      return;
    }
  }, [
    selectedId,
    selectedSection,
    content.features.cards,
    content.hero,
    content.pricing.note,
    content.pricing.tiers,
    content.socialLinks,
    content.socialLinksV2,
    content.trust.eyebrow,
    updateSectionSilent,
  ]);

  if (loading) {
    return <div className="px-6 py-10 text-sm text-white/60">Loading…</div>;
  }

  const statusTone = draft ? "draft" : "published";
  const statusText = draft ? "Draft" : "Published";

  const navItems: { tab: Tab; label: string }[] = [
    { tab: "leads", label: "Leads" },
    { tab: "builder", label: "Builder" },
    { tab: "pages", label: "Pages" },
    { tab: "homepage", label: "JSON" },
    { tab: "custom", label: "Custom" },
    { tab: "settings", label: "Settings" },
  ];

  const sectionMeta = (id: string) => {
    const s = pageSections.find((x) => x.id === id);
    const t = String(s?.type || "");
    if (t === "hero") {
      return {
        subtitle: String(((resolved.hero as any)?.trust?.text as string) || "Built exclusively for…"),
        children: ["Headline", "Sub-headline", "Hero CTAs"],
      };
    }
    if (t === "features") {
      return { subtitle: String(resolved.features.subcopy || ""), children: [] as string[] };
    }
    if (t === "workflow") {
      return { subtitle: String(resolved.workflow.subcopy || ""), children: [] as string[] };
    }
    if (t === "pricing") {
      return { subtitle: String(resolved.pricing.note || ""), children: [] as string[] };
    }
    if (t === "application") {
      return { subtitle: String(resolved.application.subcopy || ""), children: [] as string[] };
    }
    if (t === "footer") {
      return { subtitle: String((resolved.footer.links?.[0]?.label as any) || "Legal links"), children: [] as string[] };
    }
    if (t === "audit_bridge") {
      return { subtitle: String((s?.settings as any)?.heading || ""), children: [] as string[] };
    }
    if (t === "custom_html") {
      return { subtitle: "HTML/CSS/JS", children: [] as string[] };
    }
    if (t === "testimonials") {
      return { subtitle: "Proof signals", children: [] as string[] };
    }
    if (t === "custom") {
      return { subtitle: "Custom section", children: [] as string[] };
    }
    return { subtitle: "", children: [] as string[] };
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--cf-bg)]">
      <div className="hidden lg:block">
        <div className="sticky top-0 z-30 border-b border-white/10 bg-[var(--cf-secondary)]/80 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-xs text-white/60">/admin</div>
              <div className="text-sm font-semibold text-white/90">Visual Builder</div>
              {pill(statusText, statusTone)}
            </div>

            <div className="flex flex-1 items-center justify-center">
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                {deviceButton(mode === "desktop", () => setMode("desktop"), <Monitor className="h-4 w-4" />, "Desktop")}
                {deviceButton(mode === "tablet", () => setMode("tablet"), <TabletIcon className="h-4 w-4" />, "Tablet")}
                {deviceButton(mode === "mobile", () => setMode("mobile"), <Smartphone className="h-4 w-4" />, "Mobile")}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
                disabled={historySize === 0}
                onClick={undo}
              >
                <Undo2 className="h-4 w-4" />
                Undo
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
                disabled={futureSize === 0}
                onClick={redo}
              >
                <Redo2 className="h-4 w-4" />
                Redo
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/80 hover:bg-white/10"
                onClick={loadLandingPreset}
              >
                Load landing preset
              </button>

              <div ref={backupsRef} className="relative">
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/80 hover:bg-white/10"
                  onClick={async () => {
                    const next = !backupsOpen;
                    setBackupsOpen(next);
                    if (next) await loadBackups();
                  }}
                >
                  Backups
                </button>

                {backupsOpen ? (
                  <div className="absolute right-0 top-full mt-2 w-[360px] rounded-2xl border border-white/10 bg-[var(--cf-secondary)] p-3 shadow-2xl">
                    <div className="flex items-center justify-between px-1 pb-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-white/60">Latest backups (5)</div>
                      <button
                        type="button"
                        className="text-xs font-semibold text-white/70 hover:text-white"
                        onClick={async () => {
                          await loadBackups();
                        }}
                      >
                        Refresh
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!backups.length ? (
                        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/70">
                          No backups yet. Use Save Draft or Publish to create one.
                        </div>
                      ) : null}
                      {backups.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-white">{formatTimestamp(b.createdAt)}</div>
                            <div className="text-xs text-white/50">Backup #{b.id}</div>
                          </div>
                          <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center rounded-xl bg-[var(--cf-accent)] px-3 text-xs font-bold text-[#0A0F1E] hover:brightness-95"
                            onClick={() => {
                              setDraft(b.content);
                              setSelectedId("hero");
                              setSelectedBlockId(null);
                              resetHistory();
                              setBackupsOpen(false);
                              setNotice(`Restored backup from ${formatTimestamp(b.createdAt)}`);
                            }}
                          >
                            Restore
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
                disabled={saving}
                onClick={async () => {
                  const ok = await saveDraft(content);
                  if (!ok) return;
                  await createBackupSnapshot(content);
                  setNotice("Draft saved (backup created)");
                }}
              >
                Save Draft
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-[var(--cf-accent)] px-3 text-xs font-bold text-[#0A0F1E] hover:brightness-95 disabled:opacity-50"
                disabled={!draft || publishing}
                onClick={publishNow}
              >
                Publish
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/80 hover:bg-white/10"
                onClick={async () => {
                  await supabase.from("homepage_content_drafts").upsert({ id: 1, content: {} }, { onConflict: "id" });
                  setDraft(null);
                  resetHistory();
                  setNotice("Reverted to published");
                }}
              >
                Revert
              </button>

              <button
                type="button"
                className="ml-2 inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/80 hover:bg-white/10"
                onClick={async () => {
                  if (onSignOut) await onSignOut();
                  else await supabase.auth.signOut();
                  router.refresh();
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="sticky top-0 z-30 border-b border-white/10 bg-[var(--cf-secondary)]/85 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/90"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <PanelLeft className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-[var(--cf-accent)]" />
              <div className="truncate text-sm font-semibold text-white">
                Shaditz <span className="text-[var(--cf-accent)]">AI</span>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--cf-accent)] px-4 text-sm font-bold text-[#0A0F1E] disabled:opacity-50"
              disabled={!draft || publishing}
              onClick={publishNow}
            >
              Publish
            </button>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/90"
              onClick={() => setMobileActionsOpen(true)}
              aria-label="More"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-white/60">/admin – Visual Builder</div>
            {pill(statusText, statusTone)}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mx-4 mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 lg:mx-6">
          <div>{error}</div>
          {publishConflict && error.startsWith("Publish conflict") ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="mr-auto text-xs text-rose-100/70">
                Latest publish: {formatTimestamp(publishConflict.latestUpdatedAt)}
              </div>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/80 hover:bg-white/10"
                onClick={loadAll}
              >
                Reload
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-[var(--cf-accent)] px-3 text-xs font-bold text-[#0A0F1E] hover:brightness-95 disabled:opacity-50"
                disabled={publishing || !draft}
                onClick={forcePublishNow}
              >
                Publish anyway
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {notice ? (
        <div className="mx-4 mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 lg:mx-6">
          {notice}
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 pb-24 lg:flex-row lg:pb-3">
        <div
          className={`${mobilePane === "sections" ? "flex" : "hidden"} h-full min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-[var(--cf-secondary)]/60 p-3 lg:flex lg:w-[280px] lg:flex-none`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wide text-white/50">Sections</div>
            <div className="text-xs text-white/40">Drag to reorder</div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-20 lg:pb-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => {
                const { active, over } = e;
                if (!over || active.id === over.id) return;
                const oldIndex = pageSections.findIndex((s) => s.id === active.id);
                const newIndex = pageSections.findIndex((s) => s.id === over.id);
                const next = arrayMove(pageSections, oldIndex, newIndex);
                setContent({
                  ...content,
                  page: { sections: next },
                });
              }}
            >
              <SortableContext items={pageSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {pageSections.map((s) => {
                    const meta = sectionMeta(s.id);
                    return (
                      <SectionRow
                        key={s.id}
                        item={s}
                        selected={selectedId === s.id}
                        subtitle={meta.subtitle}
                        onSelect={() => setSelectedId(s.id)}
                        onDuplicate={() => duplicateSection(s.id)}
                        onToggle={() => {
                          const next = pageSections.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x));
                          setContent({ ...content, page: { sections: next } });
                        }}
                      >
                        {meta.children}
                      </SectionRow>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>

            <div className="mt-3">
              <div
                className={
                  selectedId === "__whatsapp"
                    ? "rounded-2xl border border-[var(--cf-accent)]/40 bg-[var(--cf-accent)]/10"
                    : "rounded-2xl border border-white/10 bg-white/5 hover:bg-white/7"
                }
              >
                <div className="flex items-center gap-3 px-3 py-3">
                  <button type="button" className="flex-1 text-left" onClick={() => setSelectedId("__whatsapp")}>
                    <div className="text-sm font-semibold text-white">WhatsApp</div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-white/50">Floating chat widget</div>
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    onClick={() => {
                      setContent({
                        ...content,
                        whatsapp: {
                          ...(content.whatsapp || homepageDefaults.whatsapp!),
                          enabled: !content.whatsapp?.enabled,
                        },
                      });
                    }}
                    aria-label="Toggle"
                  >
                    <MaterialIcon name={content.whatsapp?.enabled ? "visibility" : "visibility_off"} className="text-[18px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Select
                label="Add section"
                value={addType}
                onChange={(e) => setAddType(e.target.value)}
                options={[
                  { value: "hero", label: "Hero" },
                  { value: "trust_strip", label: "Trust Strip" },
                  { value: "founder", label: "Founder" },
                  { value: "promise", label: "Promise" },
                  { value: "how", label: "How It Works" },
                  { value: "honest", label: "Honest" },
                  { value: "pricing", label: "Pricing" },
                  { value: "application", label: "Application" },
                  { value: "footer", label: "Footer" },
                  { value: "custom_html", label: "Custom HTML" },
                ]}
              />
              <Button
                variant="secondary"
                className="h-11 px-4"
                onClick={() => {
                  const id = `${addType}_${Date.now()}`;
                  const next: PageSection = {
                    id,
                    type: addType as any,
                    enabled: true,
                    settings:
                      addType === "custom_html"
                        ? { html: "<div></div>", css: "", js: "" }
                        : undefined,
                    blocks:
                      addType === "pricing"
                        ? [
                            {
                              id: `tier_${Date.now()}`,
                              type: "tier",
                              content: { name: "", tagline: "", price: "", bullets: [], ctaText: "Select", ctaHref: "#apply" },
                            },
                          ]
                        : addType === "footer"
                          ? [{ id: `social_${Date.now()}`, type: "social_link", content: { platform: "instagram", url: "", enabled: true, icon: { type: "library", value: "instagram" } } }]
                          : [],
                  };
                  updateSections([...pageSections, next]);
                  setSelectedId(id);
                }}
              >
                Add
              </Button>
            </div>
            <Button
              variant="secondary"
              className="h-11 w-full"
              onClick={() => {
                const id = `custom_${Date.now()}`;
                const nextSections: PageSection[] = [...pageSections, { id, type: "custom" as const, enabled: true }];
                const nextCustom = [...(content.customSections || []), { id, enabled: true, html: "<div></div>", css: "", js: "" }];
                setContent({ ...content, page: { sections: nextSections }, customSections: nextCustom });
                setSelectedId(id);
              }}
            >
              Add Custom Section
            </Button>
          </div>
        </div>

        <div
          className={`${mobilePane === "preview" ? "flex" : "hidden"} relative h-full min-h-0 flex-1 justify-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(1200px_circle_at_50%_0%,rgba(255,255,255,0.10),transparent_60%)] lg:flex`}
        >
          <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden p-3 lg:p-5">
            <div className={`h-full ${previewWidth} overflow-hidden rounded-2xl border border-white/10 bg-[#0A0F1E] shadow-[0_18px_50px_rgba(0,0,0,0.55)]`}>
              <RebuiltLandingFrame
                content={resolved}
                device={mode}
                height="100%"
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent" />

          <div className="lg:hidden">
            <button
              type="button"
              className="absolute right-4 top-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/90 shadow-lg"
              onClick={() => setMobilePane("inspector")}
            >
              Edit {String(selectedSection?.type || "section").replaceAll("_", " ")}
            </button>
          </div>
        </div>

        <div
          className={`${mobilePane === "inspector" ? "flex" : "hidden"} h-full min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-[var(--cf-secondary)]/60 p-4 lg:flex lg:w-[360px] lg:flex-none`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wide text-white/50">Inspector</div>
            <div className="lg:hidden text-xs font-semibold text-white/70">SECTION: {String(selectedSection?.type || "").replaceAll("_", " ").toUpperCase()}</div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-24 lg:pb-4">
          {selectedSection && selectedSection.id !== "footer" ? (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#0b1414]">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{selectedSection.type}</div>
              <Button
                variant="secondary"
                className="h-9"
                onClick={() => {
                  updateSections(pageSections.filter((s) => s.id !== selectedSection.id));
                  setSelectedId("hero");
                }}
              >
                Delete
              </Button>
            </div>
          ) : null}

          {selectedSection ? (
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#0b1414]">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Enabled"
                  value={selectedSection.enabled ? "yes" : "no"}
                  onChange={(e) => {
                    const enabled = e.target.value === "yes";
                    updateSection(selectedSection.id, (s) => ({ ...s, enabled }));
                  }}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />
                {supportsBackgroundMedia ? (
                  <Select
                    label="Background type"
                    value={String((selectedSection.settings as any)?.backgroundType || "none")}
                    onChange={(e) =>
                      updateSection(selectedSection.id, (s) => ({
                        ...s,
                        settings: { ...(s.settings || {}), backgroundType: e.target.value === "none" ? undefined : e.target.value },
                      }))
                    }
                    options={[
                      { value: "none", label: "None" },
                      { value: "color", label: "Color" },
                      { value: "image", label: "Image" },
                      { value: "video", label: "Video" },
                    ]}
                  />
                ) : (
                  <Input label="Background media" value="Not supported for this section" readOnly />
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Padding top (px)"
                  type="number"
                  value={String((selectedSection.settings as any)?.paddingTop ?? "")}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    const paddingTop = v.length ? Number(v) : undefined;
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), paddingTop, paddingY: undefined },
                    }));
                  }}
                />
                <Input
                  label="Padding bottom (px)"
                  type="number"
                  value={String((selectedSection.settings as any)?.paddingBottom ?? "")}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    const paddingBottom = v.length ? Number(v) : undefined;
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), paddingBottom, paddingY: undefined },
                    }));
                  }}
                />
              </div>

              {selectedSection.type === "features" ||
              selectedSection.type === "workflow" ||
              selectedSection.type === "pricing" ||
              selectedSection.type === "application" ? (
                <Input
                  label="Label tag"
                  value={String((selectedSection.settings as any)?.label || "")}
                  onChange={(e) =>
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), label: e.target.value },
                    }))
                  }
                />
              ) : null}

              {selectedSection.type === "workflow" ? (
                <Select
                  label="Workflow variant"
                  value={String((selectedSection.settings as any)?.variant || "landing")}
                  onChange={(e) =>
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), variant: e.target.value },
                    }))
                  }
                  options={[
                    { value: "landing", label: "Landing list" },
                    { value: "accordion", label: "Accordion" },
                  ]}
                />
              ) : null}

              {selectedSection.type === "footer" ? (
                <Select
                  label="Show social"
                  value={(selectedSection.settings as any)?.showSocial ? "yes" : "no"}
                  onChange={(e) =>
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), showSocial: e.target.value === "yes" },
                    }))
                  }
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                />
              ) : null}

              {supportsBackgroundMedia ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label="Background color"
                    value={String((selectedSection.settings as any)?.backgroundColor ?? (selectedSection.settings as any)?.backgroundColorHex ?? "")}
                    onChange={(e) =>
                      updateSection(selectedSection.id, (s) => ({
                        ...s,
                        settings: {
                          ...(s.settings || {}),
                          backgroundType: "color",
                          backgroundColor: e.target.value,
                          backgroundColorHex: e.target.value,
                        },
                      }))
                    }
                    placeholder="#0b1414"
                  />
                  <Input
                    label="Overlay color"
                    value={String((selectedSection.settings as any)?.overlayColor ?? "")}
                    onChange={(e) =>
                      updateSection(selectedSection.id, (s) => ({
                        ...s,
                        settings: { ...(s.settings || {}), overlayColor: e.target.value },
                      }))
                    }
                    placeholder="rgba(0,0,0,0.3)"
                  />
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Container width"
                  value={String((selectedSection.settings as any)?.containerWidth || "lg")}
                  onChange={(e) =>
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), containerWidth: e.target.value },
                    }))
                  }
                  options={[
                    { value: "sm", label: "sm" },
                    { value: "md", label: "md" },
                    { value: "lg", label: "lg" },
                    { value: "full", label: "full" },
                  ]}
                />
                <Select
                  label="Alignment"
                  value={String((selectedSection.settings as any)?.alignment || "center")}
                  onChange={(e) =>
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), alignment: e.target.value },
                    }))
                  }
                  options={[
                    { value: "left", label: "Left" },
                    { value: "center", label: "Center" },
                    { value: "right", label: "Right" },
                  ]}
                />
              </div>

              {supportsBackgroundMedia ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    variant="secondary"
                    className="mt-6 h-10"
                    onClick={() => {
                      openMediaPicker({
                        title: "Pick background media",
                        accept: "image/*,video/*",
                        onPick: (asset) => {
                          const lower = asset.url.toLowerCase();
                          const isVideo = lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov");
                          updateSection(selectedSection.id, (s) => ({
                            ...s,
                            settings: {
                              ...(s.settings || {}),
                              backgroundType: isVideo ? "video" : "image",
                              backgroundImage: isVideo ? undefined : asset.url,
                              backgroundVideo: isVideo ? asset.url : undefined,
                              background: { url: asset.url, path: asset.path },
                            },
                          }));
                        },
                      });
                    }}
                  >
                    Pick media
                  </Button>
                  <Button
                    variant="secondary"
                    className="mt-6 h-10"
                    onClick={() =>
                      updateSection(selectedSection.id, (s) => ({
                        ...s,
                        settings: {
                          ...(s.settings || {}),
                          backgroundType: undefined,
                          backgroundColor: undefined,
                          backgroundImage: undefined,
                          backgroundVideo: undefined,
                          overlayColor: undefined,
                          background: undefined,
                        },
                      }))
                    }
                  >
                    Clear bg
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {selectedId === "hero" ? (
            <div className="flex flex-col gap-3">
              {isRebuiltTemplate ? (
                <InspectorGroup title="Rebuilt Hero">
                  <Input
                    label={labelRow("Tag", `${String((content.rebuilt as any)?.hero?.tag || "").length} chars`)}
                    value={String((content.rebuilt as any)?.hero?.tag || "")}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        rebuilt: { ...(content.rebuilt || {}), hero: { ...((content.rebuilt as any)?.hero || {}), tag: e.target.value } } as any,
                      })
                    }
                  />
                  <Input
                    label={labelRow("Headline line 1", `${String((content.rebuilt as any)?.hero?.headlineLine1 || "").length} chars`)}
                    value={String((content.rebuilt as any)?.hero?.headlineLine1 || "")}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        rebuilt: {
                          ...(content.rebuilt || {}),
                          hero: { ...((content.rebuilt as any)?.hero || {}), headlineLine1: e.target.value },
                        } as any,
                      })
                    }
                  />
                  <Input
                    label={labelRow("Headline line 2 prefix", `${String((content.rebuilt as any)?.hero?.headlineLine2Prefix || "").length} chars`)}
                    value={String((content.rebuilt as any)?.hero?.headlineLine2Prefix || "")}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        rebuilt: {
                          ...(content.rebuilt || {}),
                          hero: { ...((content.rebuilt as any)?.hero || {}), headlineLine2Prefix: e.target.value },
                        } as any,
                      })
                    }
                  />
                  <Input
                    label={labelRow("Headline highlight", `${String((content.rebuilt as any)?.hero?.headlineHighlight || "").length} chars`)}
                    value={String((content.rebuilt as any)?.hero?.headlineHighlight || "")}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        rebuilt: {
                          ...(content.rebuilt || {}),
                          hero: { ...((content.rebuilt as any)?.hero || {}), headlineHighlight: e.target.value },
                        } as any,
                      })
                    }
                  />
                  <Textarea
                    label={labelRow("Subcopy (before strong)", `${String((content.rebuilt as any)?.hero?.subcopyBeforeStrong || "").length} chars`)}
                    value={String((content.rebuilt as any)?.hero?.subcopyBeforeStrong || "")}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        rebuilt: {
                          ...(content.rebuilt || {}),
                          hero: { ...((content.rebuilt as any)?.hero || {}), subcopyBeforeStrong: e.target.value },
                        } as any,
                      })
                    }
                    rows={2}
                  />
                  <Textarea
                    label={labelRow("Subcopy (strong)", `${String((content.rebuilt as any)?.hero?.subcopyStrong || "").length} chars`)}
                    value={String((content.rebuilt as any)?.hero?.subcopyStrong || "")}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        rebuilt: { ...(content.rebuilt || {}), hero: { ...((content.rebuilt as any)?.hero || {}), subcopyStrong: e.target.value } } as any,
                      })
                    }
                    rows={2}
                  />
                  <Textarea
                    label={labelRow("Subcopy (after strong)", `${String((content.rebuilt as any)?.hero?.subcopyAfterStrong || "").length} chars`)}
                    value={String((content.rebuilt as any)?.hero?.subcopyAfterStrong || "")}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        rebuilt: {
                          ...(content.rebuilt || {}),
                          hero: { ...((content.rebuilt as any)?.hero || {}), subcopyAfterStrong: e.target.value },
                        } as any,
                      })
                    }
                    rows={2}
                  />
                  <Input
                    label={labelRow("Note", `${String((content.rebuilt as any)?.hero?.note || "").length} chars`)}
                    value={String((content.rebuilt as any)?.hero?.note || "")}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        rebuilt: { ...(content.rebuilt || {}), hero: { ...((content.rebuilt as any)?.hero || {}), note: e.target.value } } as any,
                      })
                    }
                  />
                </InspectorGroup>
              ) : null}
              <InspectorGroup title="Hero Background">
                <Select
                  label={labelRow("Hero background")}
                  value={((pageSections.find((s) => s.id === "hero")?.settings as any)?.heroBackground ?? true) ? "on" : "off"}
                  onChange={(e) => {
                    const on = e.target.value === "on";
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), heroBackground: on } }));
                  }}
                  options={[
                    { value: "on", label: "On" },
                    { value: "off", label: "Off" },
                  ]}
                />

                <Select
                  label={labelRow("Hero metrics panel")}
                  value={((pageSections.find((s) => s.id === "hero")?.settings as any)?.heroPanel ?? true) ? "on" : "off"}
                  onChange={(e) => {
                    const on = e.target.value === "on";
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), heroPanel: on } }));
                  }}
                  options={[
                    { value: "on", label: "On" },
                    { value: "off", label: "Off" },
                  ]}
                />
              </InspectorGroup>

              <InspectorGroup title="Content">
                <Input
                  label={labelRow("Headline prefix", `${content.hero.heading.prefix.length} chars`)}
                  value={content.hero.heading.prefix}
                  onChange={(e) => {
                    setContent({ ...content, hero: { ...content.hero, heading: { ...content.hero.heading, prefix: e.target.value } } });
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), headingPrefix: e.target.value } }));
                  }}
                />
                <Input
                  label={labelRow("Headline highlight", `${content.hero.heading.highlight.length} chars`)}
                  value={content.hero.heading.highlight}
                  onChange={(e) => {
                    setContent({ ...content, hero: { ...content.hero, heading: { ...content.hero.heading, highlight: e.target.value } } });
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), headingHighlight: e.target.value } }));
                  }}
                />
                <Textarea
                  label={labelRow("Sub-headline", `${content.hero.subcopy.length} chars`)}
                  value={content.hero.subcopy}
                  onChange={(e) => {
                    setContent({ ...content, hero: { ...content.hero, subcopy: e.target.value } });
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), subcopy: e.target.value } }));
                  }}
                  rows={4}
                />
                <Textarea
                  label={(() => {
                    const trustValue = [
                      String(content.hero.trust?.text || "").trim(),
                      ...(content.hero.trust?.pills || []).map((x) => String(x || "").trim()),
                    ]
                      .filter((x) => x.length)
                      .join("\n");
                    return labelRow("Hero trust text", `${trustValue.length} chars`);
                  })()}
                  value={[
                    String(content.hero.trust?.text || "").trim(),
                    ...(content.hero.trust?.pills || []).map((x) => String(x || "").trim()),
                  ]
                    .filter((x) => x.length)
                    .join("\n")}
                  onChange={(e) => {
                    const lines = e.target.value
                      .split("\n")
                      .map((x) => x.trim())
                      .filter((x) => x.length);
                    const text = lines[0] || "";
                    const pills = lines.slice(1);
                    const trust = { text, pills };
                    setContent({ ...content, hero: { ...content.hero, trust } });
                  }}
                  rows={5}
                />
                <Textarea
                  label={labelRow("Note", `${String(content.hero.note || "").length} chars`)}
                  value={content.hero.note || ""}
                  onChange={(e) => {
                    setContent({ ...content, hero: { ...content.hero, note: e.target.value } });
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), note: e.target.value } }));
                  }}
                  rows={3}
                />
              </InspectorGroup>

              <InspectorGroup title="Hero Metrics Panel">
                <Input
                  label={labelRow("Proof title")}
                  value={(content.hero as any).proof?.title || ""}
                  onChange={(e) => {
                    const proof = { ...((content.hero as any).proof || {}), title: e.target.value };
                    setContent({ ...content, hero: { ...(content.hero as any), proof } });
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), proofTitle: e.target.value } }));
                  }}
                />
                <Input
                  label={labelRow("Proof eyebrow")}
                  value={(content.hero as any).proof?.eyebrow || ""}
                  onChange={(e) => {
                    const proof = { ...((content.hero as any).proof || {}), eyebrow: e.target.value };
                    setContent({ ...content, hero: { ...(content.hero as any), proof } });
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), proofEyebrow: e.target.value } }));
                  }}
                />
                <Textarea
                  label={labelRow("Metrics", "title | value | change | tone")}
                  value={
                    Array.isArray((content.hero as any).metrics)
                      ? (content.hero as any).metrics
                          .map((metric: any) =>
                            [metric.title || "", metric.value || "", metric.change || "", metric.tone || "gold"].join(" | "),
                          )
                          .join("\n")
                      : ""
                  }
                  onChange={(e) => {
                    const metrics = e.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => {
                        const [title = "", value = "", change = "", tone = "gold"] = line
                          .split("|")
                          .map((part) => part.trim());
                        return {
                          title,
                          value,
                          change,
                          tone: tone === "blue" || tone === "green" ? tone : "gold",
                        };
                      })
                      .filter((metric) => metric.title && metric.value);
                    setContent({ ...content, hero: { ...(content.hero as any), metrics } });
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), metricsText: e.target.value } }));
                  }}
                  rows={4}
                />
                <Input
                  label={labelRow("Revenue visual value")}
                  value={(content.hero as any).revenueVisual?.value || ""}
                  onChange={(e) => {
                    const revenueVisual = { ...((content.hero as any).revenueVisual || {}), value: e.target.value };
                    setContent({ ...content, hero: { ...(content.hero as any), revenueVisual } });
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), revenueValue: e.target.value } }));
                  }}
                />
                <Input
                  label={labelRow("Revenue visual label")}
                  value={(content.hero as any).revenueVisual?.label || ""}
                  onChange={(e) => {
                    const revenueVisual = { ...((content.hero as any).revenueVisual || {}), label: e.target.value };
                    setContent({ ...content, hero: { ...(content.hero as any), revenueVisual } });
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), revenueLabel: e.target.value } }));
                  }}
                />
              </InspectorGroup>

              <InspectorGroup title="Call To Action">
                <Input
                  label={labelRow("Primary CTA text", `${content.hero.primaryCta.text.length} chars`)}
                  value={content.hero.primaryCta.text}
                  onChange={(e) => {
                    setContent({ ...content, hero: { ...content.hero, primaryCta: { ...content.hero.primaryCta, text: e.target.value } } });
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), primaryText: e.target.value } }));
                  }}
                />
                <Input
                  label={labelRow("Primary CTA href", `${content.hero.primaryCta.href.length} chars`)}
                  value={content.hero.primaryCta.href}
                  onChange={(e) => {
                    setContent({ ...content, hero: { ...content.hero, primaryCta: { ...content.hero.primaryCta, href: e.target.value } } });
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), primaryHref: e.target.value } }));
                  }}
                />
                <Input
                  label={labelRow("Secondary CTA text", `${content.hero.secondaryCta.text.length} chars`)}
                  value={content.hero.secondaryCta.text}
                  onChange={(e) => {
                    setContent({ ...content, hero: { ...content.hero, secondaryCta: { ...content.hero.secondaryCta, text: e.target.value } } });
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), secondaryText: e.target.value } }));
                  }}
                />
                <Input
                  label={labelRow("Secondary CTA href", `${content.hero.secondaryCta.href.length} chars`)}
                  value={content.hero.secondaryCta.href}
                  onChange={(e) => {
                    setContent({ ...content, hero: { ...content.hero, secondaryCta: { ...content.hero.secondaryCta, href: e.target.value } } });
                    updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), secondaryHref: e.target.value } }));
                  }}
                />
              </InspectorGroup>
            </div>
          ) : selectedId === "pricing" ? (
            <div className="flex flex-col gap-3">
              <InspectorGroup title="Content">
                <Input
                  label={labelRow("Section tag", `${String((content.pricing as any).tag || "").length} chars`)}
                  value={String((content.pricing as any).tag || "")}
                  onChange={(e) => setContent({ ...content, pricing: { ...content.pricing, tag: e.target.value } as any })}
                />
                <Input
                  label={labelRow("Section heading", `${content.pricing.heading.length} chars`)}
                  value={content.pricing.heading}
                  onChange={(e) => setContent({ ...content, pricing: { ...content.pricing, heading: e.target.value } })}
                />
                <Textarea
                  label={labelRow("Section subcopy", `${content.pricing.subcopy.length} chars`)}
                  value={content.pricing.subcopy}
                  onChange={(e) => setContent({ ...content, pricing: { ...content.pricing, subcopy: e.target.value } })}
                  rows={3}
                />
                <Textarea
                  label={labelRow("Bottom note", `${String((selectedSection?.settings as any)?.note || content.pricing.note || "").length} chars`)}
                  value={String((selectedSection?.settings as any)?.note || content.pricing.note || "")}
                  onChange={(e) => {
                    setContent({ ...content, pricing: { ...content.pricing, note: e.target.value } });
                    updateSection("pricing", (s) => ({ ...s, settings: { ...(s.settings || {}), note: e.target.value } }));
                  }}
                  rows={2}
                />
              </InspectorGroup>

              <InspectorGroup title="Tiers">
                <Textarea
                  label={labelRow("Tier blocks")}
                  value={"Use the block editor below (section blocks)."}
                  readOnly
                  rows={2}
                />
              {selectedSection?.blocks?.length ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => {
                    const { active, over } = e;
                    if (!over || active.id === over.id) return;
                    updateSection("pricing", (s) => {
                      const list = s.blocks || [];
                      const oldIndex = list.findIndex((b) => b.id === active.id);
                      const newIndex = list.findIndex((b) => b.id === over.id);
                      const next = arrayMove(list, oldIndex, newIndex);
                      return { ...s, blocks: next };
                    });
                  }}
                >
                  <SortableContext items={(selectedSection.blocks || []).map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-2">
                      {(selectedSection.blocks || []).map((b) => (
                        <BlockRow
                          key={b.id}
                          id={b.id}
                          title={String(b.content?.name || b.id)}
                          selected={false}
                          onSelect={() => {}}
                          onDuplicate={() => duplicateBlock("pricing", b.id)}
                          onRemove={() =>
                            updateSection("pricing", (s) => ({ ...s, blocks: (s.blocks || []).filter((x) => x.id !== b.id) }))
                          }
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : null}
              <Button
                variant="secondary"
                className="h-10"
                onClick={() => {
                  updateSection("pricing", (s) => ({
                    ...s,
                    blocks: [
                      ...(s.blocks || []),
                      {
                        id: `tier_${Date.now()}`,
                        type: "tier",
                        content: {
                          badge: "",
                          name: "",
                          tagline: "",
                          price: "",
                          priceWas: "",
                          priceSuffix: "",
                          bullets: [],
                          ctaText: "Select",
                          ctaHref: isRebuiltTemplate ? "#apply" : "#lead-form",
                        },
                      },
                    ],
                  }));
                }}
              >
                Add tier
              </Button>
              {(selectedSection?.blocks || [])
                .filter((b) => b.type === "tier")
                .map((b) => (
                  <div key={b.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Tier</div>
                    <Input
                      label="Badge"
                      value={String(b.content?.badge || "")}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, badge: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="Name"
                      value={String(b.content?.name || "")}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, name: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="Price"
                      value={String(b.content?.price || "")}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, price: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="Price was"
                      value={String(b.content?.priceWas || "")}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, priceWas: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="Price suffix"
                      value={String(b.content?.priceSuffix || "")}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, priceSuffix: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="Outcome"
                      value={String(b.content?.outcome || "")}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, outcome: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Textarea
                      label="Tagline"
                      value={String(b.content?.tagline || "")}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, tagline: e.target.value } } : x,
                          ),
                        }))
                      }
                      rows={2}
                    />
                    <Select
                      label="Highlighted"
                      value={b.content?.highlighted ? "yes" : "no"}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id
                              ? { ...x, content: { ...x.content, highlighted: e.target.value === "yes" } }
                              : x,
                          ),
                        }))
                      }
                      options={[
                        { value: "no", label: "No" },
                        { value: "yes", label: "Yes" },
                      ]}
                    />
                    <Input
                      label="CTA text"
                      value={String(b.content?.ctaText || "")}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, ctaText: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="CTA href"
                      value={String(b.content?.ctaHref || "")}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, ctaHref: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Textarea
                      label="Bullets (one per line)"
                      value={Array.isArray(b.content?.bullets) ? (b.content?.bullets as string[]).join("\n") : ""}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id
                              ? {
                                  ...x,
                                  content: {
                                    ...x.content,
                                    bullets: e.target.value
                                      .split("\n")
                                      .map((v) => v.trim())
                                      .filter(Boolean),
                                  },
                                }
                              : x,
                          ),
                        }))
                      }
                      rows={4}
                    />
                  </div>
                ))}
              </InspectorGroup>
            </div>
          ) : selectedId === "footer" ? (
            <div className="flex flex-col gap-3">
              <InspectorGroup title="Content">
                <Textarea
                  label={labelRow("Copyright", `${content.footer.copyright.length} chars`)}
                  value={content.footer.copyright}
                  onChange={(e) => setContent({ ...content, footer: { ...content.footer, copyright: e.target.value } })}
                  rows={2}
                />
              </InspectorGroup>

              <InspectorGroup title="Social Links">
                <Button
                  variant="secondary"
                  className="h-10"
                  onClick={() => {
                    updateSection("footer", (s) => ({
                      ...s,
                      blocks: [
                        ...(s.blocks || []),
                        {
                          id: `social_${Date.now()}`,
                          type: "social_link",
                          content: { platform: "instagram", url: "", enabled: true, icon: { type: "library", value: "instagram" } },
                        },
                      ],
                    }));
                  }}
                >
                  Add social link
                </Button>
                {(selectedSection?.blocks || [])
                  .filter((b) => b.type === "social_link")
                  .map((b) => (
                    <div key={b.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      {(() => {
                        const raw = String(b.content?.platform || "");
                        const key = raw.trim().toLowerCase();
                        const isPreset = SOCIAL_PLATFORM_PRESETS.some((p) => p.value === (key as any));
                        const presetValue = isPreset ? (key as (typeof SOCIAL_PLATFORM_PRESETS)[number]["value"]) : "custom";
                        return (
                          <>
                            <Select
                              label={labelRow("Platform")}
                              value={presetValue}
                              onChange={(e) => {
                                const next = e.target.value;
                                if (next === "custom") return;
                                updateSection("footer", (s) => ({
                                  ...s,
                                  blocks: (s.blocks || []).map((x) => {
                                    if (x.id !== b.id) return x;
                                    const existingIcon = (x.content as any)?.icon as IconRef | null | undefined;
                                    const keepUpload = existingIcon?.type === "upload";
                                    return {
                                      ...x,
                                      content: {
                                        ...x.content,
                                        platform: next,
                                        icon: keepUpload ? existingIcon : ({ type: "library", value: next } as any),
                                      },
                                    };
                                  }),
                                }));
                              }}
                              options={[...SOCIAL_PLATFORM_PRESETS, { value: "custom", label: "Custom" }]}
                            />

                            {!isPreset ? (
                              <Input
                                label={labelRow("Custom platform")}
                                value={raw}
                                onChange={(e) =>
                                  updateSection("footer", (s) => ({
                                    ...s,
                                    blocks: (s.blocks || []).map((x) =>
                                      x.id === b.id ? { ...x, content: { ...x.content, platform: e.target.value } } : x,
                                    ),
                                  }))
                                }
                              />
                            ) : null}
                          </>
                        );
                      })()}
                      <Input
                        label={labelRow("URL")}
                        value={String(b.content?.url || "")}
                        onChange={(e) =>
                          updateSection("footer", (s) => ({
                            ...s,
                            blocks: (s.blocks || []).map((x) =>
                              x.id === b.id ? { ...x, content: { ...x.content, url: e.target.value } } : x,
                            ),
                          }))
                        }
                      />
                      <Select
                        label={labelRow("Enabled")}
                        value={b.content?.enabled === false ? "no" : "yes"}
                        onChange={(e) =>
                          updateSection("footer", (s) => ({
                            ...s,
                            blocks: (s.blocks || []).map((x) =>
                              x.id === b.id
                                ? { ...x, content: { ...x.content, enabled: e.target.value === "yes" } }
                                : x,
                            ),
                          }))
                        }
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                      />
                      <IconPicker
                        supabase={supabase}
                        label={labelRow("Icon")}
                        value={(b.content?.icon as IconRef | undefined) || { type: "library", value: String(b.content?.platform || "website") }}
                        onChange={(next) =>
                          updateSection("footer", (s) => ({
                            ...s,
                            blocks: (s.blocks || []).map((x) =>
                              x.id === b.id ? { ...x, content: { ...x.content, icon: next } } : x,
                            ),
                          }))
                        }
                      />
                    </div>
                  ))}

                <Textarea
                  label={labelRow("Legacy socialLinks (JSON fallback)", `${JSON.stringify(content.socialLinks || [], null, 2).length} chars`)}
                  value={JSON.stringify(content.socialLinks || [], null, 2)}
                  onChange={(e) => {
                    try {
                      const next = JSON.parse(e.target.value) as HomepageContent["socialLinks"];
                      if (!Array.isArray(next)) return;
                      setContent({ ...content, socialLinks: next });
                    } catch {
                    }
                  }}
                  rows={6}
                />
              </InspectorGroup>
            </div>
          ) : selectedSection?.type === "workflow" ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Section heading"
                value={content.workflow.heading}
                onChange={(e) => setContent({ ...content, workflow: { ...content.workflow, heading: e.target.value } })}
              />
              <Textarea
                label="Section subcopy"
                value={content.workflow.subcopy}
                onChange={(e) => setContent({ ...content, workflow: { ...content.workflow, subcopy: e.target.value } })}
                rows={3}
              />
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Steps</div>
              <Button
                variant="secondary"
                className="h-10"
                onClick={() =>
                  setContent({
                    ...content,
                    workflow: {
                      ...content.workflow,
                      steps: [...content.workflow.steps, { title: "", copy: "" }],
                    },
                  })
                }
              >
                Add step
              </Button>
              {content.workflow.steps.map((s, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Step {idx + 1}</div>
                    <Button
                      variant="secondary"
                      className="h-9"
                      onClick={() =>
                        setContent({
                          ...content,
                          workflow: {
                            ...content.workflow,
                            steps: content.workflow.steps.filter((_, i) => i !== idx),
                          },
                        })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                  <Input
                    label="Title"
                    value={s.title}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        workflow: {
                          ...content.workflow,
                          steps: content.workflow.steps.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)),
                        },
                      })
                    }
                  />
                  <Textarea
                    label="Copy"
                    value={s.copy}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        workflow: {
                          ...content.workflow,
                          steps: content.workflow.steps.map((x, i) => (i === idx ? { ...x, copy: e.target.value } : x)),
                        },
                      })
                    }
                    rows={3}
                  />
                </div>
              ))}
            </div>
          ) : selectedSection?.type === "features" ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Section heading"
                value={content.features.heading}
                onChange={(e) => setContent({ ...content, features: { ...content.features, heading: e.target.value } })}
              />
              <Textarea
                label="Section subcopy"
                value={content.features.subcopy}
                onChange={(e) => setContent({ ...content, features: { ...content.features, subcopy: e.target.value } })}
                rows={3}
              />
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Feature blocks</div>
              <Button
                variant="secondary"
                className="h-10"
                onClick={() => {
                  updateSection(selectedSection.id, (s) => ({
                    ...s,
                    blocks: [
                      ...(s.blocks || []),
                      { id: `feature_${Date.now()}`, type: "feature", content: { title: "", description: "", icon: { type: "library", value: "website" } } },
                    ],
                  }));
                }}
              >
                Add feature
              </Button>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => {
                  const { active, over } = e;
                  if (!over || active.id === over.id) return;
                  updateSection(selectedSection.id, (s) => {
                    const list = (s.blocks || []).filter((b) => b.type === "feature");
                    const oldIndex = list.findIndex((b) => b.id === active.id);
                    const newIndex = list.findIndex((b) => b.id === over.id);
                    const next = arrayMove(list, oldIndex, newIndex);
                    const rest = (s.blocks || []).filter((b) => b.type !== "feature");
                    return { ...s, blocks: [...next, ...rest] };
                  });
                }}
              >
                <SortableContext
                  items={(selectedSection.blocks || []).filter((b) => b.type === "feature").map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2">
                    {(selectedSection.blocks || []).filter((b) => b.type === "feature").map((b) => (
                      <BlockRow
                        key={b.id}
                        id={b.id}
                        title={String(b.content?.title || b.id)}
                        selected={selectedBlockId === b.id}
                        onSelect={() => setSelectedBlockId(b.id)}
                        onDuplicate={() => duplicateBlock(selectedSection.id, b.id)}
                        onRemove={() =>
                          updateSection(selectedSection.id, (s) => ({
                            ...s,
                            blocks: (s.blocks || []).filter((x) => x.id !== b.id),
                          }))
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {(() => {
                const list = (selectedSection.blocks || []).filter((b) => b.type === "feature");
                const active = list.find((b) => b.id === selectedBlockId) || list[0];
                if (!active) return null;
                return (
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                    <Input
                      label="Title"
                      value={String(active.content?.title || "")}
                      onChange={(e) =>
                        updateSection(selectedSection.id, (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === active.id ? { ...x, content: { ...x.content, title: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Textarea
                      label="Description"
                      value={String(active.content?.description || "")}
                      onChange={(e) =>
                        updateSection(selectedSection.id, (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === active.id ? { ...x, content: { ...x.content, description: e.target.value } } : x,
                          ),
                        }))
                      }
                      rows={3}
                    />
                    <IconPicker
                      supabase={supabase}
                      label="Icon"
                      value={(active.content?.icon as IconRef | undefined) || { type: "library", value: "website" }}
                      onChange={(next) =>
                        updateSection(selectedSection.id, (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === active.id ? { ...x, content: { ...x.content, icon: next } } : x,
                          ),
                        }))
                      }
                    />
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Image (optional)</div>
                      {typeof (active.content as any)?.image?.url === "string" &&
                      String((active.content as any).image.url).trim().length ? (
                        <div className="flex items-center gap-3">
                          <Image
                            src={String((active.content as any).image.url)}
                            alt=""
                            className="h-12 w-12 rounded-lg border border-slate-200 object-cover dark:border-white/10"
                            width={48}
                            height={48}
                            unoptimized
                          />
                          <Button
                            variant="secondary"
                            className="h-10"
                            onClick={() =>
                              updateSection(selectedSection.id, (s) => ({
                                ...s,
                                blocks: (s.blocks || []).map((x) =>
                                  x.id === active.id
                                    ? { ...x, content: { ...x.content, image: undefined } }
                                    : x,
                                ),
                              }))
                            }
                          >
                            Clear image
                          </Button>
                          <Button
                            variant="secondary"
                            className="h-10"
                            onClick={() =>
                              openMediaPicker({
                                title: "Pick feature image",
                                accept: "image/*",
                                onPick: (asset) =>
                                  updateSection(selectedSection.id, (s) => ({
                                    ...s,
                                    blocks: (s.blocks || []).map((x) =>
                                      x.id === active.id
                                        ? { ...x, content: { ...x.content, image: { url: asset.url, path: asset.path } } }
                                        : x,
                                    ),
                                  })),
                              })
                            }
                          >
                            Replace
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          className="h-10"
                          onClick={() =>
                            openMediaPicker({
                              title: "Pick feature image",
                              accept: "image/*",
                              onPick: (asset) =>
                                updateSection(selectedSection.id, (s) => ({
                                  ...s,
                                  blocks: (s.blocks || []).map((x) =>
                                    x.id === active.id
                                      ? { ...x, content: { ...x.content, image: { url: asset.url, path: asset.path } } }
                                      : x,
                                  ),
                                })),
                            })
                          }
                        >
                          Choose image
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : selectedSection?.type === "testimonials" ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Heading"
                value={String((selectedSection.settings as any)?.heading || "")}
                onChange={(e) => updateSection(selectedSection.id, (s) => ({ ...s, settings: { ...(s.settings || {}), heading: e.target.value } }))}
              />
              <Textarea
                label="Subcopy"
                value={String((selectedSection.settings as any)?.subcopy || "")}
                onChange={(e) => updateSection(selectedSection.id, (s) => ({ ...s, settings: { ...(s.settings || {}), subcopy: e.target.value } }))}
                rows={2}
              />
              <Button
                variant="secondary"
                className="h-10"
                onClick={() =>
                  updateSection(selectedSection.id, (s) => ({
                    ...s,
                    blocks: [
                      ...(s.blocks || []),
                      {
                        id: `proof_${Date.now()}`,
                        type: "proof_card",
                        content: { name: "Pipeline signal", role: "System proof point", body: "" },
                      },
                    ],
                  }))
                }
              >
                Add proof card
              </Button>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => {
                  const { active, over } = e;
                  if (!over || active.id === over.id) return;
                  updateSection(selectedSection.id, (s) => {
                    const list = (s.blocks || []).filter(isProofBlock);
                    const oldIndex = list.findIndex((b) => b.id === active.id);
                    const newIndex = list.findIndex((b) => b.id === over.id);
                    const next = arrayMove(list, oldIndex, newIndex);
                    const rest = (s.blocks || []).filter((b) => !isProofBlock(b));
                    return { ...s, blocks: [...next, ...rest] };
                  });
                }}
              >
                <SortableContext
                  items={(selectedSection.blocks || []).filter(isProofBlock).map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2">
                    {(selectedSection.blocks || []).filter(isProofBlock).map((b) => (
                      <BlockRow
                        key={b.id}
                        id={b.id}
                        title={String(b.content?.name || b.id)}
                        selected={selectedBlockId === b.id}
                        onSelect={() => setSelectedBlockId(b.id)}
                        onDuplicate={() => duplicateBlock(selectedSection.id, b.id)}
                        onRemove={() =>
                          updateSection(selectedSection.id, (s) => ({
                            ...s,
                            blocks: (s.blocks || []).filter((x) => x.id !== b.id),
                          }))
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {(() => {
                const list = (selectedSection.blocks || []).filter(isProofBlock);
                const active = list.find((b) => b.id === selectedBlockId) || list[0];
                if (!active) return null;
                return (
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                    <Input
                      label={active.type === "proof_card" ? "Signal title" : "Name"}
                      value={String(active.content?.name || "")}
                      onChange={(e) =>
                        updateSection(selectedSection.id, (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === active.id ? { ...x, content: { ...x.content, name: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Input
                      label={active.type === "proof_card" ? "Signal label" : "Role"}
                      value={String(active.content?.role || "")}
                      onChange={(e) =>
                        updateSection(selectedSection.id, (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === active.id ? { ...x, content: { ...x.content, role: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    {active.type === "testimonial" ? (
                      <Select
                        label="Rating"
                        value={String(active.content?.rating ?? 5)}
                        onChange={(e) =>
                          updateSection(selectedSection.id, (s) => ({
                            ...s,
                            blocks: (s.blocks || []).map((x) =>
                              x.id === active.id ? { ...x, content: { ...x.content, rating: Number(e.target.value) } } : x,
                            ),
                          }))
                        }
                        options={[
                          { value: "5", label: "5" },
                          { value: "4", label: "4" },
                          { value: "3", label: "3" },
                          { value: "2", label: "2" },
                          { value: "1", label: "1" },
                        ]}
                      />
                    ) : null}
                    <Textarea
                      label={active.type === "proof_card" ? "Proof detail" : "Quote"}
                      value={String(active.content?.quote || active.content?.body || "")}
                      onChange={(e) =>
                        updateSection(selectedSection.id, (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === active.id
                              ? {
                                  ...x,
                                  content:
                                    active.type === "proof_card"
                                      ? { ...x.content, body: e.target.value }
                                      : { ...x.content, quote: e.target.value },
                                }
                              : x,
                          ),
                        }))
                      }
                      rows={4}
                    />
                    {active.type === "testimonial" ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Verified testimonial avatar</div>
                      {typeof (active.content as any)?.avatar?.url === "string" &&
                      String((active.content as any).avatar.url).trim().length ? (
                        <div className="flex items-center gap-3">
                          <Image
                            src={String((active.content as any).avatar.url)}
                            alt=""
                            className="h-12 w-12 rounded-full border border-slate-200 object-cover dark:border-white/10"
                            width={48}
                            height={48}
                            unoptimized
                          />
                          <Button
                            variant="secondary"
                            className="h-10"
                            onClick={() =>
                              updateSection(selectedSection.id, (s) => ({
                                ...s,
                                blocks: (s.blocks || []).map((x) =>
                                  x.id === active.id ? { ...x, content: { ...x.content, avatar: undefined } } : x,
                                ),
                              }))
                            }
                          >
                            Clear
                          </Button>
                          <Button
                            variant="secondary"
                            className="h-10"
                            onClick={() =>
                              openMediaPicker({
                                title: "Pick testimonial avatar",
                                accept: "image/*",
                                onPick: (asset) =>
                                  updateSection(selectedSection.id, (s) => ({
                                    ...s,
                                    blocks: (s.blocks || []).map((x) =>
                                      x.id === active.id
                                        ? { ...x, content: { ...x.content, avatar: { url: asset.url, path: asset.path } } }
                                        : x,
                                    ),
                                  })),
                              })
                            }
                          >
                            Replace
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          className="h-10"
                          onClick={() =>
                            openMediaPicker({
                              title: "Pick testimonial avatar",
                              accept: "image/*",
                              onPick: (asset) =>
                                updateSection(selectedSection.id, (s) => ({
                                  ...s,
                                  blocks: (s.blocks || []).map((x) =>
                                    x.id === active.id
                                      ? { ...x, content: { ...x.content, avatar: { url: asset.url, path: asset.path } } }
                                      : x,
                                  ),
                                })),
                            })
                          }
                        >
                          Choose avatar
                        </Button>
                      )}
                    </div>
                    ) : null}
                  </div>
                );
              })()}
            </div>
          ) : selectedSection?.type === "custom_html" ? (
            <div className="flex flex-col gap-4">
              <Textarea
                label="Custom HTML"
                value={String((selectedSection.settings as any)?.html || "")}
                onChange={(e) => updateSection(selectedSection.id, (s) => ({ ...s, settings: { ...(s.settings || {}), html: e.target.value } }))}
                rows={8}
              />
              <Textarea
                label="Custom CSS"
                value={String((selectedSection.settings as any)?.css || "")}
                onChange={(e) => updateSection(selectedSection.id, (s) => ({ ...s, settings: { ...(s.settings || {}), css: e.target.value } }))}
                rows={6}
              />
              <Textarea
                label="Custom JS"
                value={String((selectedSection.settings as any)?.js || "")}
                onChange={(e) => updateSection(selectedSection.id, (s) => ({ ...s, settings: { ...(s.settings || {}), js: e.target.value } }))}
                rows={6}
              />
            </div>
          ) : selectedSection?.type === "audit_bridge" ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Heading"
                value={String((selectedSection.settings as any)?.heading || "")}
                onChange={(e) =>
                  updateSection(selectedSection.id, (s) => ({
                    ...s,
                    settings: { ...(s.settings || {}), heading: e.target.value },
                  }))
                }
              />
              <Textarea
                label="Subcopy"
                value={String((selectedSection.settings as any)?.subcopy || "")}
                onChange={(e) =>
                  updateSection(selectedSection.id, (s) => ({
                    ...s,
                    settings: { ...(s.settings || {}), subcopy: e.target.value },
                  }))
                }
                rows={4}
              />
              <Input
                label="CTA text"
                value={String((selectedSection.settings as any)?.ctaText || "")}
                onChange={(e) =>
                  updateSection(selectedSection.id, (s) => ({
                    ...s,
                    settings: { ...(s.settings || {}), ctaText: e.target.value },
                  }))
                }
              />
              <Input
                label="CTA href"
                value={String((selectedSection.settings as any)?.ctaHref || "#lead-form")}
                onChange={(e) =>
                  updateSection(selectedSection.id, (s) => ({
                    ...s,
                    settings: { ...(s.settings || {}), ctaHref: e.target.value },
                  }))
                }
              />
            </div>
          ) : selectedSection?.type === "trust_strip" ? (
            <div className="flex flex-col gap-3">
              <InspectorGroup title="Trust Strip">
                <Textarea
                  label={labelRow("Items (one per line)")}
                  value={Array.isArray((content.rebuilt as any)?.trustStrip?.items)
                    ? String(((content.rebuilt as any).trustStrip.items as any[]).map((x) => String(x || "")).join("\n"))
                    : ""}
                  onChange={(e) => {
                    const items = e.target.value
                      .split("\n")
                      .map((x) => x.trim())
                      .filter(Boolean);
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), trustStrip: { ...((content.rebuilt as any)?.trustStrip || {}), items } } as any });
                  }}
                  rows={6}
                />
              </InspectorGroup>
            </div>
          ) : selectedSection?.type === "founder" ? (
            <div className="flex flex-col gap-3">
              <InspectorGroup title="Founder">
                <Input
                  label={labelRow("Label")}
                  value={String((content.rebuilt as any)?.founder?.label || "")}
                  onChange={(e) =>
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), founder: { ...((content.rebuilt as any)?.founder || {}), label: e.target.value } } as any })
                  }
                />
                <Input
                  label={labelRow("Avatar text")}
                  value={String((content.rebuilt as any)?.founder?.avatarText || "")}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      rebuilt: { ...(content.rebuilt || {}), founder: { ...((content.rebuilt as any)?.founder || {}), avatarText: e.target.value } } as any,
                    })
                  }
                />
                <Input
                  label={labelRow("Name")}
                  value={String((content.rebuilt as any)?.founder?.name || "")}
                  onChange={(e) =>
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), founder: { ...((content.rebuilt as any)?.founder || {}), name: e.target.value } } as any })
                  }
                />
                <Input
                  label={labelRow("Title")}
                  value={String((content.rebuilt as any)?.founder?.title || "")}
                  onChange={(e) =>
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), founder: { ...((content.rebuilt as any)?.founder || {}), title: e.target.value } } as any })
                  }
                />
                <Textarea
                  label={labelRow("Quote")}
                  value={String((content.rebuilt as any)?.founder?.quote || "")}
                  onChange={(e) =>
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), founder: { ...((content.rebuilt as any)?.founder || {}), quote: e.target.value } } as any })
                  }
                  rows={2}
                />
                <Textarea
                  label={labelRow("Paragraphs (one per line)", "Supports <strong>, <em>, <br>")}
                  value={Array.isArray((content.rebuilt as any)?.founder?.paragraphs)
                    ? ((content.rebuilt as any).founder.paragraphs as any[]).map((x) => String(x || "")).join("\n")
                    : ""}
                  onChange={(e) => {
                    const paragraphs = e.target.value
                      .split("\n")
                      .map((x) => x.trim())
                      .filter(Boolean);
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), founder: { ...((content.rebuilt as any)?.founder || {}), paragraphs } } as any });
                  }}
                  rows={6}
                />
              </InspectorGroup>
            </div>
          ) : selectedSection?.type === "promise" ? (
            <div className="flex flex-col gap-3">
              <InspectorGroup title="Promise">
                <Input
                  label={labelRow("Tag")}
                  value={String((content.rebuilt as any)?.promise?.tag || "")}
                  onChange={(e) =>
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), promise: { ...((content.rebuilt as any)?.promise || {}), tag: e.target.value } } as any })
                  }
                />
                <Input
                  label={labelRow("Heading")}
                  value={String((content.rebuilt as any)?.promise?.heading || "")}
                  onChange={(e) =>
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), promise: { ...((content.rebuilt as any)?.promise || {}), heading: e.target.value } } as any })
                  }
                />
                <Textarea
                  label={labelRow("Subcopy")}
                  value={String((content.rebuilt as any)?.promise?.subcopy || "")}
                  onChange={(e) =>
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), promise: { ...((content.rebuilt as any)?.promise || {}), subcopy: e.target.value } } as any })
                  }
                  rows={3}
                />
                <Textarea
                  label={labelRow("Cards", "title | body")}
                  value={Array.isArray((content.rebuilt as any)?.promise?.cards)
                    ? ((content.rebuilt as any).promise.cards as any[])
                        .map((x) => `${String(x?.title || "")} | ${String(x?.body || "")}`.trim())
                        .join("\n")
                    : ""}
                  onChange={(e) => {
                    const cards = e.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => {
                        const idx = line.indexOf("|");
                        if (idx < 0) return { title: line.trim(), body: "" };
                        return { title: line.slice(0, idx).trim(), body: line.slice(idx + 1).trim() };
                      });
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), promise: { ...((content.rebuilt as any)?.promise || {}), cards } } as any });
                  }}
                  rows={6}
                />
              </InspectorGroup>
            </div>
          ) : selectedSection?.type === "how" ? (
            <div className="flex flex-col gap-3">
              <InspectorGroup title="How It Works">
                <Input
                  label={labelRow("Tag")}
                  value={String((content.rebuilt as any)?.how?.tag || "")}
                  onChange={(e) => setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), how: { ...((content.rebuilt as any)?.how || {}), tag: e.target.value } } as any })}
                />
                <Input
                  label={labelRow("Heading")}
                  value={String((content.rebuilt as any)?.how?.heading || "")}
                  onChange={(e) =>
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), how: { ...((content.rebuilt as any)?.how || {}), heading: e.target.value } } as any })
                  }
                />
                <Textarea
                  label={labelRow("Subcopy")}
                  value={String((content.rebuilt as any)?.how?.subcopy || "")}
                  onChange={(e) =>
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), how: { ...((content.rebuilt as any)?.how || {}), subcopy: e.target.value } } as any })
                  }
                  rows={3}
                />
                <Textarea
                  label={labelRow("Steps", "title | body")}
                  value={Array.isArray((content.rebuilt as any)?.how?.steps)
                    ? ((content.rebuilt as any).how.steps as any[])
                        .map((x) => `${String(x?.title || "")} | ${String(x?.body || "")}`.trim())
                        .join("\n")
                    : ""}
                  onChange={(e) => {
                    const steps = e.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => {
                        const idx = line.indexOf("|");
                        if (idx < 0) return { title: line.trim(), body: "" };
                        return { title: line.slice(0, idx).trim(), body: line.slice(idx + 1).trim() };
                      });
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), how: { ...((content.rebuilt as any)?.how || {}), steps } } as any });
                  }}
                  rows={8}
                />
              </InspectorGroup>
            </div>
          ) : selectedSection?.type === "honest" ? (
            <div className="flex flex-col gap-3">
              <InspectorGroup title="Honest">
                <Input
                  label={labelRow("Tag")}
                  value={String((content.rebuilt as any)?.honest?.tag || "")}
                  onChange={(e) =>
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), honest: { ...((content.rebuilt as any)?.honest || {}), tag: e.target.value } } as any })
                  }
                />
                <Textarea
                  label={labelRow("Quote")}
                  value={String((content.rebuilt as any)?.honest?.quote || "")}
                  onChange={(e) =>
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), honest: { ...((content.rebuilt as any)?.honest || {}), quote: e.target.value } } as any })
                  }
                  rows={2}
                />
                <Textarea
                  label={labelRow("Paragraphs (one per line)")}
                  value={Array.isArray((content.rebuilt as any)?.honest?.paragraphs)
                    ? ((content.rebuilt as any).honest.paragraphs as any[]).map((x) => String(x || "")).join("\n")
                    : ""}
                  onChange={(e) => {
                    const paragraphs = e.target.value
                      .split("\n")
                      .map((x) => x.trim())
                      .filter(Boolean);
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), honest: { ...((content.rebuilt as any)?.honest || {}), paragraphs } } as any });
                  }}
                  rows={6}
                />
                <Input
                  label={labelRow("Pledge title")}
                  value={String((content.rebuilt as any)?.honest?.pledgeTitle || "")}
                  onChange={(e) =>
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), honest: { ...((content.rebuilt as any)?.honest || {}), pledgeTitle: e.target.value } } as any })
                  }
                />
                <Textarea
                  label={labelRow("Pledge items (one per line)")}
                  value={Array.isArray((content.rebuilt as any)?.honest?.pledgeItems)
                    ? ((content.rebuilt as any).honest.pledgeItems as any[]).map((x) => String(x || "")).join("\n")
                    : ""}
                  onChange={(e) => {
                    const pledgeItems = e.target.value
                      .split("\n")
                      .map((x) => x.trim())
                      .filter(Boolean);
                    setContent({ ...content, rebuilt: { ...(content.rebuilt || {}), honest: { ...((content.rebuilt as any)?.honest || {}), pledgeItems } } as any });
                  }}
                  rows={4}
                />
              </InspectorGroup>
            </div>
          ) : selectedId === "application" ? (
            <div className="flex flex-col gap-3">
              <InspectorGroup title="Content">
                <Input
                  label={labelRow("Section tag", `${String((content.application as any).headingTag || "").length} chars`)}
                  value={String((content.application as any).headingTag || "")}
                  onChange={(e) => setContent({ ...content, application: { ...content.application, headingTag: e.target.value } as any })}
                />
                <Input
                  label={labelRow("Form heading", `${content.application.heading.length} chars`)}
                  value={content.application.heading}
                  onChange={(e) => setContent({ ...content, application: { ...content.application, heading: e.target.value } })}
                />
                <Textarea
                  label={labelRow("Form subcopy", `${content.application.subcopy.length} chars`)}
                  value={content.application.subcopy}
                  onChange={(e) => setContent({ ...content, application: { ...content.application, subcopy: e.target.value } })}
                  rows={3}
                />
                <Input
                  label={labelRow("Form title", `${String((content.application as any).formTitle || "").length} chars`)}
                  value={String((content.application as any).formTitle || "")}
                  onChange={(e) => setContent({ ...content, application: { ...content.application, formTitle: e.target.value } as any })}
                />
                <Textarea
                  label={labelRow("Form subtitle", `${String((content.application as any).formSubtitle || "").length} chars`)}
                  value={String((content.application as any).formSubtitle || "")}
                  onChange={(e) => setContent({ ...content, application: { ...content.application, formSubtitle: e.target.value } as any })}
                  rows={2}
                />
              </InspectorGroup>

              <InspectorGroup title="Left Promise Items">
                <Textarea
                  label={labelRow("Items (one per line)", "title | body")}
                  value={Array.isArray((content.application as any).promiseItems)
                    ? ((content.application as any).promiseItems as any[])
                        .map((x) => `${String(x?.title || "")} | ${String(x?.body || "")}`.trim())
                        .join("\n")
                    : ""}
                  onChange={(e) => {
                    const next = e.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => {
                        const idx = line.indexOf("|");
                        if (idx < 0) return { title: line.trim(), body: "" };
                        return { title: line.slice(0, idx).trim(), body: line.slice(idx + 1).trim() };
                      });
                    setContent({ ...content, application: { ...content.application, promiseItems: next } as any });
                  }}
                  rows={4}
                />
              </InspectorGroup>

              <InspectorGroup title="Form Fields">
                <Input
                  label={labelRow("First name label")}
                  value={content.application.fields.firstNameLabel}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      application: { ...content.application, fields: { ...content.application.fields, firstNameLabel: e.target.value } },
                    })
                  }
                />
                <Input
                  label={labelRow("First name placeholder")}
                  value={content.application.fields.firstNamePlaceholder || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      application: { ...content.application, fields: { ...content.application.fields, firstNamePlaceholder: e.target.value } },
                    })
                  }
                />
                <Input
                  label={labelRow("Last name label")}
                  value={content.application.fields.lastNameLabel}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      application: { ...content.application, fields: { ...content.application.fields, lastNameLabel: e.target.value } },
                    })
                  }
                />
                <Input
                  label={labelRow("Last name placeholder")}
                  value={content.application.fields.lastNamePlaceholder || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      application: { ...content.application, fields: { ...content.application.fields, lastNamePlaceholder: e.target.value } },
                    })
                  }
                />
                <Input
                  label={labelRow("Email label")}
                  value={content.application.fields.emailLabel}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      application: { ...content.application, fields: { ...content.application.fields, emailLabel: e.target.value } },
                    })
                  }
                />
                <Input
                  label={labelRow("Email placeholder")}
                  value={content.application.fields.emailPlaceholder || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      application: { ...content.application, fields: { ...content.application.fields, emailPlaceholder: e.target.value } },
                    })
                  }
                />
                <Input
                  label={labelRow("Revenue label")}
                  value={content.application.fields.revenueLabel}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      application: { ...content.application, fields: { ...content.application.fields, revenueLabel: e.target.value } },
                    })
                  }
                />
                <Input
                  label={labelRow("Revenue placeholder")}
                  value={content.application.fields.revenuePlaceholder || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      application: { ...content.application, fields: { ...content.application.fields, revenuePlaceholder: e.target.value } },
                    })
                  }
                />
                <Textarea
                  label={labelRow("Revenue options (one per line)")}
                  value={Array.isArray(content.application.fields.revenueOptions)
                    ? content.application.fields.revenueOptions.map((o) => String(o.label || "")).join("\n")
                    : ""}
                  onChange={(e) => {
                    const lines = e.target.value
                      .split("\n")
                      .map((x) => x.trim())
                      .filter(Boolean);
                    const revenueOptions = lines.map((label) => ({ value: label, label }));
                    setContent({
                      ...content,
                      application: { ...content.application, fields: { ...content.application.fields, revenueOptions } },
                    });
                  }}
                  rows={4}
                />
                <Input
                  label={labelRow("Bottleneck label")}
                  value={content.application.fields.bottleneckLabel}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      application: { ...content.application, fields: { ...content.application.fields, bottleneckLabel: e.target.value } },
                    })
                  }
                />
                <Textarea
                  label={labelRow("Bottleneck placeholder")}
                  value={content.application.fields.bottleneckPlaceholder}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      application: {
                        ...content.application,
                        fields: { ...content.application.fields, bottleneckPlaceholder: e.target.value },
                      },
                    })
                  }
                  rows={2}
                />
              </InspectorGroup>

              <InspectorGroup title="Submit + Success">
                <Input
                  label={labelRow("Submit text")}
                  value={content.application.submitText}
                  onChange={(e) => setContent({ ...content, application: { ...content.application, submitText: e.target.value } })}
                />
                <Textarea
                  label={labelRow("Disclaimer / footnote")}
                  value={content.application.footnote || ""}
                  onChange={(e) => setContent({ ...content, application: { ...content.application, footnote: e.target.value } })}
                  rows={2}
                />
                <Input
                  label={labelRow("Success title")}
                  value={content.application.successTitle}
                  onChange={(e) => setContent({ ...content, application: { ...content.application, successTitle: e.target.value } })}
                />
                <Textarea
                  label={labelRow("Success body")}
                  value={content.application.successBody}
                  onChange={(e) => setContent({ ...content, application: { ...content.application, successBody: e.target.value } })}
                  rows={3}
                />
              </InspectorGroup>
            </div>
          ) : selectedId === "__whatsapp" ? (
            <div className="flex flex-col gap-4">
              <Select
                label="Enabled"
                value={content.whatsapp?.enabled ? "yes" : "no"}
                onChange={(e) => {
                  const enabled = e.target.value === "yes";
                  setContent({
                    ...content,
                    whatsapp: {
                      ...(content.whatsapp || homepageDefaults.whatsapp!),
                      enabled,
                    },
                  });
                }}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
              <Input
                label="Phone"
                value={content.whatsapp?.phone || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), phone: e.target.value },
                  })
                }
              />
              <Textarea
                label="Message"
                value={content.whatsapp?.message || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), message: e.target.value },
                  })
                }
                rows={3}
              />
              <Input
                label="Tooltip"
                value={content.whatsapp?.tooltip || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), tooltip: e.target.value },
                  })
                }
              />
              <Input
                label="Modal title"
                value={content.whatsapp?.modalTitle || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), modalTitle: e.target.value },
                  })
                }
              />
              <Input
                label="Modal subtitle"
                value={content.whatsapp?.modalSubtitle || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), modalSubtitle: e.target.value },
                  })
                }
              />
              <Input
                label="Button text"
                value={content.whatsapp?.buttonText || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), buttonText: e.target.value },
                  })
                }
              />
              <Input
                label="Header color"
                value={content.whatsapp?.headerColorHex || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), headerColorHex: e.target.value },
                  })
                }
              />
              <Select
                label="Position"
                value={content.whatsapp?.position === "left" ? "left" : "right"}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), position: e.target.value as any },
                  })
                }
                options={[
                  { value: "right", label: "Right" },
                  { value: "left", label: "Left" },
                ]}
              />
              <Input
                label="Delay (ms)"
                type="number"
                value={String(content.whatsapp?.delayMs ?? "")}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: {
                      ...(content.whatsapp || homepageDefaults.whatsapp!),
                      delayMs: e.target.value.trim().length ? Number(e.target.value) : undefined,
                    },
                  })
                }
                placeholder="15000"
              />
              <Select
                label="Auto open"
                value={content.whatsapp?.autoOpen ? "yes" : "no"}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), autoOpen: e.target.value === "yes" },
                  })
                }
                options={[
                  { value: "no", label: "No" },
                  { value: "yes", label: "Yes" },
                ]}
              />
              <Input
                label="Avatar URL"
                value={content.whatsapp?.avatar?.url || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: {
                      ...(content.whatsapp || homepageDefaults.whatsapp!),
                      avatar: e.target.value.trim().length
                        ? { url: e.target.value, path: content.whatsapp?.avatar?.path }
                        : undefined,
                    },
                  })
                }
              />
            </div>
          ) : sectionItems.find((s) => s.id === selectedId)?.type === "custom" ? (
            <div className="flex flex-col gap-4">
              <Textarea
                label="Custom HTML"
                value={(content.customSections || []).find((c) => c.id === selectedId)?.html || ""}
                onChange={(e) => {
                  const nextCustom = (content.customSections || []).map((c) =>
                    c.id === selectedId ? { ...c, html: e.target.value } : c,
                  );
                  setContent({ ...content, customSections: nextCustom });
                }}
                rows={8}
              />
              <Textarea
                label="Custom CSS"
                value={(content.customSections || []).find((c) => c.id === selectedId)?.css || ""}
                onChange={(e) => {
                  const nextCustom = (content.customSections || []).map((c) =>
                    c.id === selectedId ? { ...c, css: e.target.value } : c,
                  );
                  setContent({ ...content, customSections: nextCustom });
                }}
                rows={6}
              />
              <Textarea
                label="Custom JS"
                value={(content.customSections || []).find((c) => c.id === selectedId)?.js || ""}
                onChange={(e) => {
                  const nextCustom = (content.customSections || []).map((c) =>
                    c.id === selectedId ? { ...c, js: e.target.value } : c,
                  );
                  setContent({ ...content, customSections: nextCustom });
                }}
                rows={6}
              />
            </div>
          ) : (
            <div className="text-sm text-slate-600 dark:text-slate-400">Select a section to edit.</div>
          )}

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
            <div className="font-semibold text-white/80">JSON mode fallback</div>
            <div className="mt-1">Use the JSON tab for full editing if needed.</div>
          </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[var(--cf-secondary)] p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 py-2">
              <div className="text-sm font-bold text-white">Menu</div>
              <button
                type="button"
                className="admin-mobile-menu-close inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/90"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            <div className="mt-2 flex flex-col gap-1">
              {navItems.map((i) => (
                <button
                  key={i.tab}
                  type="button"
                  className={
                    i.tab === "builder"
                      ? "admin-mobile-menu-item flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 text-sm font-bold text-white"
                      : "admin-mobile-menu-item flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/80 hover:bg-white/5"
                  }
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab(i.tab);
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="inline-flex w-6 justify-center">•</span>
                  {i.label}
                </button>
              ))}

              <div className="mt-2 border-t border-white/10 pt-2">
                <Button
                  variant="secondary"
                  className="h-11 w-full"
                  onClick={async () => {
                    if (onSignOut) await onSignOut();
                    else await supabase.auth.signOut();
                    setMobileMenuOpen(false);
                    router.refresh();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {mobileActionsOpen ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 lg:hidden" onClick={() => setMobileActionsOpen(false)}>
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[var(--cf-secondary)] p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 py-2">
              <div className="text-sm font-bold text-white">Actions</div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/90"
                onClick={() => setMobileActionsOpen(false)}
                aria-label="Close actions"
              >
                ×
              </button>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-2">
              <Button variant="secondary" className="h-11" disabled={historySize === 0} onClick={undo}>
                <Undo2 className="mr-2 h-4 w-4" />
                Undo
              </Button>
              <Button variant="secondary" className="h-11" disabled={futureSize === 0} onClick={redo}>
                <Redo2 className="mr-2 h-4 w-4" />
                Redo
              </Button>
              <Button variant="secondary" className="h-11" onClick={loadLandingPreset}>
                Load landing preset
              </Button>
              <Button
                variant="secondary"
                className="h-11"
                disabled={saving}
                onClick={async () => {
                  const ok = await saveDraft(content);
                  if (!ok) return;
                  await createBackupSnapshot(content);
                  setNotice("Draft saved (backup created)");
                }}
              >
                Save Draft
              </Button>
              <Button
                variant="secondary"
                className="h-11"
                onClick={async () => {
                  await supabase.from("homepage_content_drafts").upsert({ id: 1, content: {} }, { onConflict: "id" });
                  setDraft(null);
                  resetHistory();
                  setNotice("Reverted to published");
                }}
              >
                Revert
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:hidden">
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[var(--cf-secondary)]/90 backdrop-blur">
          <div className="grid grid-cols-3">
            <button
              type="button"
              onClick={() => setMobilePane("sections")}
              className={
                mobilePane === "sections"
                  ? "flex flex-col items-center gap-1 border-b-2 border-[var(--cf-accent)] py-2 text-[var(--cf-accent)]"
                  : "flex flex-col items-center gap-1 border-b-2 border-transparent py-2 text-white/70"
              }
            >
              <Layers className="h-4 w-4" />
              <span className="text-[11px] font-semibold">Sections</span>
            </button>
            <button
              type="button"
              onClick={() => setMobilePane("preview")}
              className={
                mobilePane === "preview"
                  ? "flex flex-col items-center gap-1 border-b-2 border-[var(--cf-accent)] py-2 text-[var(--cf-accent)]"
                  : "flex flex-col items-center gap-1 border-b-2 border-transparent py-2 text-white/70"
              }
            >
              <Eye className="h-4 w-4" />
              <span className="text-[11px] font-semibold">Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setMobilePane("inspector")}
              className={
                mobilePane === "inspector"
                  ? "flex flex-col items-center gap-1 border-b-2 border-[var(--cf-accent)] py-2 text-[var(--cf-accent)]"
                  : "flex flex-col items-center gap-1 border-b-2 border-transparent py-2 text-white/70"
              }
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-[11px] font-semibold">Inspector</span>
            </button>
          </div>
        </div>
      </div>

      <MediaPickerModal
        supabase={supabase}
        open={mediaOpen}
        title={mediaTitle}
        accept={mediaAccept}
        onClose={() => setMediaOpen(false)}
        onPick={(asset) => {
          mediaPickRef.current?.(asset);
        }}
      />
    </div>
  );
}
