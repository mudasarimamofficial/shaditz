import { X } from "lucide-react";
import type { PageSection } from "@/components/admin/pages/types";
import { RichTextInspector } from "@/components/admin/pages/RichTextInspector";

type Props = {
  open: boolean;
  section: PageSection | null;
  onClose: () => void;
  onChange: (next: PageSection) => void;
  onDelete: () => void;
};

export function SectionEditorModal({ open, section, onClose, onChange, onDelete }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60" role="dialog" aria-modal="true">
      <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col bg-[var(--cf-surface)]">
        <div className="flex items-center justify-between border-b border-white/10 bg-[var(--cf-secondary)] px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">Section</div>
            <div className="mt-0.5 truncate text-xs text-white/50">{section ? (section.settings?.title || section.type).toString() : ""}</div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <RichTextInspector section={section} onChange={onChange} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

