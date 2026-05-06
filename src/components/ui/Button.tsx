import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "gold";
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base =
    "inline-flex h-12 items-center justify-center rounded-lg px-5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";

  const styles =
    variant === "primary"
      ? "bg-[var(--cf-primary)] text-white shadow-lg shadow-black/10 hover:brightness-95"
      : variant === "gold"
        ? "bg-[var(--cf-accent)] text-white shadow-lg shadow-black/10 hover:brightness-95"
        : "border border-[var(--cf-border)] bg-transparent text-[var(--cf-text)] hover:bg-white/5";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

