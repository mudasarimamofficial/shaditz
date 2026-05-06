import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { nowId, normalizeSlug, toSections, withSections, type PageSection, type SitePage } from "@/components/admin/pages/types";
import { requestAdminRevalidate } from "@/utils/adminRevalidate";

export function usePagesManager(supabase: SupabaseClient) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [navLabel, setNavLabel] = useState("");
  const [showHeader, setShowHeader] = useState(false);
  const [showFooter, setShowFooter] = useState(true);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [sections, setSections] = useState<PageSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const selected = useMemo(() => pages.find((p) => p.id === selectedId) || null, [pages, selectedId]);
  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selectedSectionId) || null,
    [sections, selectedSectionId],
  );

  function nextUniqueSlug(preferred: string, excludeId?: string | null) {
    const base = normalizeSlug(preferred);
    const taken = new Set(
      pages
        .filter((p) => (excludeId ? p.id !== excludeId : true))
        .map((p) => String(p.slug || "").trim().toLowerCase())
        .filter((s) => s.length),
    );
    if (!base.length) return "";
    if (!taken.has(base)) return base;
    for (let i = 2; i <= 50; i += 1) {
      const candidate = `${base}-${i}`;
      if (!taken.has(candidate)) return candidate;
    }
    return `${base}-${Date.now()}`;
  }

  const loadPages = useCallback(async () => {
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("site_pages")
        .select(
          "id, slug, title, nav_label, show_in_header_nav, show_in_footer_nav, status, meta_title, meta_description, draft_content, published_content, updated_at",
        )
        .order("updated_at", { ascending: false });
      if (err) {
        setError(err.message);
        return;
      }
      const rows = (data || []) as SitePage[];
      setPages(rows);
      setSelectedId((current) => current || rows[0]?.id || null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  async function createNewWithValues(params: { title: string; slug?: string; navLabel?: string }) {
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const t = params.title.trim();
      const baseSlug = normalizeSlug((params.slug || "").length ? (params.slug as string) : t || "new-page");
      const s = nextUniqueSlug(baseSlug, null);
      if (!t.length) {
        setError("Title is required");
        return;
      }
      if (!s.length) {
        setError("Slug is required");
        return;
      }

      const initial: PageSection[] = [
        { id: nowId("rich"), type: "rich_text", enabled: true, settings: { title: t, content: "<p>Update this content.</p>" } },
      ];

      const insertRow = async (slugValue: string) =>
        supabase
          .from("site_pages")
          .insert({
            title: t,
            slug: slugValue,
            nav_label: (params.navLabel || navLabel).trim().length ? (params.navLabel || navLabel).trim() : null,
            show_in_header_nav: showHeader,
            show_in_footer_nav: showFooter,
            status: "draft",
            meta_title: metaTitle.trim().length ? metaTitle.trim() : null,
            meta_description: metaDescription.trim().length ? metaDescription.trim() : null,
            draft_content: withSections(initial),
            published_content: withSections(initial),
          })
          .select("id")
          .maybeSingle();

      const { data: inserted, error: err } = await insertRow(s);
      if (err) {
        const msg = err.message || "";
        if (msg.includes("site_pages_slug_key")) {
          const retrySlug = nextUniqueSlug(`${s}-2`, null);
          const { data: retryInserted, error: retryErr } = await insertRow(retrySlug);
          if (retryErr) {
            setError(retryErr.message);
            return;
          }
          setSaved("Page created");
          await loadPages();
          if (retryInserted?.id) setSelectedId(retryInserted.id);
          setTitle(t);
          setSlug(retrySlug);
          return;
        }
        setError(err.message);
        return;
      }

      setSaved("Page created");
      await loadPages();
      if (inserted?.id) setSelectedId(inserted.id);
      setTitle(t);
      setSlug(s);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  useEffect(() => {
    if (!selected) return;
    setTitle(selected.title || "");
    setSlug(selected.slug || "");
    setNavLabel(selected.nav_label || "");
    setShowHeader(Boolean(selected.show_in_header_nav));
    setShowFooter(Boolean(selected.show_in_footer_nav));
    setMetaTitle(selected.meta_title || "");
    setMetaDescription(selected.meta_description || "");
    setStatus(selected.status || "draft");
    const nextSections = toSections(selected.draft_content);
    setSections(nextSections);
    setSelectedSectionId(nextSections[0]?.id || null);
  }, [selected]);

  async function saveDraft() {
    if (!selected) return;
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const t = title.trim();
      const s = normalizeSlug(slug);
      if (!t.length) {
        setError("Title is required");
        return;
      }
      if (!s.length) {
        setError("Slug is required");
        return;
      }
      const uniqueCheck = nextUniqueSlug(s, selected.id);
      if (uniqueCheck !== s) {
        setError("Slug already exists. Choose a unique slug.");
        return;
      }
      const { error: err } = await supabase
        .from("site_pages")
        .update({
          title: t,
          slug: s,
          nav_label: navLabel.trim().length ? navLabel.trim() : null,
          show_in_header_nav: showHeader,
          show_in_footer_nav: showFooter,
          meta_title: metaTitle.trim().length ? metaTitle.trim() : null,
          meta_description: metaDescription.trim().length ? metaDescription.trim() : null,
          status,
          draft_content: withSections(sections),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selected.id);
      if (err) {
        setError(err.message);
        return;
      }
      setSaved("Draft saved");
      await loadPages();
    } finally {
      setLoading(false);
    }
  }

  async function publish() {
    if (!selected) return;
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const t = title.trim();
      const s = normalizeSlug(slug);
      const uniqueCheck = nextUniqueSlug(s, selected.id);
      if (uniqueCheck !== s) {
        setError("Slug already exists. Choose a unique slug.");
        return;
      }
      const draft = withSections(sections);
      const { error: err } = await supabase
        .from("site_pages")
        .update({
          title: t,
          slug: s,
          nav_label: navLabel.trim().length ? navLabel.trim() : null,
          show_in_header_nav: showHeader,
          show_in_footer_nav: showFooter,
          meta_title: metaTitle.trim().length ? metaTitle.trim() : null,
          meta_description: metaDescription.trim().length ? metaDescription.trim() : null,
          status: "published",
          draft_content: draft,
          published_content: draft,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selected.id);
      if (err) {
        setError(err.message);
        return;
      }
      setStatus("published");
      await requestAdminRevalidate(supabase, ["/", `/p/${s}`]);
      setSaved("Published");
      await loadPages();
    } finally {
      setLoading(false);
    }
  }

  async function unpublish() {
    if (!selected) return;
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const { error: err } = await supabase
        .from("site_pages")
        .update({ status: "draft", updated_at: new Date().toISOString() })
        .eq("id", selected.id);
      if (err) {
        setError(err.message);
        return;
      }
      setStatus("draft");
      await requestAdminRevalidate(supabase, ["/", `/p/${selected.slug}`]);
      setSaved("Unpublished");
      await loadPages();
    } finally {
      setLoading(false);
    }
  }

  async function revertDraft() {
    if (!selected) return;
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const nextSections = toSections(selected.published_content);
      setSections(nextSections);
      setSelectedSectionId(nextSections[0]?.id || null);
      const { error: err } = await supabase
        .from("site_pages")
        .update({ draft_content: selected.published_content, updated_at: new Date().toISOString() })
        .eq("id", selected.id);
      if (err) {
        setError(err.message);
        return;
      }
      await requestAdminRevalidate(supabase, ["/p/" + selected.slug]);
      setSaved("Reverted to published");
      await loadPages();
    } finally {
      setLoading(false);
    }
  }

  async function createNew() {
    await createNewWithValues({ title, slug, navLabel });
  }

  async function deleteSelected() {
    if (!selected) return;
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const { error: err } = await supabase.from("site_pages").delete().eq("id", selected.id);
      if (err) {
        setError(err.message);
        return;
      }
      setSelectedId(null);
      setSaved("Deleted");
      await loadPages();
    } finally {
      setLoading(false);
    }
  }

  function addRichTextSection() {
    const id = nowId("rich");
    const next: PageSection[] = [...sections, { id, type: "rich_text", enabled: true, settings: { title: "", content: "<p></p>" } }];
    setSections(next);
    setSelectedSectionId(id);
  }

  function updateSection(next: PageSection) {
    setSections((prev) => prev.map((s) => (s.id === next.id ? next : s)));
  }

  function reorderSections(activeId: string, overId: string) {
    if (activeId === overId) return;
    setSections((prev) => {
      const from = prev.findIndex((s) => s.id === activeId);
      const to = prev.findIndex((s) => s.id === overId);
      if (from < 0 || to < 0) return prev;
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function deleteSection(id: string) {
    const next = sections.filter((s) => s.id !== id);
    setSections(next);
    setSelectedSectionId(next[0]?.id || null);
  }

  return {
    loading, error, saved,
    pages, selectedId, setSelectedId, selected,
    title, setTitle, slug, setSlug,
    navLabel, setNavLabel,
    showHeader, setShowHeader, showFooter, setShowFooter,
    metaTitle, setMetaTitle, metaDescription, setMetaDescription,
    status, setStatus,
    sections, selectedSectionId, setSelectedSectionId, selectedSection,
    loadPages, saveDraft, publish, unpublish, revertDraft, createNew, deleteSelected,
    addRichTextSection, updateSection, deleteSection, reorderSections,
    createNewWithValues,
  };
}
