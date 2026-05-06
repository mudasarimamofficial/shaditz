"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/utils/supabase/browserClient";
import type { Tab, Lead } from "@/components/admin/types";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminShell } from "@/components/admin/AdminShell";
import { LeadsPanel } from "@/components/admin/LeadsPanel";
import { CustomCodePanel } from "@/components/admin/CustomCodePanel";
import { HomepagePanel } from "@/components/admin/HomepagePanel";
import { VisualBuilderPanel } from "@/components/admin/VisualBuilderPanel";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { PagesPanel } from "@/components/admin/pages/PagesPanel";
import { MediaPanel } from "@/components/admin/MediaPanel";

const BOOTSTRAP_ADMIN_EMAIL = "mudasarimamofficial@gmail.com";

function normEmail(v: string | null | undefined) {
  return (v || "").trim().toLowerCase();
}

function isBootstrapAdmin(v: string | null | undefined) {
  // Bootstrap gating is intentionally explicit until profiles/RLS admin roles are provisioned.
  return normEmail(v) === BOOTSTRAP_ADMIN_EMAIL;
}

type Props = {
  initialTab?: Tab;
};

export function AdminPageClient({ initialTab = "builder" }: Props) {
  const router = useRouter();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<
    "loading" | "signedOut" | "signedInAdmin" | "signedInNonAdmin"
  >("loading");

  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<"all" | "today" | "last7">("all");

  async function resolveSessionEmail(client: SupabaseClient, maybeEmail: string | null) {
    if (maybeEmail && maybeEmail.trim().length) return maybeEmail;
    const { data } = await client.auth.getUser();
    return data.user?.email ?? null;
  }

  async function resolveAdminStatus(client: SupabaseClient, userId: string | null | undefined, userEmail: string | null) {
    if (!userId) return false;
    if (isBootstrapAdmin(userEmail)) return true;
    const { data } = await client.from("profiles").select("is_admin").eq("id", userId).maybeSingle();
    return Boolean((data as any)?.is_admin);
  }

  useEffect(() => {
    let alive = true;
    let subscription: { unsubscribe: () => void } | null = null;
    (async () => {
      const client = createBrowserSupabaseClient();
      if (!alive) return;

      if (!client) {
        setConfigError(
          "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
        );
        setAuthStatus("signedOut");
        return;
      }

      setSupabase(client);

      const { data } = await client.auth.getSession();
      if (!alive) return;
      const initialUser = data.session?.user ?? null;
      const initialEmail = await resolveSessionEmail(client, initialUser?.email ?? null);
      setSessionEmail(initialEmail);
      setSessionUserId(initialUser?.id ?? null);
      const initialIsAdmin = await resolveAdminStatus(client, initialUser?.id, initialEmail);
      if (!initialUser?.id) {
        setAuthStatus("signedOut");
      } else if (initialIsAdmin) {
        setAuthStatus("signedInAdmin");
      } else {
        setAuthStatus("signedInNonAdmin");
      }
      subscription = client.auth.onAuthStateChange(async (_evt, s) => {
        const nextUser = s?.user ?? null;
        const nextEmail = await resolveSessionEmail(client, nextUser?.email ?? null);
        const nextIsAdmin = await resolveAdminStatus(client, nextUser?.id, nextEmail);
        setSessionEmail(nextEmail);
        setSessionUserId(nextUser?.id ?? null);
        if (!nextUser?.id) {
          setAuthStatus("signedOut");
        } else if (nextIsAdmin) {
          setAuthStatus("signedInAdmin");
        } else {
          setAuthStatus("signedInNonAdmin");
        }
      }).data.subscription;
    })();

    return () => {
      alive = false;
      subscription?.unsubscribe();
    };
  }, []);

  const loadLeads = useCallback(async () => {
    if (!supabase) return;
    setLeadsError(null);
    setLeadsLoading(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select(
          "id, created_at, name, email, phone, business_type, revenue, message, status",
        )
        .order("created_at", { ascending: false });

      if (error) {
        setLeadsError(error.message);
        return;
      }
      const rows = (data || []) as Lead[];
      setLeads(rows);
      setSelectedId(rows[0]?.id || null);
    } finally {
      setLeadsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (authStatus !== "signedInAdmin") return;
    if (!sessionEmail || !sessionUserId) return;
    loadLeads();
  }, [sessionEmail, sessionUserId, authStatus, loadLeads]);

  useEffect(() => {
    if (authStatus !== "signedInAdmin") {
      setResendNotice(null);
      return;
    }
    if (!supabase) return;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token || "";
      if (!token) return;
      const res = await fetch("/api/admin/resend-sender", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = (await res.json()) as {
        ok: boolean;
        effectiveFrom?: string | null;
        status?: string;
        message?: string;
      };
      if (!json.ok) return;
      if (String(json.status || "") !== "verified") {
        const from = (json.effectiveFrom || "").trim();
        const msg = (json.message || "Resend sender is not verified").trim();
        setResendNotice(from ? `Sender: ${from}. ${msg}` : msg);
      } else {
        setResendNotice(null);
      }
    })();
  }, [authStatus, supabase]);

  if (authStatus === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-sm text-slate-500">Loading…</div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 dark:border-white/10 dark:bg-[#112121] dark:text-slate-200">
          {configError}
        </div>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-sm text-slate-500">Loading…</div>
      </div>
    );
  }

  if (authStatus === "signedOut") {
    return (
      <AdminLogin
        email={email}
        password={password}
        error={authError}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={async () => {
          setAuthError(null);
          const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (error) setAuthError(error.message);
        }}
      />
    );
  }

  if (authStatus === "signedInNonAdmin") {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 dark:border-white/10 dark:bg-[#112121] dark:text-slate-200">
          <div className="text-base font-bold">Access denied</div>
          <div className="mt-2 text-slate-600 dark:text-slate-400">
            This account is not allowed to access the admin panel.
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <div>Signed in as: {sessionEmail || "Unknown"}</div>
            <div>Allowed admin email: {BOOTSTRAP_ADMIN_EMAIL}</div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0fa3a3] px-4 text-sm font-bold text-white transition hover:bg-[#0e9696]"
              onClick={async () => {
                await supabase.auth.signOut();
                setAuthError(null);
                setEmail("");
                setPassword("");
              }}
            >
              Sign out
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
              onClick={() => router.replace("/")}
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminShell
      tab={tab}
      onTabChange={setTab}
      sessionEmail={sessionEmail || ""}
      topNotice={resendNotice}
      onSignOut={async () => {
        await supabase.auth.signOut();
        setLeads([]);
        setSelectedId(null);
        setQuery("");
      }}
    >
      {tab === "builder" ? (
        <VisualBuilderPanel
          supabase={supabase}
          onNavigateTab={setTab}
          onSignOut={async () => {
            await supabase.auth.signOut();
            setLeads([]);
            setSelectedId(null);
            setQuery("");
          }}
        />
      ) : tab === "pages" ? (
        <PagesPanel supabase={supabase} />
      ) : tab === "leads" ? (
        <LeadsPanel
          leads={leads}
          leadsLoading={leadsLoading}
          leadsError={leadsError}
          selectedId={selectedId}
          query={query}
          onQueryChange={setQuery}
          datePreset={datePreset}
          onDatePresetChange={setDatePreset}
          onSelect={setSelectedId}
          onRefresh={loadLeads}
          onUpdateStatus={async (id, status) => {
            const { error } = await supabase
              .from("leads")
              .update({ status })
              .eq("id", id);
            if (error) {
              setLeadsError(error.message);
              return;
            }
            setLeads((prev) =>
              prev.map((l) => (l.id === id ? { ...l, status } : l)),
            );
          }}
        />
      ) : tab === "media" ? (
        <MediaPanel supabase={supabase} />
      ) : tab === "homepage" ? (
        <HomepagePanel supabase={supabase} />
      ) : tab === "custom" ? (
        <CustomCodePanel supabase={supabase} />
      ) : (
        <SettingsPanel supabase={supabase} />
      )}
    </AdminShell>
  );
}

