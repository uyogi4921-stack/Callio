"use client";

import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/hooks/useAuth";
import { useReminderScheduler } from "@/lib/hooks/useReminderScheduler";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function ReminderSchedulerRunner() {
  useReminderScheduler();
  return null;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If Supabase is configured but user is not logged in, redirect to login
    if (!loading && isConfigured && !user) {
      router.replace("/login");
    }
  }, [loading, isConfigured, user, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-olive border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--nav-inactive)]">Loading...</p>
        </div>
      </div>
    );
  }

  // If configured and no user, don't render app (redirect is happening)
  if (isConfigured && !user) {
    return null;
  }

  return (
    <>
      <ReminderSchedulerRunner />
      <AppShell>{children}</AppShell>
    </>
  );
}
