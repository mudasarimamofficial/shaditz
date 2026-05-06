import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & {
  name: string;
};

export function MaterialIcon({ name, className = "", ...props }: Props) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      {...props}
    >
      {name}
    </span>
  );
}

