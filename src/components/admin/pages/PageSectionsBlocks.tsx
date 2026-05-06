import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/Button";
import type { PageSection } from "@/components/admin/pages/types";
import { GripVertical, Eye, EyeOff, Plus, ChevronRight } from "lucide-react";

type Props = {
  sections: PageSection[];
  selectedSectionId: string | null;
  onSelect: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onAdd: () => void;
};

function SectionCard({
  section,
  selected,
  onSelect,
  onToggle,
}: {
  section: PageSection;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
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
          ? "group rounded-2xl border border-[var(--cf-accent)]/35 bg-[var(--cf-accent)]/10"
          : "group rounded-2xl border border-white/10 bg-white/0 hover:bg-white/5"
      }
    >
      <div className={isDragging ? "flex items-center gap-3 px-3 py-3 opacity-75" : "flex items-center gap-3 px-3 py-3"}>
        <button
          type="button"
          className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white"
          {...attributes}
          {...listeners}
          aria-label="Drag"
        >
          <GripVertical size={18} />
        </button>

        <button type="button" className="min-w-0 flex-1 text-left" onClick={onSelect}>
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-sm font-semibold text-white">{(section.settings?.title || "Untitled").toString()}</div>
            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/60">
              {section.type}
            </div>
          </div>
          <div className="mt-1 text-xs text-white/50">{section.enabled ? "Enabled" : "Disabled"}</div>
        </button>

        <button
          type="button"
          className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          onClick={onToggle}
          aria-label="Toggle enabled"
        >
          {section.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>

        <button
          type="button"
          className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60"
          onClick={onSelect}
          aria-label="Open inspector"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export function PageSectionsBlocks({
  sections,
  selectedSectionId,
  onSelect,
  onToggleEnabled,
  onReorder,
  onAdd,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over) return;
    const activeId = String(e.active.id);
    const overId = String(e.over.id);
    onReorder(activeId, overId);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--cf-surface-container)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">Content</div>
          <div className="mt-1 text-sm font-semibold text-white">Sections</div>
        </div>
        <Button variant="secondary" className="h-10" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="mt-4">
        {sections.length ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {sections.map((s) => (
                  <SectionCard
                    key={s.id}
                    section={s}
                    selected={selectedSectionId === s.id}
                    onSelect={() => onSelect(s.id)}
                    onToggle={() => onToggleEnabled(s.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/0 p-6 text-center">
            <div className="text-sm font-semibold text-white">No sections yet</div>
            <div className="mt-1 text-sm text-white/60">Add your first content section.</div>
            <div className="mt-4 flex justify-center">
              <Button className="h-11" onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add section
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

