import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminJsonError, requireAdmin } from "@/utils/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

const schema = z.object({
  versionId: z.number().int().positive(),
  target: z.enum(["draft", "published"]).optional(),
});

export async function POST(req: Request, { params }: Props) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);
  const { id } = await params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });

  const { data: version, error: versionErr } = await gate.supabase
    .from("site_page_versions")
    .select("content")
    .eq("id", parsed.data.versionId)
    .eq("page_id", id)
    .maybeSingle();
  if (versionErr) return NextResponse.json({ ok: false, message: versionErr.message }, { status: 500 });
  if (!version?.content) return NextResponse.json({ ok: false, message: "Version not found" }, { status: 404 });

  const update: Record<string, unknown> = {
    draft_content: (version as any).content,
    updated_at: new Date().toISOString(),
  };
  if (parsed.data.target === "published") {
    update.published_content = (version as any).content;
    update.status = "published";
    update.published_at = new Date().toISOString();
  }

  const { data, error } = await gate.supabase
    .from("site_pages")
    .update(update)
    .eq("id", id)
    .select("id, slug, status")
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, message: "Page not found" }, { status: 404 });

  revalidatePath("/");
  revalidatePath(`/p/${(data as any).slug}`);
  return NextResponse.json({ ok: true, page: data }, { status: 200 });
}
