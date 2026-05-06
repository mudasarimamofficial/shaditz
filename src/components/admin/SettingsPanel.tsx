import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import { validateSenderEmailBasic } from "@/utils/resendSender";
import { requestAdminRevalidate } from "@/utils/adminRevalidate";
import { mergeTypographyScale, TYPOGRAPHY_TIERS, TYPOGRAPHY_TOKENS } from "@/utils/typographyScale";

type Props = {
  supabase: SupabaseClient;
};

const defaultTheme =
  homepageDefaults.site.theme ??
  ({
    colors: {
      primary: "#C9982A",
      secondary: "#0F1629",
      accent: "#E8B84B",
      background: "#0A0F1E",
      text: "#FFFFFF",
      surface: "#141D35",
      border: "rgba(255,255,255,0.07)",
    },
    typography: {
      headingFont: "",
      bodyFont: "",
    },
  } as NonNullable<HomepageContent["site"]["theme"]>);

const mergeScale = (base: any, extra: any) => {
  return mergeTypographyScale(extra, mergeTypographyScale(base || (defaultTheme as any)?.typography?.scale));
};

const mergeTheme = (base: any, extra: any) => {
  const b = base || defaultTheme;
  const e = extra || {};
  return {
    ...b,
    ...e,
    colors: { ...(b?.colors || {}), ...(e.colors || {}) },
    typography: {
      ...(b?.typography || {}),
      ...(e.typography || {}),
      scale: mergeScale(b?.typography?.scale, e.typography?.scale),
    },
  };
};

