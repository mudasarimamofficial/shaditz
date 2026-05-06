"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getCurrentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(getCurrentTheme());
  }, []);

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200/50 bg-white/60 text-slate-700 backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-black/20 dark:text-slate-200 dark:hover:bg-white/10"
      onClick={() => {
        const next: Theme = getCurrentTheme() === "dark" ? "light" : "dark";
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(next);
        try {
          localStorage.setItem("theme", next);
        } catch {
        }
        setTheme(next);
      }}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

