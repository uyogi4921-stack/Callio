"use client";

import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, Bell, Phone, User, LogOut, PhoneIncoming, Save, Check } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { profile, signOut, updateProfile, isConfigured } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [callReminders, setCallReminders] = useState(true);
  const [phone, setPhone] = useState(profile?.phone || "");
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleSavePhone = async () => {
    setSaving(true);
    const cleanPhone = phone.replace(/\s+/g, "");
    await updateProfile({ phone: cleanPhone || null });
    setSaving(false);
    setPhoneSaved(true);
    setTimeout(() => setPhoneSaved(false), 3000);
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
          <div className="flex items-center gap-4">
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
            </div>
          </div>
        </div>
      </section>

      {/* Phone Number — key feature */}
      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
          Reminder Calls
        </h2>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-olive/10 flex items-center justify-center">
              <PhoneIncoming size={20} className="text-olive" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Auto-Call Phone Number
              </p>
              <p className="text-xs text-[var(--nav-inactive)]">
                Callio calls this number to remind you about tasks
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneSaved(false);
              }}
              placeholder="+91 98765 43210"
              className="flex-1 bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--nav-inactive)] outline-none focus:border-olive"
            />
            <button
              onClick={handleSavePhone}
              disabled={saving}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                phoneSaved
                  ? "bg-olive/10 text-olive"
                  : "bg-olive text-white hover:bg-olive-dark"
              }`}
            >
              {phoneSaved ? (
                <>
                  <Check size={16} />
                  Saved
                </>
              ) : saving ? (
                "Saving..."
              ) : (
                <>
                  <Save size={16} />
                  Save
                </>
              )}
            </button>
          </div>

          {profile?.phone && (
            <div className="flex items-center gap-2 mt-3">
              <span className="w-2 h-2 rounded-full bg-olive animate-pulse" />
              <span className="text-xs text-olive">
                Auto-calls active for {profile.phone}
              </span>
            </div>
          )}

          <p className="text-xs text-[var(--nav-inactive)] mt-3">
            Include country code (e.g. +91 for India, +1 for US). The number must be verified on Twilio for trial accounts.
          </p>
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
              <Phone size={18} className="text-[var(--nav-inactive)]" />
              <div>
                <p className="text-sm text-[var(--foreground)]">
                  Accountability Calls
                </p>
                <p className="text-xs text-[var(--nav-inactive)]">
                  Receive phone calls for scheduled tasks
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

      {/* How It Works */}
      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
          How Auto-Calls Work
        </h2>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-olive/10 text-olive text-xs flex items-center justify-center font-medium flex-shrink-0 mt-0.5">
                1
              </span>
              <div>
                <p className="text-sm text-[var(--foreground)]">Add a task with a time</p>
                <p className="text-xs text-[var(--nav-inactive)]">
                  Say or type something like &ldquo;Team standup at 9:30 AM&rdquo;
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-olive/10 text-olive text-xs flex items-center justify-center font-medium flex-shrink-0 mt-0.5">
                2
              </span>
              <div>
                <p className="text-sm text-[var(--foreground)]">Callio schedules the call</p>
                <p className="text-xs text-[var(--nav-inactive)]">
                  A reminder call is automatically created for that time
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-olive/10 text-olive text-xs flex items-center justify-center font-medium flex-shrink-0 mt-0.5">
                3
              </span>
              <div>
                <p className="text-sm text-[var(--foreground)]">You get a call</p>
                <p className="text-xs text-[var(--nav-inactive)]">
                  At the scheduled time, Callio calls your phone with a friendly reminder
                </p>
              </div>
            </div>
          </div>
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
