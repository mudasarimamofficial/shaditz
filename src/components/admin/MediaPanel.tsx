"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Props = {
  supabase: SupabaseClient;
};

type MediaAsset = {
  name: string;
  path: string;
  url: string;
  mimeType: string;
  inUse: boolean;
};


function isImage(asset: MediaAsset) {
  return asset.mimeType.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(asset.name);
}

function isVideo(asset: MediaAsset) {
  return asset.mimeType.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(asset.name);
}

export function MediaPanel({ supabase }: Props) {
  const [prefix, setPrefix] = useState("media");
  const [query, setQuery] = useState("");
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadUsageIndex = useCallback(async () => {
    const chunks: string[] = [];
    const { data: home } = await supabase.from("homepage_content").select("content").eq("id", 1).maybeSingle();
    if (home?.content) chunks.push(JSON.stringify(home.content));

    const { data: drafts } = await supabase.from("homepage_content_drafts").select("content").eq("id", 1).maybeSingle();
    if (drafts?.content) chunks.push(JSON.stringify(drafts.content));

    const { data: pages } = await supabase
      .from("site_pages")
      .select("draft_content, published_content, meta_title, meta_description");
    if (pages) chunks.push(JSON.stringify(pages));

    const next = chunks.join("\n");
    return next;
  }, [supabase]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || "";
      if (!token) {
        setError("Missing auth session");
        return;
      }
      const cleanPrefix = prefix.trim().replace(/^\/+|\/+$/g, "") || "media";
      const res = await fetch(`/api/admin/media?prefix=${encodeURIComponent(cleanPrefix)}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setAssets([]);
        setError(json?.message || "Failed to load media");
        return;
      }
      const usage = await loadUsageIndex();
      const rows = (json.assets || []).filter((x: any) => x.name && !x.name.endsWith("/"));
      const next: MediaAsset[] = rows.map((x: any) => ({
        name: x.name,
        path: x.path,
        url: x.url,
        mimeType: x.metadata?.mimetype || x.metadata?.mimeType || "",
        inUse: Boolean(usage && (usage.includes(x.path) || usage.includes(x.url))),
      }));
      setAssets(next);
    } finally {
      setLoading(false);
    }
  }, [loadUsageIndex, prefix, supabase]);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    setNotice(null);
    try {
      const cleanPrefix = prefix.trim().replace(/^\/+|\/+$/g, "") || "media";
      
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || "";
      if (!token) {
        setError("Missing auth session");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", cleanPrefix);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.message || "Failed to upload file");
        return;
      }

      setPrefix(cleanPrefix);
      setNotice("Uploaded");
      await load();
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred");
    } finally {
      setUploading(false);
    }
  }

  async function remove(asset: MediaAsset) {
    setError(null);
    setNotice(null);
    if (asset.inUse && !forceDelete) {
      setError("This asset appears to be used by published or draft content. Enable force delete to remove it.");
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token || "";
    if (!token) {
      setError("Missing auth session");
      return;
    }
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ paths: [asset.path], force: forceDelete }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      setError(json?.message || "Delete failed");
      return;
    }
    setNotice("Deleted");
    await load();
  }

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((asset) => asset.name.toLowerCase().includes(q) || asset.path.toLowerCase().includes(q));
  }, [assets, query]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 pb-10 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Media</h1>
        <p className="mt-1 text-sm text-white/60">Upload, browse, copy, and safely remove assets from the Supabase bucket.</p>
      </div>

      {error ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
      {notice ? <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</div> : null}

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-[240px_1fr]">
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70">
            Bucket: <span className="font-semibold text-white">assets</span>
          </div>
          <Input label="Folder" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="media" />
          <Input label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Input
            label="Upload"
            type="file"
            accept="image/*,video/*,.pdf,.svg"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              await upload(file);
              e.target.value = "";
            }}
          />
          <Button variant="secondary" className="h-10" onClick={load} disabled={loading || uploading}>
            Refresh
          </Button>
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white/80">
            <input
              type="checkbox"
              checked={forceDelete}
              onChange={(e) => setForceDelete(e.target.checked)}
              className="h-4 w-4"
            />
            Force delete in-use assets
          </label>
        </div>

        <div className="min-h-[420px]">
          {loading ? <div className="text-sm text-white/60">Loading...</div> : null}
          {!loading && !filtered.length ? <div className="text-sm text-white/60">No assets found in this folder.</div> : null}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((asset) => (
              <div key={asset.path} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                <div className="aspect-video bg-black/30">
                  {isImage(asset) ? (
                    <Image
                      src={asset.url}
                      alt={asset.name}
                      width={640}
                      height={360}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : isVideo(asset) ? (
                    <video src={asset.url} className="h-full w-full object-cover" controls muted />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-xs text-white/60">
                      {asset.mimeType || "File"}
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{asset.name}</div>
                    <div className="mt-1 break-all text-[11px] text-white/45">{asset.path}</div>
                  </div>
                  {asset.inUse ? (
                    <div className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[11px] font-semibold text-amber-200">
                      In use
                    </div>
                  ) : null}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      className="h-9"
                      onClick={async () => {
                        await navigator.clipboard.writeText(asset.url);
                        setNotice("URL copied");
                      }}
                    >
                      Copy URL
                    </Button>
                    <Button variant="secondary" className="h-9" onClick={() => remove(asset)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
