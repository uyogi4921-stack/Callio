"use client";

import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, Bell, Shield, User, CreditCard, LogOut } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { profile, signOut, isConfigured } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [callReminders, setCallReminders] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <h1 className="font-serif text-3xl text-[var(--foreground)] mb-2">
        Settings
      </h1>
      <p className="text-sm text-[var(--nav-inactive)] mb-8">
        Manage your Callio preferences
      </p>

      {/* Profile */}
      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
          Profile
        </h2>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-olive-muted flex items-center justify-center text-white text-lg font-medium">
              {(profile?.full_name || "U")[0]}
            </div>
            <div>
              <p className="font-medium text-[var(--foreground)]">
                {profile?.full_name || "User"}
              </p>
              <p className="text-sm text-[var(--nav-inactive)]">
                {profile?.email || "user@example.com"}
              </p>
              <span className="text-xs text-olive font-medium">
                Pro Account
              </span>
            </div>
          </div>
          <button className="text-sm text-olive hover:text-olive-dark transition-colors">
            Edit Profile
          </button>
        </div>
      </section>

      {/* Appearance */}
      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
          Appearance
        </h2>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon size={18} className="text-[var(--nav-inactive)]" />
              ) : (
                <Sun size={18} className="text-[var(--nav-inactive)]" />
              )}
              <div>
                <p className="text-sm text-[var(--foreground)]">Dark Mode</p>
                <p className="text-xs text-[var(--nav-inactive)]">
                  {theme === "dark" ? "Currently active" : "Switch to dark theme"}
                </p>
              </div>
            </div>
            <button
              onClick={toggle}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                theme === "dark" ? "bg-olive" : "bg-[var(--card-border)]"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
                  theme === "dark" ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
          Notifications
        </h2>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl divide-y divide-[var(--card-border)]">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-[var(--nav-inactive)]" />
              <div>
                <p className="text-sm text-[var(--foreground)]">
                  Push Notifications
                </p>
                <p className="text-xs text-[var(--nav-inactive)]">
                  Get reminded about upcoming tasks
                </p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifications ? "bg-olive" : "bg-[var(--card-border)]"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
                  notifications ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-[var(--nav-inactive)]" />
              <div>
                <p className="text-sm text-[var(--foreground)]">
                  Accountability Calls
                </p>
                <p className="text-xs text-[var(--nav-inactive)]">
                  Receive simulated calls for overdue tasks
                </p>
              </div>
            </div>
            <button
              onClick={() => setCallReminders(!callReminders)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                callReminders ? "bg-olive" : "bg-[var(--card-border)]"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
                  callReminders ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Plan */}
      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
          Subscription
        </h2>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard size={18} className="text-[var(--nav-inactive)]" />
            <div>
              <p className="text-sm text-[var(--foreground)]">Pro Plan</p>
              <p className="text-xs text-[var(--nav-inactive)]">
                $9.99/month • Unlimited features
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="text-xs border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-[var(--nav-inactive)] hover:bg-[var(--input-bg)] transition-colors">
              Manage Subscription
            </button>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
          Privacy & Data
        </h2>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 space-y-3">
          <button className="text-sm text-[var(--foreground)] hover:text-olive transition-colors block">
            Export My Data
          </button>
          <button className="text-sm text-[var(--foreground)] hover:text-olive transition-colors block">
            Privacy Policy
          </button>
          <button className="text-sm text-overdue hover:opacity-80 transition-opacity block">
            Delete Account
          </button>
        </div>
      </section>

      {/* Sign Out */}
      {isConfigured && (
        <section>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 text-sm text-overdue hover:bg-overdue/5 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </section>
      )}
    </div>
  );
}
