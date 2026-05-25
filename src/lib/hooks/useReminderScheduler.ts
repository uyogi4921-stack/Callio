"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { useTasks } from "./useTasks";

/**
 * Client-side reminder scheduler.
 *
 * For each pending task with a future due time, schedules a setTimeout
 * that fires a Twilio call exactly when the task is due (2 min early).
 *
 * This is the primary delivery mechanism for the demo — Vercel Hobby
 * crons can only run daily, so we trigger calls directly from the
 * client whenever the user has the app open.
 *
 * Tracks already-scheduled task IDs so we never double-call.
 */
export function useReminderScheduler() {
  const { profile } = useAuth();
  const { tasks } = useTasks();
  const scheduledRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const calledRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const phone = profile?.phone;
    if (!phone) return;

    const scheduled = scheduledRef.current;
    const called = calledRef.current;
    const now = Date.now();

    // Schedule calls for pending tasks whose time hasn't passed
    for (const task of tasks) {
      if (task.status !== "pending") continue;
      if (scheduled.has(task.id) || called.has(task.id)) continue;

      const fireAt = parseTaskFireTime(task.dueDate, task.dueTime);
      if (!fireAt) continue;

      const delay = fireAt - now;
      // Skip if already past the time or more than 6 hours away
      if (delay <= 0 || delay > 6 * 60 * 60 * 1000) continue;

      const timer = setTimeout(() => {
        void fireReminderCall(phone, task.title, task.dueTime);
        called.add(task.id);
        scheduled.delete(task.id);
      }, delay);

      scheduled.set(task.id, timer);
    }

    // Clean up scheduled timers for tasks that no longer exist or were completed
    const liveIds = new Set(
      tasks.filter((t) => t.status === "pending").map((t) => t.id)
    );
    for (const [taskId, timer] of scheduled.entries()) {
      if (!liveIds.has(taskId)) {
        clearTimeout(timer);
        scheduled.delete(taskId);
      }
    }

    return () => {
      // Note: don't clear on every effect run — only on unmount
    };
  }, [tasks, profile?.phone]);

  // Clear all timers on unmount
  useEffect(() => {
    const scheduled = scheduledRef.current;
    return () => {
      for (const timer of scheduled.values()) {
        clearTimeout(timer);
      }
      scheduled.clear();
    };
  }, []);
}

/** Convert "2024-10-23" + "2:30 PM" → epoch ms, firing 2 min early. */
function parseTaskFireTime(dueDate: string, dueTime: string): number | null {
  try {
    const match = dueTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const dt = new Date(
      `${dueDate}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
    );
    // Fire 2 min before due time
    dt.setMinutes(dt.getMinutes() - 2);
    return dt.getTime();
  } catch {
    return null;
  }
}

async function fireReminderCall(
  phone: string,
  taskTitle: string,
  taskTime: string
) {
  try {
    await fetch("/api/reminder-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, taskTitle, taskTime }),
    });
  } catch {
    // best-effort, silent fail
  }
}
