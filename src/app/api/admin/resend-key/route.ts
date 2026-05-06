import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";
import { adminJsonError, requireAdmin } from "@/utils/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  apiKey: z.string().min(10).max(300),
});

function maskResendKey(key: string) {
  const k = key.trim();
  if (k.length <= 6) return "re_********";
  const suffix = k.slice(-4);
  return `re_************${suffix}`;
}

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) {
    return adminJsonError(gate);
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });
  }

  const apiKey = parsed.data.apiKey.trim();
  if (!apiKey.startsWith("re_")) {
    return NextResponse.json({ ok: false, message: "Invalid Resend API key" }, { status: 400 });
  }

  const masked = maskResendKey(apiKey);
  const supabase = createServiceSupabaseClient();

  await supabase.from("secret_settings").upsert({ id: 1, resend_api_key: apiKey, updated_at: new Date().toISOString() });
  await supabase.from("settings").update({ resend_api_key_masked: masked }).eq("id", 1);

  return NextResponse.json({ ok: true, masked }, { status: 200 });
}

