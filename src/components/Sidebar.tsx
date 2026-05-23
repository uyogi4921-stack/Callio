"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crosshair,
  Clock,
  PlusCircle,
  BookOpen,
  Settings,
  HelpCircle,
  Lock,
  Plus,
  Shield,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { label: "Focus", href: "/focus", icon: Crosshair },
  { label: "History", href: "/history", icon: Clock },
  { label: "Capture", href: "/capture", icon: PlusCircle },
  { label: "Journal", href: "/journal", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[220px] border-r border-[var(--card-border)] bg-[var(--sidebar-bg)] h-screen sticky top-0">
      <div className="p-6">
        <h1 className="font-serif text-xl font-normal text-[var(--foreground)]">
          Callio
        </h1>
        <p className="text-xs text-[var(--nav-inactive)] mt-0.5">
          AI Accountability
        </p>
      </div>

      <div className="px-4 mb-4">
        <Link
          href="/capture"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-olive text-white rounded-lg text-sm font-medium hover:bg-olive-dark transition-colors"
        >
          <Plus size={16} />
          New Entry
        </Link>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/focus" && pathname === "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors",
                isActive
                  ? "text-[var(--nav-active)] font-medium bg-[var(--input-bg)]"
                  : "text-[var(--nav-inactive)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
              )}
            >
              <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 space-y-1">
        <Link
          href="/admin"
          className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors w-full rounded-lg hover:bg-[var(--input-bg)]"
        >
          <Shield size={18} strokeWidth={1.5} />
          Admin Panel
        </Link>
        <button className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors w-full rounded-lg hover:bg-[var(--input-bg)]">
          <HelpCircle size={18} strokeWidth={1.5} />
          Help
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors w-full rounded-lg hover:bg-[var(--input-bg)]">
          <Lock size={18} strokeWidth={1.5} />
          Privacy
        </button>
      </div>
    </aside>
  );
}
