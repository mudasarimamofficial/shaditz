import { NextResponse } from "next/server";
import { z } from "zod";
import { adminJsonError, requireAdmin } from "@/utils/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pageSchema = z.object({
  title: z.string().min(1).max(180),
  slug: z.string().min(1).max(180),
  navLabel: z.string().max(180).nullable().optional(),
  showInHeaderNav: z.boolean().optional(),
  showInFooterNav: z.boolean().optional(),
  metaTitle: z.string().max(220).nullable().optional(),
  metaDescription: z.string().max(500).nullable().optional(),
  content: z.record(z.unknown()).optional(),
});

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);

  const { data, error } = await gate.supabase
    .from("site_pages")
    .select("id, slug, title, nav_label, show_in_header_nav, show_in_footer_nav, status, meta_title, meta_description, draft_content, published_content, published_at, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, pages: data || [] }, { status: 200 });
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

  const parsed = pageSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });

  const slug = normalizeSlug(parsed.data.slug);
  if (!slug) return NextResponse.json({ ok: false, message: "Invalid slug" }, { status: 400 });

  const content = parsed.data.content || {
    sections: [{ id: `rich_${Date.now()}`, type: "rich_text", enabled: true, settings: { title: parsed.data.title, content: "" } }],
  };

  const { data, error } = await gate.supabase
    .from("site_pages")
    .insert({
      title: parsed.data.title.trim(),
      slug,
      nav_label: parsed.data.navLabel || null,
      show_in_header_nav: Boolean(parsed.data.showInHeaderNav),
      show_in_footer_nav: Boolean(parsed.data.showInFooterNav),
      status: "draft",
      meta_title: parsed.data.metaTitle || null,
      meta_description: parsed.data.metaDescription || null,
      draft_content: content,
      published_content: content,
    })
    .select("id, slug")
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, page: data }, { status: 201 });
}

