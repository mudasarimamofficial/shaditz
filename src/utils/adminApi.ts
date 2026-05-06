import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

export const BOOTSTRAP_ADMIN_EMAIL = "mudasarimamofficial@gmail.com";

export type AdminGate =
  | { ok: true; user: User; supabase: ReturnType<typeof createServiceSupabaseClient> }
  | { ok: false; status: number; message: string };

function nonEmpty(v: string | null | undefined) {
  return v && v.trim().length ? v.trim() : null;
}

export function getBearerToken(req: Request) {
  const header = req.headers.get("authorization") || "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
}

export async function requireAdmin(req: Request): Promise<AdminGate> {
  const token = getBearerToken(req);
  if (!token) return { ok: false, status: 401, message: "Missing auth token" };

  if (!nonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL) || !nonEmpty(process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    return { ok: false, status: 503, message: "Server misconfigured" };
  }

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { ok: false, status: 401, message: "Invalid session" };

  const email = (data.user.email || "").trim().toLowerCase();
  if (email === BOOTSTRAP_ADMIN_EMAIL) return { ok: true, user: data.user, supabase };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .maybeSingle();

  if (Boolean((profile as any)?.is_admin)) return { ok: true, user: data.user, supabase };

  return { ok: false, status: 403, message: "Access denied" };
}

export function adminJsonError(gate: Exclude<AdminGate, { ok: true }>) {
  return NextResponse.json({ ok: false, message: gate.message }, { status: gate.status });
}

