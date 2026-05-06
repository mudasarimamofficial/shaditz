import type { Lead } from "@/components/admin/types";
import { Mail } from "lucide-react";

type Props = {
  lead: Lead | null;
};

export function LeadDetails({ lead }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#112121]">
      <div className="mb-4 text-sm font-bold">Lead details</div>
      {lead ? (
        <div className="flex flex-col gap-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Status
            </div>
            <div className="mt-1 font-semibold">{lead.status}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Name
            </div>
            <div className="mt-1 font-semibold">{lead.name}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Email
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="truncate font-semibold">{lead.email}</div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(lead.email);
                  } catch {
                  }
                }}
              >
                <Mail className="h-4 w-4" />
                Copy
              </button>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Phone
            </div>
            <div className="mt-1 font-semibold">{lead.phone || "—"}</div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Business Type
              </div>
              <div className="mt-1 font-semibold">{lead.business_type || "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Revenue
              </div>
              <div className="mt-1 font-semibold">{lead.revenue || "—"}</div>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Message
            </div>
            <div className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-slate-700 dark:bg-white/5 dark:text-slate-200">
              {lead.message || "—"}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Select a lead to see details.
        </div>
      )}
    </div>
  );
}

