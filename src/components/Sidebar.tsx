"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crosshair,
  BarChart3,
  PlusCircle,
  BookOpen,
  Settings,
  HelpCircle,
  Lock,
  Plus,
  Shield,
  X,
  Mic,
  PhoneIncoming,
  Calendar,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

const navItems = [
  { label: "Focus", href: "/focus", icon: Crosshair },
  { label: "Report", href: "/history", icon: BarChart3 },
  { label: "Capture", href: "/capture", icon: PlusCircle },
  { label: "Journal", href: "/journal", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
];

type ModalKind = "help" | "privacy" | null;

export default function Sidebar() {
  const pathname = usePathname();
  const [modal, setModal] = useState<ModalKind>(null);

  return (
    <>
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
          <button
            type="button"
            onClick={() => setModal("help")}
            className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors w-full rounded-lg hover:bg-[var(--input-bg)]"
          >
            <HelpCircle size={18} strokeWidth={1.5} />
            Help
          </button>
          <button
            type="button"
            onClick={() => setModal("privacy")}
            className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors w-full rounded-lg hover:bg-[var(--input-bg)]"
          >
            <Lock size={18} strokeWidth={1.5} />
            Privacy
          </button>
        </div>
      </aside>

      {modal && <InfoModal kind={modal} onClose={() => setModal(null)} />}
    </>
  );
}

function InfoModal({ kind, onClose }: { kind: "help" | "privacy"; onClose: () => void }) {
  const isHelp = kind === "help";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-[var(--card-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center">
              {isHelp ? (
                <HelpCircle size={18} className="text-olive" />
              ) : (
                <Lock size={18} className="text-olive" />
              )}
            </div>
            <h2 className="font-serif text-lg text-[var(--foreground)]">
              {isHelp ? "How Callio works" : "Privacy & Data"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {isHelp ? <HelpContent /> : <PrivacyContent />}
        </div>

        <div className="px-6 py-4 border-t border-[var(--card-border)] flex justify-end">
          <button
            onClick={onClose}
            className="bg-olive text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-olive-dark transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function HelpContent() {
  const steps = [
    {
      icon: Mic,
      title: "Capture tasks by voice or text",
      text: "Tap the Voice Scheduler or use the Capture page. Just say what you need to do and when.",
    },
    {
      icon: Calendar,
      title: "Tasks land in your Daily Focus",
      text: "Each task gets a time slot. You can edit, complete, or delete them anytime.",
    },
    {
      icon: PhoneIncoming,
      title: "Callio calls you when it's time",
      text: "About 2 minutes before each task, Callio dials your phone with a reminder. No alarms — a real call from your accountability partner.",
    },
    {
      icon: Sparkles,
      title: "Build your accountability score",
      text: "Complete tasks to grow your score and streak. Skip too many and the score drops.",
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--nav-inactive)] mb-2">
        Callio is your AI accountability partner. Here&apos;s the loop:
      </p>
      {steps.map((s, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-olive/10 flex items-center justify-center flex-shrink-0">
            <s.icon size={16} className="text-olive" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              {s.title}
            </p>
            <p className="text-xs text-[var(--nav-inactive)] mt-0.5 leading-relaxed">
              {s.text}
            </p>
          </div>
        </div>
      ))}
      <div className="mt-4 pt-4 border-t border-[var(--card-border)] text-xs text-[var(--nav-inactive)]">
        Need more help? Add a task in Focus → keep the tab open → Callio rings 2
        minutes before due time. Make sure your phone number is saved in
        Settings.
      </div>
    </div>
  );
}

function PrivacyContent() {
  const items = [
    {
      title: "Your data stays yours",
      text: "Tasks, journals, and reminders are stored only in your Supabase project, scoped to your account.",
    },
    {
      title: "Voice transcripts",
      text: "When you use the Voice Scheduler, audio is processed by ElevenLabs and only the resulting text is saved as a task. The audio itself is not retained by Callio.",
    },
    {
      title: "Reminder calls",
      text: "When Callio calls you, your phone number is sent only to Twilio (used to place the call) and never shared with third parties.",
    },
    {
      title: "Row-level security",
      text: "Every database row is protected by RLS policies. No other user can read your tasks, journal entries, or phone number.",
    },
    {
      title: "Delete anytime",
      text: "Delete your account from Settings (coming soon) or by removing your user in the Supabase dashboard — your data is removed via cascading delete.",
    },
  ];

  return (
    <div className="space-y-4">
      {items.map((s, i) => (
        <div key={i}>
          <p className="text-sm font-medium text-[var(--foreground)]">
            {s.title}
          </p>
          <p className="text-xs text-[var(--nav-inactive)] mt-0.5 leading-relaxed">
            {s.text}
          </p>
        </div>
      ))}
    </div>
  );
}
