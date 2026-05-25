"use client";

import { Bell, Search, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { useTasks } from "@/lib/hooks/useTasks";
import { useAuth } from "@/lib/hooks/useAuth";

interface TopBarProps {
  onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { theme, toggle } = useTheme();
  const { tasks } = useTasks();
  const { profile } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsSeen, setNotificationsSeen] = useState(false);

  const overdueTasks = tasks.filter((t) => t.status === "overdue");
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const unseenCount = notificationsSeen ? 0 : overdueTasks.length;

  const initial = profile?.full_name?.charAt(0).toUpperCase() || "A";

  const toggleNotifications = () => {
    setNotificationsOpen((v) => !v);
    setNotificationsSeen(true);
  };

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
        <Link
          href="/settings"
          className="w-9 h-9 rounded-full bg-olive-muted flex items-center justify-center text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {initial}
        </Link>
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

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="relative text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors p-2 rounded-lg hover:bg-[var(--input-bg)]"
              title="Notifications"
            >
              <Bell size={20} />
              {unseenCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-overdue rounded-full" />
              )}
            </button>

            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--card-border)]">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      Notifications
                    </p>
                    <p className="text-[10px] text-[var(--nav-inactive)]">
                      {overdueTasks.length} overdue · {pendingTasks.length} pending
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {overdueTasks.length === 0 && pendingTasks.length === 0 ? (
                      <p className="px-4 py-6 text-xs text-center text-[var(--nav-inactive)]">
                        You&apos;re all caught up
                      </p>
                    ) : (
                      <>
                        {overdueTasks.slice(0, 5).map((t) => (
                          <Link
                            href="/focus"
                            key={t.id}
                            onClick={() => setNotificationsOpen(false)}
                            className="block px-4 py-2.5 hover:bg-[var(--input-bg)] border-b border-[var(--card-border)] last:border-b-0"
                          >
                            <p className="text-xs font-medium text-overdue">
                              Overdue
                            </p>
                            <p className="text-sm text-[var(--foreground)] truncate">
                              {t.title}
                            </p>
                            <p className="text-[10px] text-[var(--nav-inactive)]">
                              {t.dueTime}
                            </p>
                          </Link>
                        ))}
                        {pendingTasks.slice(0, 3).map((t) => (
                          <Link
                            href="/focus"
                            key={t.id}
                            onClick={() => setNotificationsOpen(false)}
                            className="block px-4 py-2.5 hover:bg-[var(--input-bg)] border-b border-[var(--card-border)] last:border-b-0"
                          >
                            <p className="text-[10px] text-olive uppercase tracking-wider font-medium">
                              Upcoming
                            </p>
                            <p className="text-sm text-[var(--foreground)] truncate">
                              {t.title}
                            </p>
                            <p className="text-[10px] text-[var(--nav-inactive)]">
                              {t.dueTime}
                            </p>
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile/avatar */}
          <Link
            href="/settings"
            className="w-9 h-9 rounded-full bg-olive-muted flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity"
            title="Your account"
          >
            {initial}
          </Link>
        </div>
      </header>
    </>
  );
}
