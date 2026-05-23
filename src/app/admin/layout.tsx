"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ListTodo,
  BookOpen,
  MessageSquare,
  Activity,
  ArrowLeft,
  Shield,
} from "lucide-react";
import clsx from "clsx";
import { useTheme } from "@/components/ThemeProvider";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Tasks", href: "/admin/tasks", icon: ListTodo },
  { label: "Journal", href: "/admin/journal", icon: BookOpen },
  { label: "Accountability", href: "/admin/accountability", icon: MessageSquare },
  { label: "Analytics", href: "/admin/analytics", icon: Activity },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] border-r border-[var(--card-border)] bg-[var(--sidebar-bg)] h-screen sticky top-0">
        <div className="p-6 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-olive" />
            <div>
              <h1 className="font-serif text-lg text-[var(--foreground)]">
                Callio Admin
              </h1>
              <p className="text-[10px] text-[var(--nav-inactive)] uppercase tracking-wider">
                Control Panel
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          {adminNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
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

        <div className="px-3 pb-4">
          <Link
            href="/focus"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors rounded-lg hover:bg-[var(--input-bg)]"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-[var(--sidebar-bg)] border-b border-[var(--card-border)]">
          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/focus" className="text-[var(--nav-inactive)] hover:text-[var(--foreground)]">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-serif text-base text-[var(--foreground)]">Admin</span>
          </div>
          <span className="hidden lg:block font-serif text-base text-[var(--foreground)]">
            Administration
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors p-2 rounded-lg hover:bg-[var(--input-bg)]"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <div className="w-8 h-8 rounded-full bg-overdue/20 flex items-center justify-center text-overdue text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden flex overflow-x-auto border-b border-[var(--card-border)] bg-[var(--sidebar-bg)] px-2">
          {adminNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors",
                  isActive
                    ? "border-olive text-[var(--foreground)] font-medium"
                    : "border-transparent text-[var(--nav-inactive)]"
                )}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
