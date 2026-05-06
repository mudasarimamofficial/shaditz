export type ResendSenderStatus = "verified" | "pending" | "failed" | "unknown";

const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
]);

export function parseEmailDomain(email: string | null | undefined) {
  const v = String(email || "").trim();
  const at = v.lastIndexOf("@");
  if (at <= 0 || at === v.length - 1) return null;
  const domain = v.slice(at + 1).trim().toLowerCase();
  if (!domain || domain.includes(" ")) return null;
  return domain;
}

export function looksLikePublicSenderDomain(domain: string) {
  return PUBLIC_EMAIL_DOMAINS.has(domain.toLowerCase());
}

export function validateSenderEmailBasic(email: string | null | undefined): {
  ok: boolean;
  domain: string | null;
  message: string;
} {
  const v = String(email || "").trim();
  const domain = parseEmailDomain(v);
  if (!v.length || !domain) {
    return { ok: false, domain: null, message: "Sender email is missing or invalid." };
  }
  if (looksLikePublicSenderDomain(domain)) {
    return {
      ok: false,
      domain,
      message: `Sender domain '${domain}' is a public email provider. Use a verified custom domain in Resend.`,
    };
  }
  return { ok: true, domain, message: "ok" };
}

export async function checkResendDomainVerification(resendApiKey: string, domain: string): Promise<{
  status: ResendSenderStatus;
  message: string;
}> {
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: {
        authorization: `Bearer ${resendApiKey}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return { status: "unknown", message: "Unable to check sender domain with Resend." };
    }
    const json = (await res.json()) as {
      data?: Array<{ name?: unknown; status?: unknown }>;
    };
    const list = Array.isArray(json.data) ? json.data : [];
    const found = list.find((d) => String(d.name || "").toLowerCase() === domain.toLowerCase());
    if (!found) {
      return {
        status: "failed",
        message: `Domain '${domain}' is not present in your Resend account. Add and verify it first.`,
      };
    }
    const s = String(found.status || "").toLowerCase();
    if (s === "verified") return { status: "verified", message: "Verified" };
    if (s === "pending") return { status: "pending", message: `Domain '${domain}' is pending verification.` };
    return { status: "failed", message: `Domain '${domain}' is not verified in Resend (status: ${s || "unknown"}).` };
  } catch {
    return { status: "unknown", message: "Unable to check sender domain with Resend." };
  }
}

