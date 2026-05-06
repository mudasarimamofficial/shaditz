import { Button } from "@/components/ui/Button";
import type { PageSection } from "@/components/admin/pages/types";

type Props = {
  sections: PageSection[];
  selectedSectionId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
};

export function SectionsList({ sections, selectedSectionId, onSelect, onAdd }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-white/5 p-4 lg:w-[420px] lg:flex-none">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wide text-white/50">Sections</div>
        <Button variant="secondary" className="h-9" onClick={onAdd}>
          Add
        </Button>
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            className={
              selectedSectionId === s.id
                ? "w-full rounded-xl border border-[var(--cf-accent)]/40 bg-[var(--cf-accent)]/10 px-3 py-3 text-left"
                : "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left hover:bg-white/10"
            }
            onClick={() => onSelect(s.id)}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-bold text-white">{s.type}</div>
              <div className={s.enabled ? "text-emerald-300" : "text-white/40"}>{s.enabled ? "on" : "off"}</div>
            </div>
            <div className="mt-1 text-xs text-white/50">{(s.settings?.title || "Untitled").toString()}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
