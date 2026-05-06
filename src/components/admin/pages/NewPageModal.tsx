import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { normalizeSlug, type SitePage } from "@/components/admin/pages/types";
import { FileText, Mail, Scale, Shield, X } from "lucide-react";

type Props = {
  open: boolean;
  pages: SitePage[];
  onClose: () => void;
  onCreate: (params: { title: string; slug: string }) => Promise<void> | void;
};

function nextUniqueSlug(pages: SitePage[], preferred: string) {
  const base = normalizeSlug(preferred);
  const taken = new Set(
    pages
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

function pageTypeIcon(slug: string) {
  const s = slug.toLowerCase();
  if (s.includes("privacy")) return <Shield size={18} />;
  if (s.includes("terms")) return <Scale size={18} />;
  if (s.includes("contact")) return <Mail size={18} />;
  return <FileText size={18} />;
}

export function NewPageModal({ open, pages, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const derivedSlug = useMemo(() => {
    const raw = slugEdited ? slug : title;
    return nextUniqueSlug(pages, raw || "new-page");
  }, [pages, slugEdited, slug, title]);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setSlug("");
    setSlugEdited(false);
    setSubmitting(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[var(--cf-surface-container)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/5 px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-white">New page</div>
            <div className="mt-1 text-sm text-white/60">Create a page and start editing immediately.</div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Page name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Privacy Policy"
              autoFocus
            />
            <Input
              label="Slug"
              value={derivedSlug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(e.target.value);
              }}
              placeholder="privacy-policy"
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[var(--cf-surface-low)] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[var(--cf-accent)]">
                {pageTypeIcon(derivedSlug)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">/{derivedSlug || "new-page"}</div>
                <div className="mt-0.5 text-xs text-white/60">Slug is unique and can be edited later.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 bg-white/5 px-5 py-4">
          <Button variant="secondary" className="h-11" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="h-11"
            disabled={submitting || !title.trim().length || !derivedSlug.trim().length}
            onClick={async () => {
              setSubmitting(true);
              try {
                await onCreate({ title: title.trim(), slug: derivedSlug.trim() });
                onClose();
              } finally {
                setSubmitting(false);
              }
            }}
          >
            Create page
          </Button>
        </div>
      </div>
    </div>
  );
}

