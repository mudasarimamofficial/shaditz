"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import type { HomepageContent } from "@/content/homepage";
import type { PageSection } from "@/components/landing/sectionRegistry";

const schema = z.object({
  first_name: z.string().min(1, "First name is required").max(120),
  last_name: z.string().min(1, "Last name is required").max(120),
  email: z.string().email("Enter a valid email").max(240),
  revenue: z.string().min(1, "Select a revenue range").max(120),
  message: z.string().max(4000).optional().nullable(),
  company: z.string().optional().nullable(),
});

type FormState = z.infer<typeof schema>;

type Props = {
  content: HomepageContent;
  section?: PageSection;
};

function safeApplicationCopy(value: string, fallback: string) {
  if (/24\s*h(?:ours?)?|24\s*hours|5\s+new\s+coaches/i.test(value)) return fallback;
  return value;
}

export function LeadFormSection({ content, section }: Props) {
  const label = (section?.settings as any)?.label ? String((section?.settings as any).label) : "";
  const subcopy = safeApplicationCopy(
    content.application.subcopy || "",
    "Tell us about your business and we will review fit before the next step.",
  );
  const footnote = safeApplicationCopy(
    content.application.footnote || "",
    "We'll review your answers and reply with next steps if there is alignment.",
  );
  const successBody = safeApplicationCopy(
    content.application.successBody || "",
    "We review every application personally and will be in touch if there is a fit. Check your email, including your spam folder.",
  );
  const [values, setValues] = useState<FormState>({
    first_name: "",
    last_name: "",
    email: "",
    revenue: "",
    message: "",
    company: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const payload = useMemo(() => {
    return {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim(),
      revenue: values.revenue?.trim() || null,
      message: values.message?.trim() || null,
      company: values.company?.trim() || null,
    };
  }, [values]);

  return (
    <section id="lead-form">
      <div className="container">
        <div className="form-wrap" data-content-id={content.application.id}>
          <div className="form-intro-panel">
            {label ? <div className="label-tag">{label}</div> : null}
            <div className="gold-line" aria-hidden="true" />
            <h2>{content.application.heading}</h2>
            <p>{subcopy}</p>

            <div className="form-intro-grid" aria-label="Application expectations">
              <div>
                <strong>Fit</strong>
                <span>review process</span>
              </div>
              <div>
                <strong>Fit-first</strong>
                <span>no pressure call</span>
              </div>
            </div>

            <div className="form-reassurance">
              <div className="form-reassurance-title">What happens after you apply</div>
              <p>{footnote}</p>
            </div>
          </div>

          <div className="form-card">
            <div id="form-content" style={{ display: submitted ? "none" : "block" }}>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError(null);
                  setFieldErrors({});

                  const parsed = schema.safeParse(payload);
                  if (!parsed.success) {
                    const next: Record<string, string> = {};
                    for (const issue of parsed.error.issues) {
                      const key = String(issue.path[0] ?? "");
                      if (key && !next[key]) next[key] = issue.message;
                    }
                    setFieldErrors(next);
                    return;
                  }

                  setSubmitting(true);
                  try {
                    const res = await fetch("/api/leads", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify(parsed.data),
                    });

                    const json = (await res.json()) as { ok: boolean; message?: string };
                    if (!res.ok || !json.ok) {
                      setError(json.message || "Something went wrong. Please try again.");
                      return;
                    }

                    setSubmitted(true);
                    setValues({
                      first_name: "",
                      last_name: "",
                      email: "",
                      revenue: "",
                      message: "",
                      company: "",
                    });
                  } catch {
                    setError("Network error. Please try again.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <div className="form-card-header">
                  <span>Private application</span>
                  <p>Tell us where the pipeline is stuck. The team will use this to decide fit before the next step.</p>
                </div>

                {error ? (
                  <div className="form-alert" role="alert">
                    {error}
                  </div>
                ) : null}

                <fieldset className="form-section" aria-label="Your details">
                  <legend className="form-section-title">Your details</legend>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cf-first-name">{content.application.fields.firstNameLabel}</label>
                      <input
                        id="cf-first-name"
                        value={values.first_name}
                        onChange={(e) => setValues((v) => ({ ...v, first_name: e.target.value }))}
                        autoComplete="given-name"
                        placeholder={content.application.fields.firstNamePlaceholder || ""}
                        aria-invalid={Boolean(fieldErrors.first_name)}
                        aria-describedby={fieldErrors.first_name ? "cf-first-name-error" : undefined}
                      />
                      {fieldErrors.first_name ? (
                        <div className="form-note form-error" id="cf-first-name-error">
                          {fieldErrors.first_name}
                        </div>
                      ) : null}
                    </div>

                    <div className="form-group">
                      <label htmlFor="cf-last-name">{content.application.fields.lastNameLabel}</label>
                      <input
                        id="cf-last-name"
                        value={values.last_name}
                        onChange={(e) => setValues((v) => ({ ...v, last_name: e.target.value }))}
                        autoComplete="family-name"
                        placeholder={content.application.fields.lastNamePlaceholder || ""}
                        aria-invalid={Boolean(fieldErrors.last_name)}
                        aria-describedby={fieldErrors.last_name ? "cf-last-name-error" : undefined}
                      />
                      {fieldErrors.last_name ? (
                        <div className="form-note form-error" id="cf-last-name-error">
                          {fieldErrors.last_name}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="cf-email">{content.application.fields.emailLabel}</label>
                    <input
                      id="cf-email"
                      type="email"
                      inputMode="email"
                      value={values.email}
                      onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                      placeholder={content.application.fields.emailPlaceholder || ""}
                      autoComplete="email"
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? "cf-email-error" : undefined}
                    />
                    {fieldErrors.email ? (
                      <div className="form-note form-error" id="cf-email-error">
                        {fieldErrors.email}
                      </div>
                    ) : null}
                  </div>
                </fieldset>

                <fieldset className="form-section" aria-label="Your business">
                  <legend className="form-section-title">Your business</legend>
                  <div className="form-group">
                    <label htmlFor="cf-revenue">{content.application.fields.revenueLabel}</label>
                    <select
                      id="cf-revenue"
                      value={values.revenue || ""}
                      onChange={(e) => setValues((v) => ({ ...v, revenue: e.target.value }))}
                      aria-invalid={Boolean(fieldErrors.revenue)}
                      aria-describedby={fieldErrors.revenue ? "cf-revenue-error" : undefined}
                    >
                      <option value="" disabled>
                        {content.application.fields.revenuePlaceholder || "Select..."}
                      </option>
                      {content.application.fields.revenueOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.revenue ? (
                      <div className="form-note form-error" id="cf-revenue-error">
                        {fieldErrors.revenue}
                      </div>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label htmlFor="cf-message">{content.application.fields.bottleneckLabel}</label>
                    <textarea
                      id="cf-message"
                      value={values.message || ""}
                      onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                      placeholder={content.application.fields.bottleneckPlaceholder}
                    />
                  </div>
                </fieldset>

                <input
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  name="company"
                  value={values.company || ""}
                  onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
                />

                <div className="form-action-row">
                  <button type="submit" className="btn-primary form-submit" disabled={submitting}>
                    {submitting ? "Submitting..." : content.application.submitText}
                    <span className="arrow" aria-hidden="true">
                      -&gt;
                    </span>
                  </button>
                  <p className="form-note">No public newsletter. No automated sales blast. Just a fit review.</p>
                </div>
              </form>
            </div>

            <div className="form-success" id="form-success" style={{ display: submitted ? "block" : "none" }}>
              <div className="gold-line" style={{ display: "block", margin: "0 auto 20px" }} />
              <h3>{content.application.successTitle}</h3>
              <p>{successBody}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
