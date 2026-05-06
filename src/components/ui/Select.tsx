import type { ReactNode, SelectHTMLAttributes } from "react";

type Option = { value: string; label: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
  label?: ReactNode;
  options: Option[];
  placeholder?: string;
};

export function Select({ label, error, options, placeholder, className = "", ...props }: Props) {
  return (
    <label className="flex flex-col gap-2">
      {label ? <span className="text-xs font-semibold tracking-wide text-white/70">{label}</span> : null}
      <select
        className={`h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-[var(--cf-accent)] focus:ring-2 focus:ring-[var(--cf-accent)]/20 ${className}`}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-slate-900">
            {o.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-rose-500">{error}</span> : null}
    </label>
  );
}

