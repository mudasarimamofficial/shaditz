import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const env = (name: string) => process.env[name];
  const nonEmpty = (v: string | undefined) => Boolean(v && v.trim().length);
  const looksLikeSupabaseJwt = (v: string | undefined) =>
    Boolean(v && v.trim().startsWith("eyJ") && v.trim().split(".").length === 3);
  const jwtPayload = (v: string | undefined) => {
    if (!v) return null;
    const t = v.trim();
    const parts = t.split(".");
    if (parts.length !== 3) return null;
    try {
      const json = Buffer.from(parts[1].replaceAll("-", "+").replaceAll("_", "/"), "base64").toString(
        "utf8",
      );
      return JSON.parse(json) as { role?: unknown; iss?: unknown; ref?: unknown };
    } catch {
      return null;
    }
  };
  const jwtRole = (v: string | undefined) => {
    const p = jwtPayload(v);
    return typeof p?.role === "string" ? p.role : null;
  };
  const jwtIss = (v: string | undefined) => {
    const p = jwtPayload(v);
    return typeof p?.iss === "string" ? p.iss : null;
  };
  const jwtRef = (v: string | undefined) => {
    const p = jwtPayload(v);
    return typeof p?.ref === "string" ? p.ref : null;
  };
  const supabaseRefFromUrl = (u: string | undefined) => {
    if (!u) return null;
    try {
      const host = new URL(u).hostname;
      const part = host.split(".")[0];
      return part || null;
    } catch {
      return null;
    }
  };
  const supabaseRefFromIss = (iss: string | null) => {
    if (!iss) return null;
    try {
      const host = new URL(iss).hostname;
      const part = host.split(".")[0];
      return part || null;
    } catch {
      return null;
    }
  };
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const optional = [
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "ADMIN_NOTIFICATION_EMAIL",
  ];
  const missingRequired = required.filter((k) => {
    const v = env(k);
    if (k === "SUPABASE_SERVICE_ROLE_KEY") {
      if (!looksLikeSupabaseJwt(v)) return true;
      return jwtRole(v) !== "service_role";
    }
    return !nonEmpty(v);
  });
  const missingOptional = optional.filter((k) => !nonEmpty(env(k)));

  const urlRef = supabaseRefFromUrl(env("NEXT_PUBLIC_SUPABASE_URL"));
  const anonKeyRef =
    jwtRef(env("NEXT_PUBLIC_SUPABASE_ANON_KEY")) ||
    supabaseRefFromIss(jwtIss(env("NEXT_PUBLIC_SUPABASE_ANON_KEY")));
  const serviceRoleKeyRef =
    jwtRef(env("SUPABASE_SERVICE_ROLE_KEY")) ||
    supabaseRefFromIss(jwtIss(env("SUPABASE_SERVICE_ROLE_KEY")));

  return NextResponse.json(
    {
      ok: true,
      vercel: {
        VERCEL_ENV: env("VERCEL_ENV") ?? null,
        VERCEL_URL: env("VERCEL_URL") ?? null,
        VERCEL_REGION: env("VERCEL_REGION") ?? null,
        VERCEL_GIT_REPO_SLUG: env("VERCEL_GIT_REPO_SLUG") ?? null,
        VERCEL_GIT_COMMIT_REF: env("VERCEL_GIT_COMMIT_REF") ?? null,
        VERCEL_GIT_COMMIT_SHA: env("VERCEL_GIT_COMMIT_SHA") ?? null,
      },
      supabaseKeyRoles: {
        NEXT_PUBLIC_SUPABASE_ANON_KEY: jwtRole(env("NEXT_PUBLIC_SUPABASE_ANON_KEY")),
        SUPABASE_SERVICE_ROLE_KEY: jwtRole(env("SUPABASE_SERVICE_ROLE_KEY")),
      },
      supabaseKeyMatchesUrl: {
        NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(urlRef && anonKeyRef && urlRef === anonKeyRef),
        SUPABASE_SERVICE_ROLE_KEY: Boolean(urlRef && serviceRoleKeyRef && urlRef === serviceRoleKeyRef),
      },
      supabaseProjectRefs: {
        urlRef,
        anonKeyRef,
        serviceRoleKeyRef,
      },
      missingRequired,
      missingOptional,
    },
    { status: 200 },
  );
}
