import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { adminJsonError, requireAdmin } from "@/utils/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, { params }: Props) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);
  const { id } = await params;

  const { data: current, error: readErr } = await gate.supabase
    .from("site_pages")
    .select("slug, draft_content, published_content")
    .eq("id", id)
    .maybeSingle();
  if (readErr) return NextResponse.json({ ok: false, message: readErr.message }, { status: 500 });
  if (!current) return NextResponse.json({ ok: false, message: "Page not found" }, { status: 404 });

  await gate.supabase
    .from("site_page_versions")
    .insert({ page_id: id, content: (current as any).published_content, created_by: gate.user.id })
    .then(() => undefined);

  const now = new Date().toISOString();
  const { data, error } = await gate.supabase
    .from("site_pages")
    .update({
      status: "published",
      published_content: (current as any).draft_content,
      published_at: now,
      updated_at: now,
    })
    .eq("id", id)
    .select("id, slug, status, published_at")
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  revalidatePath("/");
  revalidatePath(`/p/${(current as any).slug}`);
  return NextResponse.json({ ok: true, page: data }, { status: 200 });
}
