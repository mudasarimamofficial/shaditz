import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Code2, FileJson, Files, ImageIcon, LayoutDashboard, MoreHorizontal, PanelLeft, Settings, Users, X } from "lucide-react";
import type { Tab } from "@/components/admin/types";
import Image from "next/image";

type Props = {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  sessionEmail: string;
  onSignOut: () => Promise<void>;
  topNotice?: ReactNode;
  children: ReactNode;
};

export function AdminShell({ tab, onTabChange, sessionEmail, onSignOut, topNotice, children }: Props) {
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const navItems: { tab: Tab; label: string; icon: ReactNode }[] = [
    { tab: "builder", label: "Builder", icon: <LayoutDashboard size={18} /> },
    { tab: "pages", label: "Pages", icon: <Files size={18} /> },
    { tab: "leads", label: "Leads", icon: <Users size={18} /> },
    { tab: "media", label: "Media", icon: <ImageIcon size={18} /> },
    { tab: "homepage", label: "JSON", icon: <FileJson size={18} /> },
    { tab: "custom", label: "Custom", icon: <Code2 size={18} /> },
    { tab: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  const tabLabel = navItems.find((n) => n.tab === tab)?.label || "Admin";

  const shouldShowNotice = useMemo(() => {
    if (!topNotice) return false;
    if (noticeDismissed) return false;
    return true;
  }, [topNotice, noticeDismissed]);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem("cf_admin_notice_dismissed") === "1";
      setNoticeDismissed(dismissed);
    } catch {
      setNoticeDismissed(false);
    }
  }, []);

  useEffect(() => {
    const mqNarrow = window.matchMedia("(max-width: 1024px)");
    const mqMobile = window.matchMedia("(max-width: 1024px)");
    const update = () => {
      setIsNarrow(Boolean(mqNarrow.matches));
      setIsMobile(Boolean(mqMobile.matches));
    };
    update();
    const add = (mq: MediaQueryList, cb: () => void) => {
      const anyMq = mq as unknown as {
        addEventListener?: (type: "change", listener: () => void) => void;
        addListener?: (listener: () => void) => void;
      };
      if (anyMq.addEventListener) anyMq.addEventListener("change", cb);
      else if (anyMq.addListener) anyMq.addListener(cb);
    };
    const remove = (mq: MediaQueryList, cb: () => void) => {
      const anyMq = mq as unknown as {
        removeEventListener?: (type: "change", listener: () => void) => void;
        removeListener?: (listener: () => void) => void;
      };
      if (anyMq.removeEventListener) anyMq.removeEventListener("change", cb);
      else if (anyMq.removeListener) anyMq.removeListener(cb);
    };

    add(mqNarrow, update);
    add(mqMobile, update);
    window.addEventListener("resize", update);
    return () => {
      remove(mqNarrow, update);
      remove(mqMobile, update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (isNarrow) setSidebarCollapsed(true);
  }, [isNarrow]);

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
      setMobileMoreOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="cf-admin flex h-[100dvh] overflow-hidden bg-[var(--cf-bg)] text-[var(--cf-text)]">
      {!isMobile ? (
        <aside
          className={
            sidebarCollapsed
              ? "flex w-[72px] flex-col border-r border-white/10 bg-[var(--cf-secondary)] px-2 py-4"
              : "flex w-[248px] flex-col border-r border-white/10 bg-[var(--cf-secondary)] px-3 py-5"
          }
        >
          <div className={sidebarCollapsed ? "mb-4 flex items-center justify-center" : "mb-5 flex items-center gap-2 px-2"}>
            <Image
              src="/favicon.png"
              alt="Shaditz"
              className={sidebarCollapsed ? "h-8 w-8 rounded-xl" : "h-7 w-7 rounded-xl"}
              width={32}
              height={32}
              unoptimized
            />
            {!sidebarCollapsed ? (
              <div className="text-sm font-bold">
                Shaditz <span className="text-[var(--cf-accent)]">AI</span>
              </div>
            ) : null}
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((i) => (
              <button
                key={i.tab}
                type="button"
                onClick={() => onTabChange(i.tab)}
                title={sidebarCollapsed ? i.label : undefined}
                className={
                  tab === i.tab
                    ? sidebarCollapsed
                      ? "flex items-center justify-center rounded-2xl bg-white/10 p-3 text-white"
                      : "flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2.5 text-left text-sm font-semibold text-white"
                    : sidebarCollapsed
                      ? "flex items-center justify-center rounded-2xl p-3 text-white/70 hover:bg-white/5 hover:text-white"
                      : "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"
                }
              >
                <span className={sidebarCollapsed ? "inline-flex" : "inline-flex w-6 justify-center"}>{i.icon}</span>
                {!sidebarCollapsed ? i.label : null}
              </button>
            ))}
          </nav>

          {!sidebarCollapsed ? (
            <div className="mt-auto px-2 pt-4">
              <div className="mb-2 text-xs text-white/50">Signed in as</div>
              <div className="truncate text-xs font-semibold text-white/80">{sessionEmail}</div>
            </div>
          ) : null}
        </aside>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col">
        {tab !== "builder" ? (
          <div className="flex items-center justify-between border-b border-white/10 bg-[var(--cf-secondary)] px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              {!isMobile ? (
                <button
                  type="button"
                  className="-ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/90"
                  onClick={() => setSidebarCollapsed((v) => !v)}
                  aria-label="Toggle sidebar"
                >
                  <PanelLeft size={18} />
                </button>
              ) : null}
              {!isMobile ? <div className="text-xs text-white/60">/admin</div> : null}
              <div className="text-sm font-semibold text-white">{tabLabel}</div>
            </div>
            {!isMobile ? (
              <Button variant="secondary" className="h-10" onClick={onSignOut}>
                Sign out
              </Button>
            ) : (
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80"
                onClick={() => setMobileMoreOpen(true)}
                aria-label="More"
              >
                <MoreHorizontal size={18} />
              </button>
            )}
          </div>
        ) : null}

        {shouldShowNotice ? (
          <div className="border-b border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 lg:px-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="mr-2 inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                  Email
                </span>
                {" "}
                {topNotice}
              </div>
              <button
                type="button"
                className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
                onClick={() => {
                  setNoticeDismissed(true);
                  try {
                    window.localStorage.setItem("cf_admin_notice_dismissed", "1");
                  } catch {
                    return;
                  }
                }}
              >
                ×
              </button>
            </div>
          </div>
        ) : null}

        {tab === "builder" ? <div className="min-h-0 flex-1 overflow-hidden">{children}</div> : null}
        {tab !== "builder" ? (
          <div className={isMobile ? "min-h-0 flex-1 overflow-y-auto pb-20" : "min-h-0 flex-1 overflow-y-auto"}>
            {children}
          </div>
        ) : null}
      </div>

      {isMobile && tab !== "builder" ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[var(--cf-secondary)]/95 backdrop-blur">
          <div className="mx-auto grid max-w-xl grid-cols-5 px-2 py-2">
            <button
              type="button"
              className="flex h-12 flex-col items-center justify-center rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
              onClick={() => onTabChange("builder")}
            >
              <LayoutDashboard size={18} />
              <div className="mt-1 text-[11px] font-semibold">Builder</div>
            </button>
            <button
              type="button"
              className={
                tab === "pages"
                  ? "flex h-12 flex-col items-center justify-center rounded-xl bg-white/10 text-white"
                  : "flex h-12 flex-col items-center justify-center rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
              }
              onClick={() => onTabChange("pages")}
            >
              <Files size={18} />
              <div className="mt-1 text-[11px] font-semibold">Pages</div>
            </button>
            <button
              type="button"
              className={
                tab === "leads"
                  ? "flex h-12 flex-col items-center justify-center rounded-xl bg-white/10 text-white"
                  : "flex h-12 flex-col items-center justify-center rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
              }
              onClick={() => onTabChange("leads")}
            >
              <Users size={18} />
              <div className="mt-1 text-[11px] font-semibold">Leads</div>
            </button>
            <button
              type="button"
              className={
                tab === "media"
                  ? "flex h-12 flex-col items-center justify-center rounded-xl bg-white/10 text-white"
                  : "flex h-12 flex-col items-center justify-center rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
              }
              onClick={() => onTabChange("media")}
            >
              <ImageIcon size={18} />
              <div className="mt-1 text-[11px] font-semibold">Media</div>
            </button>
            <button
              type="button"
              className="flex h-12 flex-col items-center justify-center rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
              onClick={() => setMobileMoreOpen(true)}
            >
              <MoreHorizontal size={18} />
              <div className="mt-1 text-[11px] font-semibold">More</div>
            </button>
          </div>
        </div>
      ) : null}

      {isMobile && mobileMoreOpen ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4" onClick={() => setMobileMoreOpen(false)}>
          <div
            className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[var(--cf-secondary)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="text-sm font-semibold text-white">Menu</div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80"
                onClick={() => setMobileMoreOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/80 hover:bg-white/5"
                onClick={() => {
                  onTabChange("settings");
                  setMobileMoreOpen(false);
                }}
              >
                <Settings size={18} />
                Settings
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/80 hover:bg-white/5"
                onClick={() => {
                  onTabChange("homepage");
                  setMobileMoreOpen(false);
                }}
              >
                <FileJson size={18} />
                JSON editor
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/80 hover:bg-white/5"
                onClick={() => {
                  onTabChange("custom");
                  setMobileMoreOpen(false);
                }}
              >
                <Code2 size={18} />
                Custom code
              </button>
              <div className="mt-2 border-t border-white/10 pt-2">
                <Button
                  variant="secondary"
                  className="h-11 w-full"
                  onClick={async () => {
                    await onSignOut();
                    setMobileMoreOpen(false);
                  }}
                >
                  Sign out
                </Button>
                <div className="mt-2 text-xs text-white/50">Signed in as {sessionEmail}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

