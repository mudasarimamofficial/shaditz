import { NextResponse } from "next/server";
import { z } from "zod";
import { adminJsonError, requireAdmin } from "@/utils/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  let query = gate.supabase
    .from("leads")
    .select("id, created_at, name, email, phone, business_type, revenue, message, status")
    .order("created_at", { ascending: false })
    .limit(500);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, leads: data || [] }, { status: 200 });
}

const deleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
});

export async function DELETE(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = deleteSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });

  const { data, error } = await gate.supabase
    .from("leads")
    .delete()
    .in("id", parsed.data.ids)
    .select("id");
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, removed: (data || []).map((r) => r.id) }, { status: 200 });
}

