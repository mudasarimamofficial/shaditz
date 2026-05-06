import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: ReactNode;
};

export function Input({ label, error, className = "", ...props }: Props) {
  return (
    <label className="flex flex-col gap-2">
      {label ? <span className="text-xs font-semibold tracking-wide text-white/70">{label}</span> : null}
      <input
        className={`h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--cf-accent)] focus:ring-2 focus:ring-[var(--cf-accent)]/20 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-500">{error}</span> : null}
    </label>
  );
}

