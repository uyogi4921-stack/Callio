"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface TopBarProps {
  onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { theme, toggle } = useTheme();

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--sidebar-bg)] border-b border-[var(--card-border)]">
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle} className="text-[var(--foreground)]">
            <Menu size={22} />
          </button>
          <h1 className="font-serif text-lg text-[var(--foreground)]">Callio</h1>
        </div>
        <div className="w-9 h-9 rounded-full bg-olive-muted flex items-center justify-center text-white text-sm font-medium">
          A
        </div>
      </header>

      {/* Desktop top bar */}
      <header className="hidden lg:flex items-center justify-between px-6 py-3 bg-[var(--sidebar-bg)] border-b border-[var(--card-border)]">
        <span className="font-serif text-base text-[var(--foreground)]">
          Callio AI
        </span>

        <div className="flex items-center gap-2 bg-[var(--input-bg)] rounded-lg px-3 py-2 w-72">
          <Search size={16} className="text-[var(--nav-inactive)]" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="bg-transparent text-sm outline-none flex-1 text-[var(--foreground)] placeholder:text-[var(--nav-inactive)]"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors p-2 rounded-lg hover:bg-[var(--input-bg)]"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button className="relative text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-overdue rounded-full" />
          </button>
          <div className="w-9 h-9 rounded-full bg-olive-muted flex items-center justify-center text-white text-sm font-medium cursor-pointer">
            A
          </div>
        </div>
      </header>
    </>
  );
}
