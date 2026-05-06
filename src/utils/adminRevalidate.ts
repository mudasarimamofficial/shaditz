import type { SupabaseClient } from "@supabase/supabase-js";

export async function requestAdminRevalidate(supabase: SupabaseClient, paths: string[]) {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token || "";
    if (!token) return { ok: false, reason: "missing_session" as const };

    const res = await fetch("/api/admin/revalidate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paths }),
    });

    if (!res.ok) return { ok: false, reason: "request_failed" as const };
    return { ok: true as const };
  } catch {
    return { ok: false, reason: "request_failed" as const };
  }
}
