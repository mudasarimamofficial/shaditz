import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminJsonError, requireAdmin } from "@/utils/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

const patchSchema = z.object({
  title: z.string().min(1).max(180).optional(),
  slug: z.string().min(1).max(180).optional(),
  navLabel: z.string().max(180).nullable().optional(),
  showInHeaderNav: z.boolean().optional(),
  showInFooterNav: z.boolean().optional(),
  status: z.enum(["draft", "published"]).optional(),
  metaTitle: z.string().max(220).nullable().optional(),
  metaDescription: z.string().max(500).nullable().optional(),
  draftContent: z.record(z.unknown()).optional(),
  publishedContent: z.record(z.unknown()).optional(),
});

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getPage(supabase: any, id: string) {
  return supabase
    .from("site_pages")
    .select("id, slug, title, nav_label, show_in_header_nav, show_in_footer_nav, status, meta_title, meta_description, draft_content, published_content, published_at, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
}

export async function GET(req: Request, { params }: Props) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);
  const { id } = await params;

  const { data, error } = await getPage(gate.supabase, id);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, message: "Page not found" }, { status: 404 });
  return NextResponse.json({ ok: true, page: data }, { status: 200 });
}

export async function PATCH(req: Request, { params }: Props) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);
  const { id } = await params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.title !== undefined) update.title = parsed.data.title.trim();
  if (parsed.data.slug !== undefined) {
    const slug = normalizeSlug(parsed.data.slug);
    if (!slug) return NextResponse.json({ ok: false, message: "Invalid slug" }, { status: 400 });
    update.slug = slug;
  }
  if (parsed.data.navLabel !== undefined) update.nav_label = parsed.data.navLabel || null;
  if (parsed.data.showInHeaderNav !== undefined) update.show_in_header_nav = parsed.data.showInHeaderNav;
  if (parsed.data.showInFooterNav !== undefined) update.show_in_footer_nav = parsed.data.showInFooterNav;
  if (parsed.data.status !== undefined) update.status = parsed.data.status;
  if (parsed.data.metaTitle !== undefined) update.meta_title = parsed.data.metaTitle || null;
  if (parsed.data.metaDescription !== undefined) update.meta_description = parsed.data.metaDescription || null;
  if (parsed.data.draftContent !== undefined) update.draft_content = parsed.data.draftContent;
  if (parsed.data.publishedContent !== undefined) update.published_content = parsed.data.publishedContent;

  const { data: current } = await getPage(gate.supabase, id);
  const { data, error } = await gate.supabase
    .from("site_pages")
    .update(update)
    .eq("id", id)
    .select("id, slug, status")
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, message: "Page not found" }, { status: 404 });

  revalidatePath("/");
  if (current?.slug) revalidatePath(`/p/${current.slug}`);
  if ((data as any).slug) revalidatePath(`/p/${(data as any).slug}`);

  return NextResponse.json({ ok: true, page: data }, { status: 200 });
}

export async function DELETE(req: Request, { params }: Props) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);
  const { id } = await params;

  const { data: current } = await getPage(gate.supabase, id);
  const { error } = await gate.supabase.from("site_pages").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  revalidatePath("/");
  if (current?.slug) revalidatePath(`/p/${current.slug}`);
  return NextResponse.json({ ok: true }, { status: 200 });
}
