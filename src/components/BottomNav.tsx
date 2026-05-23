"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crosshair, BarChart3, Mic, BookOpen, Settings } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { label: "Focus", href: "/focus", icon: Crosshair },
  { label: "Report", href: "/history", icon: BarChart3 },
  { label: "Capture", href: "/capture", icon: Mic, isCenter: true },
  { label: "Journal", href: "/journal", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--sidebar-bg)] border-t border-[var(--card-border)] z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/focus" && pathname === "/");

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-14 h-14 rounded-full bg-olive flex items-center justify-center shadow-lg">
                  <Mic size={22} className="text-white" />
                </div>
                <span className="text-[10px] mt-1 text-[var(--nav-inactive)]">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center py-1 px-3"
            >
              <item.icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
                className={clsx(
                  isActive
                    ? "text-[var(--nav-active)]"
                    : "text-[var(--nav-inactive)]"
                )}
              />
              <span
                className={clsx(
                  "text-[10px] mt-1",
                  isActive
                    ? "text-[var(--nav-active)] font-medium"
                    : "text-[var(--nav-inactive)]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
