import { useEffect, useMemo, useRef } from "react";
import { Select } from "@/components/ui/Select";
import { normalizeSlug, withSections, type PageSection } from "@/components/admin/pages/types";

type Props = {
  slug: string;
  mode: "desktop" | "tablet" | "mobile";
  onModeChange: (mode: "desktop" | "tablet" | "mobile") => void;
  sections: PageSection[];
};

export function PagePreview({ slug, mode, onModeChange, sections }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const src = useMemo(() => {
    const s = normalizeSlug(slug);
    return s.length ? `/p/${s}?builderPreview=true&device=${mode}` : `/?builderPreview=true&device=${mode}`;
  }, [slug, mode]);
  const previewWidth = mode === "mobile" ? "w-[390px]" : mode === "tablet" ? "w-[820px]" : "w-full";

  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ type: "shaditz_page_builder_preview", page: withSections(sections) }, window.location.origin);
  }, [sections]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between border-b border-white/10 bg-[var(--cf-secondary)]/60 px-4 py-3 text-sm">
        <div className="font-bold text-white">Preview</div>
        <Select
          label=""
          value={mode}
          onChange={(e) => onModeChange(e.target.value as any)}
          options={[
            { value: "desktop", label: "Desktop" },
            { value: "tablet", label: "Tablet" },
            { value: "mobile", label: "Mobile" },
          ]}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden p-3">
        <div className={`h-full ${previewWidth} overflow-hidden rounded-2xl border border-white/10 bg-[#0A0F1E] shadow-[0_18px_50px_rgba(0,0,0,0.55)]`}>
          <iframe
            ref={iframeRef}
            title="Page preview"
            src={src}
            style={{ width: "100%", height: "100%", border: "none" }}
            onLoad={() => {
              iframeRef.current?.contentWindow?.postMessage(
                { type: "shaditz_page_builder_preview", page: withSections(sections) },
                window.location.origin,
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
