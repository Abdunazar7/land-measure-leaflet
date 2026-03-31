"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "dark";

  const savedTheme = window.localStorage.getItem("theme") as ThemeMode | null;
  return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
};

export default function Navbar() {
  const pathname = usePathname();
  const isTool = pathname === "/tool";
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";

    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("theme", nextTheme);
    window.dispatchEvent(new CustomEvent("themechange", { detail: nextTheme }));

    setTheme(nextTheme);
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-(--border-muted) bg-(--nav-bg) backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2 sm:gap-3"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500 text-sm font-bold text-black shadow-lg shadow-green-500/25 transition-shadow group-hover:shadow-green-500/50">
            L
          </div>
          <span className="truncate text-[13px] font-semibold tracking-tight text-(--text-primary) sm:text-[15px]">
            Land
            <span className="hidden text-green-400 sm:inline">Measure</span>
            <span className="text-green-400 sm:hidden">M</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`rounded-lg px-2.5 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
              pathname === "/"
                ? "bg-black/5 text-(--text-primary) dark:bg-white/10"
                : "text-(--text-secondary) hover:bg-black/5 hover:text-(--text-primary) dark:hover:bg-white/5"
            }`}
          >
            <span className="hidden sm:inline">Bosh sahifa</span>
            <span className="sm:hidden">Bosh</span>
          </Link>
          <Link
            href="/tool"
            className={`rounded-lg px-2.5 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
              isTool
                ? "bg-green-500 text-black"
                : "border border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
            }`}
          >
            <span className="hidden sm:inline">Tool ni ochish →</span>
            <span className="sm:hidden">Tool →</span>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={theme === "dark"}
            aria-label={
              theme === "dark" ? "Light modega o‘tish" : "Dark modega o‘tish"
            }
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-(--border-muted) bg-(--panel-soft) text-base transition-transform hover:scale-105 sm:h-10 sm:w-10 sm:text-lg"
          >
            <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
