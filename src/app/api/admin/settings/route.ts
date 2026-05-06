import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminJsonError, requireAdmin } from "@/utils/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  adminEmail: z.string().email().optional(),
  resendFromEmail: z.string().email().nullable().optional(),
  homepageContent: z.record(z.unknown()).optional(),
});

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);

  const { data: settings, error } = await gate.supabase
    .from("settings")
    .select("id, admin_email, resend_api_key_masked, resend_from_email, resend_sender_status, resend_sender_message, resend_sender_checked_at")
    .eq("id", 1)
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  const { data: homepage } = await gate.supabase
    .from("homepage_content")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  return NextResponse.json({ ok: true, settings, homepageContent: homepage?.content || null }, { status: 200 });
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

  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });

  if (parsed.data.adminEmail !== undefined || parsed.data.resendFromEmail !== undefined) {
    const update: Record<string, unknown> = {};
    if (parsed.data.adminEmail !== undefined) update.admin_email = parsed.data.adminEmail;
    if (parsed.data.resendFromEmail !== undefined) update.resend_from_email = parsed.data.resendFromEmail;
    const { error } = await gate.supabase.from("settings").update(update).eq("id", 1);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  if (parsed.data.homepageContent !== undefined) {
    const { error } = await gate.supabase
      .from("homepage_content")
      .update({ content: parsed.data.homepageContent })
      .eq("id", 1);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    revalidatePath("/");
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

