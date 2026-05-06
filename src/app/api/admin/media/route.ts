import { NextResponse } from "next/server";
import { z } from "zod";
import { adminJsonError, requireAdmin } from "@/utils/adminApi";
import { MEDIA_BUCKET } from "@/utils/mediaBucket";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizePathSegment(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanPrefix(v: string | null) {
  return (v || "media").trim().replace(/^\/+|\/+$/g, "") || "media";
}

function findPathReferences(paths: string[], label: string, content: unknown, refs: Map<string, Set<string>>) {
  const haystack = JSON.stringify(content || "");
  if (!haystack) return;
  for (const path of paths) {
    const fileName = path.split("/").pop() || path;
    if (!haystack.includes(path) && !haystack.includes(encodeURIComponent(path)) && !haystack.includes(fileName)) {
      continue;
    }
    if (!refs.has(path)) refs.set(path, new Set());
    refs.get(path)?.add(label);
  }
}

async function findInUseMedia(supabase: any, paths: string[]) {
  const refs = new Map<string, Set<string>>();

  const { data: homepage, error: homepageError } = await supabase
    .from("homepage_content")
    .select("content")
    .eq("id", 1)
    .maybeSingle();
  if (homepageError) throw homepageError;
  findPathReferences(paths, "published homepage", homepage?.content, refs);

  const { data: draft, error: draftError } = await supabase
    .from("homepage_content_drafts")
    .select("content")
    .eq("id", 1)
    .maybeSingle();
  if (draftError) throw draftError;
  findPathReferences(paths, "homepage draft", draft?.content, refs);

  const { data: pages, error: pagesError } = await supabase
    .from("site_pages")
    .select("slug, draft_content, published_content");
  if (pagesError) throw pagesError;

  for (const page of pages || []) {
    const slug = String((page as any).slug || "page");
    findPathReferences(paths, `page draft:${slug}`, (page as any).draft_content, refs);
    findPathReferences(paths, `page published:${slug}`, (page as any).published_content, refs);
  }

  return Array.from(refs.entries()).map(([path, locations]) => ({
    path,
    locations: Array.from(locations),
  }));
}

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);

  const { searchParams } = new URL(req.url);
  const prefix = cleanPrefix(searchParams.get("prefix"));
  const { data, error } = await gate.supabase.storage.from(MEDIA_BUCKET).list(prefix, {
    limit: 500,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  const assets = (data || [])
    .filter((file: any) => file?.name && (file.id || file.metadata))
    .map((file: any) => {
      const path = `${prefix}/${file.name}`;
      const { data: publicUrl } = gate.supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      return { name: file.name, path, url: publicUrl.publicUrl, metadata: file.metadata || null };
    });

  return NextResponse.json({ ok: true, bucket: MEDIA_BUCKET, prefix, assets }, { status: 200 });
}

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "Missing file" }, { status: 400 });
  }

  const prefix = cleanPrefix(String(form.get("prefix") || "media"));
  const safeName = sanitizePathSegment(file.name);
  const path = `${prefix}/${Date.now()}-${safeName || "file"}`;
  const { error } = await gate.supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  const { data } = gate.supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, bucket: MEDIA_BUCKET, asset: { path, url: data.publicUrl } }, { status: 201 });
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = z
    .object({ paths: z.array(z.string().min(1)).min(1).max(50), force: z.boolean().optional() })
    .safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });

  try {
    const inUse = await findInUseMedia(gate.supabase, parsed.data.paths);
    if (inUse.length && !parsed.data.force) {
      return NextResponse.json(
        { ok: false, message: "Media is still in use", inUse },
        { status: 409 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to check media usage" },
      { status: 500 },
    );
  }

  const { data, error } = await gate.supabase.storage.from(MEDIA_BUCKET).remove(parsed.data.paths);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, removed: data || [] }, { status: 200 });
}
