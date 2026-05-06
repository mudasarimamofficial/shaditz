import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { adminJsonError, requireAdmin } from "@/utils/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contentSchema = z.record(z.unknown());

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("save-draft"),
    content: contentSchema,
    publishedUpdatedAt: z.string().nullable().optional(),
  }),
  z.object({
    action: z.literal("publish"),
    content: contentSchema.optional(),
  }),
  z.object({
    action: z.literal("revert"),
  }),
  z.object({
    action: z.literal("restore-version"),
    versionId: z.number().int().positive(),
    target: z.enum(["draft", "published"]).optional(),
  }),
]);

async function readHomepage(supabase: SupabaseClient) {
  const { data: published, error: pubErr } = await supabase
    .from("homepage_content")
    .select("content, updated_at")
    .eq("id", 1)
    .maybeSingle();
  if (pubErr) throw pubErr;

  const { data: draft, error: draftErr } = await supabase
    .from("homepage_content_drafts")
    .select("content, published_updated_at, updated_at")
    .eq("id", 1)
    .maybeSingle();
  if (draftErr) throw draftErr;

  const { data: versions, error: versionErr } = await supabase
    .from("homepage_content_versions")
    .select("id, created_at, content")
    .eq("homepage_id", 1)
    .order("created_at", { ascending: false })
    .limit(20);
  if (versionErr) throw versionErr;

  return { published, draft, versions: versions || [] };
}

async function snapshotPublished(supabase: SupabaseClient) {
  const { data: current, error } = await supabase
    .from("homepage_content")
    .select("content")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  if (current?.content) {
    const { error: versionErr } = await supabase
      .from("homepage_content_versions")
      .insert({ homepage_id: 1, content: current.content, created_by: null });
    if (versionErr) throw versionErr;
  }
}

async function clearDraft(supabase: SupabaseClient, publishedUpdatedAt?: string | null) {
  const { error } = await supabase
    .from("homepage_content_drafts")
    .upsert({ id: 1, content: {}, published_updated_at: publishedUpdatedAt || null }, { onConflict: "id" });
  if (error) throw error;
}

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);

  try {
    const data = await readHomepage(gate.supabase);
    return NextResponse.json({ ok: true, ...data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to read homepage" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Invalid action" }, { status: 400 });

  try {
    const supabase = gate.supabase;
    if (parsed.data.action === "save-draft") {
      const { error } = await supabase
        .from("homepage_content_drafts")
        .upsert(
          { id: 1, content: parsed.data.content, published_updated_at: parsed.data.publishedUpdatedAt || null },
          { onConflict: "id" },
        );
      if (error) throw error;
      return NextResponse.json({ ok: true, action: "save-draft" }, { status: 200 });
    }

    if (parsed.data.action === "revert") {
      await clearDraft(supabase);
      return NextResponse.json({ ok: true, action: "revert" }, { status: 200 });
    }

    if (parsed.data.action === "restore-version") {
      const { data: version, error } = await supabase
        .from("homepage_content_versions")
        .select("content")
        .eq("id", parsed.data.versionId)
        .maybeSingle();
      if (error) throw error;
      if (!version?.content) return NextResponse.json({ ok: false, message: "Version not found" }, { status: 404 });

      if (parsed.data.target === "published") {
        await snapshotPublished(supabase);
        const { data: updated, error: updateErr } = await supabase
          .from("homepage_content")
          .upsert({ id: 1, content: version.content }, { onConflict: "id" })
          .select("updated_at")
          .maybeSingle();
        if (updateErr) throw updateErr;
        await clearDraft(supabase, updated?.updated_at || null);
        revalidatePath("/");
      } else {
        const { data: published } = await supabase
          .from("homepage_content")
          .select("updated_at")
          .eq("id", 1)
          .maybeSingle();
        const { error: draftErr } = await supabase
          .from("homepage_content_drafts")
          .upsert(
            { id: 1, content: version.content, published_updated_at: published?.updated_at || null },
            { onConflict: "id" },
          );
        if (draftErr) throw draftErr;
      }
      return NextResponse.json({ ok: true, action: "restore-version" }, { status: 200 });
    }

    const content = parsed.data.content;
    const publishContent =
      content ||
      (await supabase
        .from("homepage_content_drafts")
        .select("content")
        .eq("id", 1)
        .maybeSingle()).data?.content;

    if (!publishContent || !Object.keys(publishContent as Record<string, unknown>).length) {
      return NextResponse.json({ ok: false, message: "No draft content to publish" }, { status: 400 });
    }

    await snapshotPublished(supabase);
    const { data: updated, error: updateErr } = await supabase
      .from("homepage_content")
      .upsert({ id: 1, content: publishContent }, { onConflict: "id" })
      .select("updated_at")
      .maybeSingle();
    if (updateErr) throw updateErr;
    await clearDraft(supabase, updated?.updated_at || null);
    revalidatePath("/");

    return NextResponse.json({ ok: true, action: "publish", updatedAt: updated?.updated_at || null }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Homepage action failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = z.object({ content: contentSchema, publish: z.boolean().optional() }).safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });

  if (parsed.data.publish) {
    return POST(
      new Request(req.url, {
        method: "POST",
        headers: req.headers,
        body: JSON.stringify({ action: "publish", content: parsed.data.content }),
      }),
    );
  }

  return POST(
    new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify({ action: "save-draft", content: parsed.data.content }),
    }),
  );
}