export function SettingsPanel({ supabase }: Props) {
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSaved, setSettingsSaved] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [resendMasked, setResendMasked] = useState("");
  const [resendKeyDraft, setResendKeyDraft] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderStatus, setSenderStatus] = useState<string | null>(null);
  const [senderMessage, setSenderMessage] = useState<string | null>(null);
  const [senderEffective, setSenderEffective] = useState<string | null>(null);
  const [theme, setTheme] = useState<HomepageContent["site"]["theme"]>(defaultTheme);
  const [designPreset, setDesignPreset] = useState<"landing_html_v1" | "classic">("landing_html_v1");

  const loadSettings = useCallback(async () => {
    setSettingsSaved(null);
    setSettingsError(null);
    setSettingsLoading(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .select(
          "id, admin_email, resend_api_key_masked, resend_from_email, resend_sender_status, resend_sender_message",
        )
        .eq("id", 1)
        .single();

      if (error) {
        setSettingsError(error.message);
        return;
      }

      setAdminEmail((data as { admin_email: string }).admin_email);
      setResendMasked(String((data as any).resend_api_key_masked || ""));
      setSenderEmail(String((data as any).resend_from_email || ""));
      setSenderStatus(String((data as any).resend_sender_status || ""));
      setSenderMessage(String((data as any).resend_sender_message || ""));

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || "";
      if (token) {
        const res = await fetch("/api/admin/resend-sender", {
          headers: { authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as any;
        if (res.ok && json?.ok) {
          setSenderEffective(String(json.effectiveFrom || "") || null);
          setSenderStatus(String(json.status || "") || null);
          setSenderMessage(String(json.message || "") || null);
        }
      }

      const { data: home, error: homeErr } = await supabase
        .from("homepage_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();
      if (!homeErr && home?.content) {
        const c = home.content as HomepageContent;
        setTheme(mergeTheme(defaultTheme, c.site?.theme));
        setDesignPreset(((c.site as any)?.designPreset as any) === "classic" ? "classic" : "landing_html_v1");
      }
    } finally {
      setSettingsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 pb-10 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-white/60">
          Lead notifications will be sent to this email.
        </p>
      </div>

      {settingsError ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {settingsError}
        </div>
      ) : null}

      {settingsSaved ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {settingsSaved}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4">
          <Input
            label="Admin notification email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="admin@yourdomain.com"
          />

          <Input
            label="Resend API key"
            value={resendKeyDraft}
            onChange={(e) => setResendKeyDraft(e.target.value)}
            placeholder={resendMasked ? resendMasked : "re_********"}
            type="password"
            autoComplete="off"
          />
          <div className="text-xs text-white/60">
            {resendMasked ? `Saved: ${resendMasked}` : "No Resend key saved yet."}
          </div>
          <Button
            variant="secondary"
            className="h-12"
            disabled={settingsLoading || !resendKeyDraft.trim().length}
            onClick={async () => {
              setSettingsSaved(null);
              setSettingsError(null);
              setSettingsLoading(true);
              try {
                const { data: sessionData } = await supabase.auth.getSession();
                const token = sessionData.session?.access_token || "";
                if (!token) {
                  setSettingsError("You must be signed in as admin.");
                  return;
                }

                const res = await fetch("/api/admin/resend-key", {
                  method: "POST",
                  headers: {
                    "content-type": "application/json",
                    authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ apiKey: resendKeyDraft.trim() }),
                });
                const json = (await res.json()) as { ok: boolean; message?: string; masked?: string };
                if (!res.ok || !json.ok) {
                  setSettingsError(json.message || "Failed to update Resend key");
                  return;
                }
                setResendMasked(json.masked || resendMasked);
                setResendKeyDraft("");
                setSettingsSaved("Resend key updated.");
              } finally {
                setSettingsLoading(false);
              }
            }}
          >
            Update Resend Key
          </Button>

          <div className="mt-2 text-sm font-bold">Resend Sender</div>
          <Input
            label="Sender email (must be a verified Resend domain)"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="notifications@yourdomain.com"
          />
          {(() => {
            const v = validateSenderEmailBasic(senderEmail || senderEffective || "");
            const status = String(senderStatus || "").toLowerCase();
            if (!senderEmail.trim().length && !senderEffective) return null;
            if (!v.ok) {
              return (
                <div className="rounded-lg border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  {v.message}
                </div>
              );
            }
            if (status && status !== "verified") {
              return (
                <div className="rounded-lg border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  {senderMessage || "Sender domain is not verified in Resend."}
                </div>
              );
            }
            if (status === "verified") {
              return (
                <div className="rounded-lg border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  Verified sender: {senderEffective || senderEmail}
                </div>
              );
            }
            return null;
          })()}
          <Button
            variant="secondary"
            className="h-12"
            disabled={settingsLoading || !senderEmail.trim().length}
            onClick={async () => {
              setSettingsSaved(null);
              setSettingsError(null);
              setSettingsLoading(true);
              try {
                const { data: sessionData } = await supabase.auth.getSession();
                const token = sessionData.session?.access_token || "";
                if (!token) {
                  setSettingsError("You must be signed in as admin.");
                  return;
                }
                const res = await fetch("/api/admin/resend-sender", {
                  method: "POST",
                  headers: {
                    "content-type": "application/json",
                    authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ senderEmail: senderEmail.trim() }),
                });
                const json = (await res.json()) as any;
                if (!res.ok || !json?.ok) {
                  setSettingsError(json?.message || "Failed to update sender");
                  return;
                }
                setSenderEffective(String(json.senderEmail || "") || null);
                setSenderStatus(String(json.status || "") || null);
                setSenderMessage(String(json.message || "") || null);
                setSettingsSaved("Sender saved and validated.");
              } finally {
                setSettingsLoading(false);
              }
            }}
          >
            Save & Validate Sender
          </Button>

          <div className="mt-2 text-sm font-bold">Global Theme</div>
          <Select
            label="Design preset"
            value={designPreset}
            onChange={(e) => setDesignPreset("landing_html_v1")}
            options={[
              { value: "landing_html_v1", label: "Landing (HTML v1)" }
            ]}
          />
          <Select
            label="Use custom theme"
            value={theme?.enabled ? "yes" : "no"}
            onChange={(e) => setTheme((t) => ({ ...(t || defaultTheme), enabled: e.target.value === "yes" }))}
            options={[
              { value: "no", label: "No (Recommended)" },
              { value: "yes", label: "Yes" },
            ]}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Primary"
              value={theme?.colors.primary || ""}
              onChange={(e) =>
                setTheme((t) => ({
                  ...(t || defaultTheme),
                  colors: { ...(t?.colors || defaultTheme.colors), primary: e.target.value },
                }))
              }
              placeholder="#0fa3a3"
            />
            <Input
              label="Accent"
              value={theme?.colors.accent || ""}
              onChange={(e) =>
                setTheme((t) => ({
                  ...(t || defaultTheme),
                  colors: { ...(t?.colors || defaultTheme.colors), accent: e.target.value },
                }))
              }
              placeholder="#b58a2f"
            />
            <Input
              label="Background"
              value={theme?.colors.background || ""}
              onChange={(e) =>
                setTheme((t) => ({
                  ...(t || defaultTheme),
                  colors: { ...(t?.colors || defaultTheme.colors), background: e.target.value },
                }))
              }
              placeholder="#f6f8f8"
            />
            <Input
              label="Surface"
              value={theme?.colors.surface || ""}
              onChange={(e) =>
                setTheme((t) => ({
                  ...(t || defaultTheme),
                  colors: { ...(t?.colors || defaultTheme.colors), surface: e.target.value },
                }))
              }
              placeholder="#ffffff"
            />
            <Input
              label="Text"
              value={theme?.colors.text || ""}
              onChange={(e) =>
                setTheme((t) => ({
                  ...(t || defaultTheme),
                  colors: { ...(t?.colors || defaultTheme.colors), text: e.target.value },
                }))
              }
              placeholder="#0f172a"
            />
            <Input
              label="Border"
              value={theme?.colors.border || ""}
              onChange={(e) =>
                setTheme((t) => ({
                  ...(t || defaultTheme),
                  colors: { ...(t?.colors || defaultTheme.colors), border: e.target.value },
                }))
              }
              placeholder="rgba(148, 163, 184, 0.35)"
            />
            <Input
              label="Heading font"
              value={theme?.typography?.headingFont || ""}
              onChange={(e) =>
                setTheme((t) => ({
                  ...(t || defaultTheme),
                  typography: { ...(t?.typography || {}), headingFont: e.target.value },
                }))
              }
              placeholder="e.g. Inter, system-ui"
            />
            <Input
              label="Body font"
              value={theme?.typography?.bodyFont || ""}
              onChange={(e) =>
                setTheme((t) => ({
                  ...(t || defaultTheme),
                  typography: { ...(t?.typography || {}), bodyFont: e.target.value },
                }))
              }
              placeholder="e.g. Inter, system-ui"
            />
          </div>

          <div className="mt-2 text-sm font-bold">Typography Scale</div>
          {TYPOGRAPHY_TIERS.map((tier) => {
            const scale = mergeTypographyScale((theme as any)?.typography?.scale || (defaultTheme as any)?.typography?.scale);
            const tierScale = scale[tier.key];
            const setTierValue = (token: string, value: string) => {
              setTheme((t) => {
                const next = mergeTheme(defaultTheme, t);
                const nextScale = mergeTypographyScale((next as any).typography.scale);
                return {
                  ...next,
                  typography: {
                    ...(next as any).typography,
                    scale: {
                      ...nextScale,
                      [tier.key]: {
                        ...(nextScale as any)[tier.key],
                        [token]: value,
                      },
                    },
                  },
                };
              });
            };

            return (
              <div key={tier.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-white/80">{tier.label}</div>
                  {tier.minWidth ? <div className="text-xs font-semibold text-white/40">{tier.minWidth}px+</div> : null}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {TYPOGRAPHY_TOKENS.map((token) => (
                    <Input
                      key={token.key}
                      label={token.label}
                      value={String(tierScale[token.key] || "")}
                      onChange={(e) => setTierValue(token.key, e.target.value)}
                      placeholder="16px"
                    />
                  ))}
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-3">
            <Button
              className="h-12"
              disabled={settingsLoading}
              onClick={async () => {
                setSettingsSaved(null);
                setSettingsError(null);
                setSettingsLoading(true);
                try {
                  const next = adminEmail.trim();
                  if (!next || !next.includes("@")) {
                    setSettingsError("Enter a valid email");
                    return;
                  }
                  const { error } = await supabase
                    .from("settings")
                    .update({
                      admin_email: next,
                    })
                    .eq("id", 1);
                  if (error) {
                    setSettingsError(error.message);
                    return;
                  }

                  const { data: home, error: homeErr } = await supabase
                    .from("homepage_content")
                    .select("content")
                    .eq("id", 1)
                    .single();
                  if (homeErr) {
                    setSettingsError(homeErr.message);
                    return;
                  }
                  const current = home.content as HomepageContent;
                  const themeWithDefaults = mergeTheme(defaultTheme, theme || defaultTheme);
                  const currentBranding = (current.branding || homepageDefaults.branding || { colors: themeWithDefaults.colors }) as any;
                  const mergedBrandingColors = {
                    ...(homepageDefaults.branding?.colors || {}),
                    ...(currentBranding.colors || {}),
                    ...(themeWithDefaults.colors || {}),
                  };
                  const updated: HomepageContent = {
                    ...current,
                    site: {
                      ...current.site,
                      designPreset,
                      theme: themeWithDefaults,
                    },
                    branding: {
                      ...currentBranding,
                      enabled: Boolean(themeWithDefaults?.enabled),
                      colors: mergedBrandingColors,
                      typography: {
                        ...(currentBranding.typography || {}),
                        headingFont: themeWithDefaults?.typography?.headingFont || "",
                        bodyFont: themeWithDefaults?.typography?.bodyFont || "",
                        scale: (themeWithDefaults as any)?.typography?.scale,
                      },
                    },
                  };
                  const { error: updateHomeErr } = await supabase
                    .from("homepage_content")
                    .update({ content: updated })
                    .eq("id", 1);
                  if (updateHomeErr) {
                    setSettingsError(updateHomeErr.message);
                    return;
                  }
                  await requestAdminRevalidate(supabase, ["/"]);
                  setSettingsSaved("Saved");
                } finally {
                  setSettingsLoading(false);
                }
              }}
            >
              Save
            </Button>
            <Button
              variant="secondary"
              className="h-12"
              onClick={loadSettings}
              disabled={settingsLoading}
            >
              Reload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
