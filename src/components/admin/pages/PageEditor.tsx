import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type Props = {
  slug: string;
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  showHeader: boolean;
  showFooter: boolean;
  status: "draft" | "published";
  onSlugChange: (v: string) => void;
  onNavLabelChange: (v: string) => void;
  onMetaTitleChange: (v: string) => void;
  onMetaDescriptionChange: (v: string) => void;
  onShowHeaderChange: (v: boolean) => void;
  onShowFooterChange: (v: boolean) => void;
  onStatusChange: (v: "draft" | "published") => void;
};

export function PageEditor({
  slug,
  navLabel,
  metaTitle,
  metaDescription,
  showHeader,
  showFooter,
  status,
  onSlugChange,
  onNavLabelChange,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onShowHeaderChange,
  onShowFooterChange,
  onStatusChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-white/10 bg-[var(--cf-surface-container)] p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">Basic info</div>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Slug" value={slug} onChange={(e) => onSlugChange(e.target.value)} placeholder="privacy-policy" />
          <Input label="Nav label" value={navLabel} onChange={(e) => onNavLabelChange(e.target.value)} placeholder="Privacy" />
          <Select
            label="Show in header nav"
            value={showHeader ? "yes" : "no"}
            onChange={(e) => onShowHeaderChange(e.target.value === "yes")}
            options={[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes" },
            ]}
          />
          <Select
            label="Show in footer nav"
            value={showFooter ? "yes" : "no"}
            onChange={(e) => onShowFooterChange(e.target.value === "yes")}
            options={[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes" },
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value === "published" ? "published" : "draft")}
            options={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
            ]}
          />
          <div className="rounded-2xl border border-white/10 bg-[var(--cf-surface-low)] px-4 py-3">
            <div className="text-xs font-semibold text-white/70">URL</div>
            <div className="mt-1 truncate text-sm text-white">/p/{slug || "your-slug"}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[var(--cf-surface-container)] p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">SEO</div>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Meta title" value={metaTitle} onChange={(e) => onMetaTitleChange(e.target.value)} placeholder="Privacy Policy" />
          <Input
            label="Meta description"
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="Privacy Policy for Shaditz."
          />
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-[var(--cf-surface-low)] px-4 py-3">
          <div className="text-xs font-semibold text-white/70">Search preview</div>
          <div className="mt-2">
            <div className="truncate text-sm font-semibold text-[var(--cf-accent)]">{(metaTitle || "Meta title").trim()}</div>
            <div className="mt-1 truncate text-xs text-white/50">https://shaditz.vercel.app/p/{slug || "your-slug"}</div>
            <div className="mt-1 line-clamp-2 text-sm text-white/70">{(metaDescription || "Meta description").trim()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
