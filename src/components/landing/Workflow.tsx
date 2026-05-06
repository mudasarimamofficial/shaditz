import type { HomepageContent } from "@/content/homepage";
import type { PageSection } from "@/components/landing/sectionRegistry";

type Props = {
  content: HomepageContent;
  section?: PageSection;
};

export function Workflow({ content, section }: Props) {
  const label = (section?.settings as any)?.label || (content.workflow as any).label || "";
  const variant = (section?.settings as any)?.variant || "landing";

  if (variant === "accordion") {
    return (
      <section id={content.workflow.id} className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{content.workflow.heading}</h2>
            <p className="text-slate-600 dark:text-slate-400">{content.workflow.subcopy}</p>
          </div>
          <div className="flex flex-col gap-4">
            {content.workflow.steps.map((s, idx) => (
              <details
                key={s.title}
                className="group rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm dark:border-white/10 dark:bg-[#112121]"
                open={Boolean(s.open)}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
                      {idx + 1}
                    </div>
                    <p className="text-base font-bold">{s.title}</p>
                  </div>
                  <span className="text-slate-400">+</span>
                </summary>
                <div className="mt-2 border-t border-slate-100 pb-2 pl-12 pt-4 text-sm leading-relaxed text-slate-600 dark:border-white/5 dark:text-slate-400">
                  {s.copy}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="workflow">
      <div className="container">
        <div className="section-intro">
          {label ? <div className="label-tag">{label}</div> : null}
          <h2>{content.workflow.heading}</h2>
          {content.workflow.subcopy ? <p>{content.workflow.subcopy}</p> : null}
        </div>

        <div className="timeline-list">
          {content.workflow.steps.map((s, idx) => (
            <div key={`${s.title}-${idx}`} className={`timeline-item ${idx % 2 === 0 ? "is-left" : "is-right"}`}>
              <div className="timeline-card">
                <h3>{s.title}</h3>
                <p>{s.copy}</p>
              </div>
              <div className="timeline-point">{idx + 1}</div>
              <div className="timeline-spacer" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
