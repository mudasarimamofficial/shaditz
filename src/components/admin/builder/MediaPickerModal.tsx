"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Image from "next/image";

type MediaAsset = {
  name: string;
  path: string;
  url: string;
};

type Props = {
  supabase: SupabaseClient;
  open: boolean;
  title: string;
  accept?: string;
  onClose: () => void;
  onPick: (asset: { url: string; path: string }) => void;
};



export function MediaPickerModal({ supabase, open, title, accept, onClose, onPick }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefix, setPrefix] = useState("media");
  const [query, setQuery] = useState("");
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || "";
      if (!token) {
        setError("Missing auth session");
        setAssets([]);
        return;
      }

      const res = await fetch(`/api/admin/media?prefix=${encodeURIComponent(prefix)}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setError(json?.message || "Failed to load media");
        setAssets([]);
        return;
      }

      const rows = (json.assets || []).filter((x: any) => x.name && !x.name.endsWith("/"));
      setAssets(rows);
    } catch (e: any) {
      setError(e?.message || "Failed to load media");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [prefix, supabase]);

  const upload = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || "";
      if (!token) {
        setError("Missing auth session");
        return;
      }

      const cleanPrefix = prefix.trim().replace(/^\/+|\/+$/g, "") || "media";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", cleanPrefix);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setError(json?.message || "Failed to upload file");
        return;
      }

      onPick({ url: json.asset.url, path: json.asset.path });
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  }, [onClose, onPick, prefix, supabase]);

  useEffect(() => {
    if (!open) return;
    load();
  }, [open, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) => a.name.toLowerCase().includes(q));
  }, [assets, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1414]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div className="text-sm font-bold">{title}</div>
          <button type="button" className="text-slate-500 hover:text-slate-700" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            <Input label="Folder" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
            <Input label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Input
              label="Upload"
              type="file"
              accept={accept}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await upload(file);
                e.target.value = "";
              }}
            />
            <Button variant="secondary" className="h-10 w-full" onClick={load} disabled={loading}>
              Refresh
            </Button>
            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </div>
            ) : null}
          </div>

          <div className="min-h-[420px]">
            {loading ? <div className="text-sm text-slate-500">Loading…</div> : null}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {filtered.map((a) => (
                <button
                  key={a.path}
                  type="button"
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-[#0fa3a3]/50 dark:border-white/10 dark:bg-white/5"
                  onClick={() => {
                    onPick({ url: a.url, path: a.path });
                    onClose();
                  }}
                >
                  <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-black/30">
                    <Image
                      src={a.url}
                      alt={a.name}
                      width={320}
                      height={180}
                      unoptimized
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="px-3 py-2">
                    <div className="truncate text-xs font-semibold">{a.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
