import type { SitePage } from "@/components/admin/pages/types";
import { FileText, Mail, Scale, Shield } from "lucide-react";

type Props = {
  pages: SitePage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function PagesList({ pages, selectedId, onSelect }: Props) {
  return (
    <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
      {pages.map((p) => (
        <button
          key={p.id}
          type="button"
          className={
            selectedId === p.id
              ? "group w-full rounded-2xl border border-[var(--cf-accent)]/35 bg-[var(--cf-accent)]/10 px-3 py-3 text-left"
              : "group w-full rounded-2xl border border-white/10 bg-white/0 px-3 py-3 text-left hover:bg-white/5"
          }
          onClick={() => onSelect(p.id)}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 group-hover:text-white">
              {String(p.slug || "").includes("privacy") ? (
                <Shield size={18} />
              ) : String(p.slug || "").includes("terms") ? (
                <Scale size={18} />
              ) : String(p.slug || "").includes("contact") ? (
                <Mail size={18} />
              ) : (
                <FileText size={18} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-semibold text-white">{p.title}</div>
                <div
                  className={
                    p.status === "published"
                      ? "inline-flex flex-none items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-200"
                      : "inline-flex flex-none items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/60"
                  }
                >
                  {p.status === "published" ? "Published" : "Draft"}
                </div>
              </div>
              <div className="mt-1 truncate text-xs text-white/50">/{p.slug}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
