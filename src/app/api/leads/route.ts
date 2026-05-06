import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";
import { checkRateLimit, getRequestIp } from "@/utils/rateLimit";
import { checkResendDomainVerification, validateSenderEmailBasic } from "@/utils/resendSender";

export const runtime = "nodejs";

const legacySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30).nullable().optional(),
  business_type: z.string().max(120).nullable().optional(),
  revenue: z.string().max(120).nullable().optional(),
  message: z.string().max(4000).nullable().optional(),
  company: z.string().nullable().optional(),
});

const htmlSchema = z.object({
  first_name: z.string().min(1).max(120),
  last_name: z.string().min(1).max(120),
  email: z.string().email().max(240),
  revenue: z.string().max(120).nullable().optional(),
  message: z.string().max(4000).nullable().optional(),
  company: z.string().nullable().optional(),
});

const schema = z.union([legacySchema, htmlSchema]);

export const dynamic = "force-dynamic";

function escapeHtml(v: string) {
  return v
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function fmt(v: string | null | undefined) {
  return v && v.trim().length ? escapeHtml(v.trim()) : "—";
}

function nonEmpty(v: string | null | undefined) {
  return v && v.trim().length ? v.trim() : null;
}

function looksLikeSupabaseJwt(v: string) {
  const s = v.trim();
  return s.startsWith("eyJ") && s.split(".").length === 3;
}

function jwtPayload(v: string) {
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
}

function jwtRole(v: string) {
  const p = jwtPayload(v);
  return typeof p?.role === "string" ? p.role : null;
}

function jwtIss(v: string) {
  const p = jwtPayload(v);
  return typeof p?.iss === "string" ? p.iss : null;
}

function jwtRef(v: string) {
  const p = jwtPayload(v);
  return typeof p?.ref === "string" ? p.ref : null;
}

function supabaseRefFromUrl(u: string | null) {
  if (!u) return null;
  try {
    const host = new URL(u).hostname;
    const part = host.split(".")[0];
    return part || null;
  } catch {
    return null;
  }
}

function supabaseRefFromIss(iss: string | null) {
  if (!iss) return null;
  try {
    const host = new URL(iss).hostname;
    const part = host.split(".")[0];
    return part || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const env = (name: string) => process.env[name];
    const ip = getRequestIp(req);
    const rl = checkRateLimit(`lead:${ip}`, 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, message: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "Invalid JSON body" },
        { status: 400 },
      );
    }
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid form submission" },
        { status: 400 },
      );
    }

    const sanitized =
      "name" in parsed.data
        ? {
            name: parsed.data.name.trim(),
            email: parsed.data.email.trim(),
            phone: parsed.data.phone?.trim() || null,
            business_type: parsed.data.business_type?.trim() || null,
            revenue: parsed.data.revenue?.trim() || null,
            message: parsed.data.message?.trim() || null,
            company: parsed.data.company?.trim() || null,
          }
        : {
            name: `${parsed.data.first_name.trim()} ${parsed.data.last_name.trim()}`.trim(),
            email: parsed.data.email.trim(),
            phone: null,
            business_type: null,
            revenue: parsed.data.revenue?.trim() || null,
            message: parsed.data.message?.trim() || null,
            company: parsed.data.company?.trim() || null,
          };

    if (!sanitized.name || !sanitized.email) {
      return NextResponse.json(
        { ok: false, message: "Invalid form submission" },
        { status: 400 },
      );
    }

    if (sanitized.company && sanitized.company.length > 0) {
      return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
    }

    const requiredEnvMissing: string[] = [];
    const supabaseUrl = nonEmpty(env("NEXT_PUBLIC_SUPABASE_URL"));
    const serviceRoleKey = nonEmpty(env("SUPABASE_SERVICE_ROLE_KEY"));

    if (!supabaseUrl) {
      requiredEnvMissing.push("NEXT_PUBLIC_SUPABASE_URL");
    }
    const serviceRole = serviceRoleKey ? jwtRole(serviceRoleKey) : null;
    if (!serviceRoleKey || !looksLikeSupabaseJwt(serviceRoleKey) || serviceRole !== "service_role") {
      requiredEnvMissing.push("SUPABASE_SERVICE_ROLE_KEY");
    }
    const urlRef = supabaseRefFromUrl(supabaseUrl);
    const svcRef =
      serviceRoleKey ? (jwtRef(serviceRoleKey) || supabaseRefFromIss(jwtIss(serviceRoleKey))) : null;
    const serviceRoleMatchesUrl = Boolean(urlRef && svcRef && urlRef === svcRef);
    if (requiredEnvMissing.length) {
      return NextResponse.json(
        {
          ok: false,
          message: "Server misconfigured",
          missing: requiredEnvMissing,
          supabaseKeyRole: serviceRole,
          supabaseKeyMatchesUrl: serviceRoleMatchesUrl,
        },
        { status: 503 },
      );
    }

    const supabase = createServiceSupabaseClient();
    let emailStatus: "sent" | "skipped" = "skipped";
    let emailSkipReason: string | null = null;
    let slackSkipReason: string | null = null;

    const { data: lead, error: insertError, status: insertStatus } = await supabase
      .from("leads")
      .insert({
        name: sanitized.name,
        email: sanitized.email,
        phone: sanitized.phone,
        business_type: sanitized.business_type,
        revenue: sanitized.revenue,
        message: sanitized.message,
      })
      .select("id, created_at")
      .single();

    if (insertError || !lead) {
      const msg = (insertError?.message || "").toLowerCase();
      if (msg.includes("null value") && msg.includes("phone")) {
        return NextResponse.json(
          {
            ok: false,
            message: "Database schema mismatch",
            detail: "leads.phone is NOT NULL in your database but the form has no phone field.",
            action: "Run: alter table public.leads alter column phone drop not null;",
          },
          { status: 409 },
        );
      }
      if (insertStatus === 401 || insertStatus === 403) {
        return NextResponse.json(
          {
            ok: false,
            message: "Server misconfigured",
            missing: ["SUPABASE_SERVICE_ROLE_KEY"],
            supabaseKeyRole: serviceRole,
            supabaseKeyMatchesUrl: serviceRoleMatchesUrl,
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          ok: false,
          message: "Failed to save lead",
          status: insertStatus || 500,
        },
        { status: 500 },
      );
    }

    const { data: settings } = await supabase
      .from("settings")
      .select("admin_email, resend_from_email")
      .eq("id", 1)
      .maybeSingle();

    const { data: secretSettings } = await supabase
      .from("secret_settings")
      .select("resend_api_key")
      .eq("id", 1)
      .maybeSingle();

    const toEmail =
      nonEmpty(settings?.admin_email) || nonEmpty(env("ADMIN_NOTIFICATION_EMAIL"));
    const resendKey = nonEmpty((secretSettings as any)?.resend_api_key) || nonEmpty(env("RESEND_API_KEY"));
    const configuredFromEmail = nonEmpty((settings as any)?.resend_from_email);
    const envFromEmail = nonEmpty(env("RESEND_FROM_EMAIL"));
    const candidateFromEmail = configuredFromEmail || envFromEmail;
    const senderBasic = validateSenderEmailBasic(candidateFromEmail || "");
    const senderDomainStatus =
      resendKey && senderBasic.ok && senderBasic.domain
        ? await checkResendDomainVerification(resendKey, senderBasic.domain)
        : null;
    const canSendFrom =
      Boolean(candidateFromEmail) &&
      senderBasic.ok &&
      (senderDomainStatus?.status ? senderDomainStatus.status === "verified" : Boolean(resendKey));

    if (toEmail && resendKey && canSendFrom && candidateFromEmail) {
      try {
        const resend = new Resend(resendKey);
        const subject = `New Lead Alert — ${sanitized.name}`;
        const html = `
          <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
            <h2 style="margin:0 0 12px">New Lead Alert</h2>
            <p style="margin:0 0 12px">A new lead was submitted on Shaditz.</p>
            <table style="border-collapse:collapse;width:100%;max-width:640px">
              <tr><td style="padding:8px 0;color:#64748b">Name</td><td style="padding:8px 0">${fmt(sanitized.name)}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Email</td><td style="padding:8px 0">${fmt(sanitized.email)}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Phone</td><td style="padding:8px 0">${fmt(sanitized.phone)}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Business Type</td><td style="padding:8px 0">${fmt(sanitized.business_type)}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Monthly Revenue</td><td style="padding:8px 0">${fmt(sanitized.revenue)}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Message</td><td style="padding:8px 0">${fmt(sanitized.message)}</td></tr>
            </table>
            <p style="margin:16px 0 0;color:#64748b;font-size:12px">Lead ID: ${escapeHtml(lead.id)}</p>
          </div>
        `;

        await resend.emails.send({
          from: candidateFromEmail,
          to: toEmail,
          subject,
          html,
        });
        emailStatus = "sent";
      } catch (e) {
        console.error("Failed to send lead email notification", e);
        emailSkipReason = "send_failed";
      }
    } else {
      if (!toEmail) {
        emailSkipReason = "missing_to_email";
      } else if (!resendKey) {
        emailSkipReason = "resend_not_configured";
      } else if (!candidateFromEmail) {
        emailSkipReason = "missing_from_email";
      } else if (!senderBasic.ok) {
        emailSkipReason = "invalid_sender_email";
      } else if (senderDomainStatus && senderDomainStatus.status !== "verified") {
        emailSkipReason = "sender_domain_not_verified";
      } else {
        emailSkipReason = "resend_not_configured";
      }
    }

    slackSkipReason = "disabled";

    return NextResponse.json(
      {
        ok: true,
        leadId: lead.id,
        email: { status: emailStatus, reason: emailSkipReason },
        slackSkipped: true,
        slack: { status: "skipped", reason: slackSkipReason },
        config: {
          notificationsToEmail: Boolean(toEmail),
          resendConfigured: Boolean(resendKey && candidateFromEmail),
        },
      },
      { status: 200 },
    );
  } catch (e) {
    if (e instanceof Error && e.message.includes("Missing NEXT_PUBLIC_SUPABASE_URL")) {
      return NextResponse.json(
        {
          ok: false,
          message: "Server misconfigured",
          missing: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
        },
        { status: 503 },
      );
    }
    console.error("Lead API unexpected error", e);
    return NextResponse.json(
      { ok: false, message: "Unexpected error" },
      { status: 500 },
    );
  }
}

