import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PagesList } from "@/components/admin/pages/PagesList";
import { PageEditor } from "@/components/admin/pages/PageEditor";
import { RichTextInspector } from "@/components/admin/pages/RichTextInspector";
import { usePagesManager } from "@/components/admin/pages/usePagesManager";
import { NewPageModal } from "@/components/admin/pages/NewPageModal";
import { PageSectionsBlocks } from "@/components/admin/pages/PageSectionsBlocks";
import { SectionEditorModal } from "@/components/admin/pages/SectionEditorModal";
import { ArrowLeft, MoreHorizontal, X } from "lucide-react";

type Props = {
  supabase: SupabaseClient;
};

export function PagesPanel({ supabase }: Props) {
  const m = usePagesManager(supabase);
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsMobile(Boolean(mq.matches));
    update();
    const anyMq = mq as unknown as {
      addEventListener?: (type: "change", listener: () => void) => void;
      addListener?: (listener: () => void) => void;
      removeEventListener?: (type: "change", listener: () => void) => void;
      removeListener?: (listener: () => void) => void;
    };
    if (anyMq.addEventListener) anyMq.addEventListener("change", update);
    else if (anyMq.addListener) anyMq.addListener(update);
    return () => {
      if (anyMq.removeEventListener) anyMq.removeEventListener("change", update);
      else if (anyMq.removeListener) anyMq.removeListener(update);
    };
  }, []);

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return m.pages;
    return m.pages.filter((p) => {
      const t = String(p.title || "").toLowerCase();
      const s = String(p.slug || "").toLowerCase();
      return t.includes(q) || s.includes(q);
    });
  }, [m.pages, query]);

  const canPublish = !m.loading && m.title.trim().length > 0 && m.slug.trim().length > 0;

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[var(--cf-bg)]">
      {isMobile ? (
        <div className="border-b border-white/10 bg-[var(--cf-surface)] px-4 py-3">
          {!mobileEditorOpen ? (
            <div className="flex items-center justify-between gap-3">
              <div className="text-base font-semibold text-white">Pages</div>
              <Button className="h-10" disabled={m.loading} onClick={() => setNewPageOpen(true)}>
                New
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
                onClick={() => {
                  setMobileEditorOpen(false);
                  setSectionModalOpen(false);
                }}
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{m.title.trim().length ? m.title : "Untitled"}</div>
                <div className="mt-0.5 truncate text-xs text-white/50">/p/{m.slug || "your-slug"}</div>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80"
                onClick={() => setMoreOpen(true)}
                aria-label="More"
              >
                <MoreHorizontal size={18} />
              </button>
              <Button className="h-10" disabled={!canPublish} onClick={m.publish}>
                Publish
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {m.error ? (
        <div className="border-b border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 lg:px-6">
          {m.error}
        </div>
      ) : null}
      {m.saved ? (
        <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 lg:px-6">
          {m.saved}
        </div>
      ) : null}

      {!isMobile ? (
        <div className="flex min-h-0 flex-1 gap-3 overflow-hidden p-3">
          <div className="flex h-full min-h-0 w-[360px] flex-none flex-col rounded-2xl border border-white/10 bg-[var(--cf-surface-container)] p-3">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">Pages</div>
              <div className="text-xs text-white/40">{filteredPages.length}</div>
            </div>
            <div className="mt-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--cf-accent)] focus:ring-2 focus:ring-[var(--cf-accent)]/20"
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button className="h-10 flex-1" disabled={m.loading} onClick={() => setNewPageOpen(true)}>
                New page
              </Button>
              <Button variant="secondary" className="h-10" disabled={m.loading} onClick={m.loadPages}>
                Refresh
              </Button>
            </div>
            <PagesList
              pages={filteredPages}
              selectedId={m.selectedId}
              onSelect={(id) => {
                m.setSelectedId(id);
              }}
            />
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
            <div className="rounded-2xl border border-white/10 bg-[var(--cf-surface-container)] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <input
                    value={m.title}
                    onChange={(e) => m.setTitle(e.target.value)}
                    placeholder="Page title"
                    className="w-full truncate bg-transparent text-lg font-semibold text-white outline-none placeholder:text-white/35"
                  />
                  <div className="mt-0.5 truncate text-xs text-white/50">/p/{m.slug || "your-slug"}</div>
                </div>
                <div
                  className={
                    m.status === "published"
                      ? "inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200"
                      : "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/60"
                  }
                >
                  {m.status === "published" ? "Published" : "Draft"}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="h-10" disabled={m.loading} onClick={m.saveDraft}>
                    Save draft
                  </Button>
                  {m.status === "published" ? (
                    <Button variant="secondary" className="h-10" disabled={m.loading} onClick={m.unpublish}>
                      Unpublish
                    </Button>
                  ) : null}
                  <Button className="h-10" disabled={!canPublish} onClick={m.publish}>
                    Publish
                  </Button>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                    onClick={() => setMoreOpen(true)}
                    aria-label="More"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pb-6">
              <div className="flex flex-col gap-3">
                <PageEditor
                  slug={m.slug}
                  navLabel={m.navLabel}
                  metaTitle={m.metaTitle}
                  metaDescription={m.metaDescription}
                  showHeader={m.showHeader}
                  showFooter={m.showFooter}
                  status={m.status}
                  onSlugChange={m.setSlug}
                  onNavLabelChange={m.setNavLabel}
                  onMetaTitleChange={m.setMetaTitle}
                  onMetaDescriptionChange={m.setMetaDescription}
                  onShowHeaderChange={m.setShowHeader}
                  onShowFooterChange={m.setShowFooter}
                  onStatusChange={m.setStatus}
                />

                <PageSectionsBlocks
                  sections={m.sections}
                  selectedSectionId={m.selectedSectionId}
                  onSelect={(id) => {
                    m.setSelectedSectionId(id);
                  }}
                  onToggleEnabled={(id) => {
                    const s = m.sections.find((x) => x.id === id);
                    if (!s) return;
                    m.updateSection({ ...s, enabled: !s.enabled });
                  }}
                  onReorder={m.reorderSections}
                  onAdd={m.addRichTextSection}
                />
              </div>
            </div>

            <div
              className={
                m.selectedSectionId
                  ? "pointer-events-auto fixed bottom-0 right-0 top-0 z-50 w-[420px] translate-x-0 border-l border-white/10 bg-[var(--cf-secondary)] transition-transform"
                  : "pointer-events-none fixed bottom-0 right-0 top-0 z-50 w-[420px] translate-x-full border-l border-white/10 bg-[var(--cf-secondary)] transition-transform"
              }
            >
              <div className="flex h-full min-h-0 flex-col">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">Inspector</div>
                    <div className="mt-0.5 truncate text-xs text-white/50">
                      {m.selectedSection ? (m.selectedSection.settings?.title || m.selectedSection.type).toString() : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80"
                    onClick={() => m.setSelectedSectionId(null)}
                    aria-label="Close inspector"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                  <RichTextInspector
                    section={m.selectedSection}
                    onChange={m.updateSection}
                    onDelete={() => {
                      if (m.selectedSectionId) m.deleteSection(m.selectedSectionId);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-hidden">
          {!mobileEditorOpen ? (
            <div className="flex h-full min-h-0 flex-col gap-3 p-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--cf-accent)] focus:ring-2 focus:ring-[var(--cf-accent)]/20"
              />
              <PagesList
                pages={filteredPages}
                selectedId={m.selectedId}
                onSelect={(id) => {
                  m.setSelectedId(id);
                  setMobileEditorOpen(true);
                }}
              />
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col gap-3 p-3">
              <div className="flex flex-col gap-3">
                <div className="rounded-2xl border border-white/10 bg-[var(--cf-surface-container)] px-4 py-3">
                  <input
                    value={m.title}
                    onChange={(e) => m.setTitle(e.target.value)}
                    placeholder="Page title"
                    className="w-full bg-transparent text-lg font-semibold text-white outline-none placeholder:text-white/35"
                  />
                  <div className="mt-1 text-xs text-white/50">/p/{m.slug || "your-slug"}</div>
                </div>

                <PageEditor
                  slug={m.slug}
                  navLabel={m.navLabel}
                  metaTitle={m.metaTitle}
                  metaDescription={m.metaDescription}
                  showHeader={m.showHeader}
                  showFooter={m.showFooter}
                  status={m.status}
                  onSlugChange={m.setSlug}
                  onNavLabelChange={m.setNavLabel}
                  onMetaTitleChange={m.setMetaTitle}
                  onMetaDescriptionChange={m.setMetaDescription}
                  onShowHeaderChange={m.setShowHeader}
                  onShowFooterChange={m.setShowFooter}
                  onStatusChange={m.setStatus}
                />

                <PageSectionsBlocks
                  sections={m.sections}
                  selectedSectionId={m.selectedSectionId}
                  onSelect={(id) => {
                    m.setSelectedSectionId(id);
                    setSectionModalOpen(true);
                  }}
                  onToggleEnabled={(id) => {
                    const s = m.sections.find((x) => x.id === id);
                    if (!s) return;
                    m.updateSection({ ...s, enabled: !s.enabled });
                  }}
                  onReorder={m.reorderSections}
                  onAdd={m.addRichTextSection}
                />

                <div className="pb-24" />
              </div>
            </div>
          )}
        </div>
      )}

      <NewPageModal
        open={newPageOpen}
        pages={m.pages}
        onClose={() => setNewPageOpen(false)}
        onCreate={async ({ title, slug }) => {
          await m.createNewWithValues({ title, slug });
          if (isMobile) setMobileEditorOpen(true);
        }}
      />

      <SectionEditorModal
        open={isMobile && sectionModalOpen}
        section={m.selectedSection}
        onClose={() => {
          setSectionModalOpen(false);
          m.setSelectedSectionId(null);
        }}
        onChange={m.updateSection}
        onDelete={() => {
          if (m.selectedSectionId) m.deleteSection(m.selectedSectionId);
          setSectionModalOpen(false);
        }}
      />

      {moreOpen ? (
        <div className="fixed inset-0 z-[1000] bg-black/60 p-4" onClick={() => setMoreOpen(false)}>
          <div
            className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[var(--cf-secondary)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="text-sm font-semibold text-white">Actions</div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80"
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 p-3">
              <Button variant="secondary" className="h-11" disabled={m.loading} onClick={m.saveDraft}>
                Save draft
              </Button>
              {m.status === "published" ? (
                <Button variant="secondary" className="h-11" disabled={m.loading} onClick={m.unpublish}>
                  Unpublish
                </Button>
              ) : (
                <Button className="h-11" disabled={!canPublish} onClick={m.publish}>
                  Publish
                </Button>
              )}
              <Button variant="secondary" className="h-11" disabled={m.loading} onClick={m.revertDraft}>
                Revert draft
              </Button>
              <Button
                variant="secondary"
                className="h-11"
                disabled={m.loading}
                onClick={() => {
                  m.deleteSelected();
                  setMoreOpen(false);
                  if (isMobile) {
                    setMobileEditorOpen(false);
                    setSectionModalOpen(false);
                  }
                }}
              >
                Delete page
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
