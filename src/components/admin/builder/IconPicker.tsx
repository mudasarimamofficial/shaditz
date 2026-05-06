"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { MediaPickerModal } from "@/components/admin/builder/MediaPickerModal";

export type IconRef = { type: "library" | "upload"; value: string };

type Props = {
  supabase: SupabaseClient;
  label: ReactNode;
  value?: IconRef | null;
  onChange: (next: IconRef | null) => void;
};

const libraryOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
];

export function IconPicker({ supabase, label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const mode = value?.type || "library";
  const libValue = value?.type === "library" ? value.value : "instagram";

  const preview = useMemo(() => {
    if (!value) return null;
    return <DynamicIcon icon={value} className="h-5 w-5" />;
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</div>
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs dark:border-white/10 dark:bg-white/5">
            {preview || <span className="text-slate-400">None</span>}
          </div>
          <Button variant="secondary" className="h-9" onClick={() => onChange(null)}>
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Select
          label="Type"
          value={mode}
          onChange={(e) => {
            const next = e.target.value as IconRef["type"];
            if (next === "library") onChange({ type: "library", value: libValue });
            else onChange({ type: "upload", value: "" });
          }}
          options={[
            { value: "library", label: "Library" },
            { value: "upload", label: "Upload" },
          ]}
        />

        {mode === "library" ? (
          <Select
            label="Library icon"
            value={libValue}
            onChange={(e) => onChange({ type: "library", value: e.target.value })}
            options={libraryOptions}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Upload icon</div>
            <Button
              variant="secondary"
              className="h-10"
              onClick={() => setOpen(true)}
            >
              Choose / Upload
            </Button>
          </div>
        )}
      </div>

      <MediaPickerModal
        supabase={supabase}
        open={open}
        title="Pick an icon"
        accept="image/*"
        onClose={() => setOpen(false)}
        onPick={(asset) => onChange({ type: "upload", value: asset.url })}
      />
    </div>
  );
}
