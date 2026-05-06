import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { PageSection } from "@/components/admin/pages/types";

type Props = {
  section: PageSection | null;
  onChange: (next: PageSection) => void;
  onDelete: () => void;
};

export function RichTextInspector({ section, onChange, onDelete }: Props) {
  if (!section) {
    return <div className="text-sm text-slate-600 dark:text-slate-400">Select a section.</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Enabled"
        value={section.enabled ? "yes" : "no"}
        onChange={(e) => onChange({ ...section, enabled: e.target.value === "yes" })}
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
      />
      <Input
        label="Title"
        value={section.settings?.title || ""}
        onChange={(e) => onChange({ ...section, settings: { ...(section.settings || {}), title: e.target.value } })}
      />
      <Textarea
        label="HTML content"
        value={section.settings?.content || ""}
        onChange={(e) => onChange({ ...section, settings: { ...(section.settings || {}), content: e.target.value } })}
        rows={14}
      />
      <Button variant="secondary" className="h-10" onClick={onDelete}>
        Delete Section
      </Button>
    </div>
  );
}

