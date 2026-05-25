"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { useTasks } from "./useTasks";

/**
 * Client-side reminder scheduler.
 *
 * For each pending task with a future due time, schedules a setTimeout
 * that fires a Twilio call when the task is due.
 *
 * Strategy:
 *   - If task is more than 2 min away → fire 2 min early
 *   - If task is between 0 and 2 min away → fire immediately (no early offset)
 *   - If task time has already passed → skip
 *   - If task is more than 6 h away → skip (out of demo scope)
 *
 * This is the primary delivery mechanism for the demo — Vercel Hobby
 * crons can only run daily, so we trigger calls directly from the
 * client whenever the user has the app open.
 *
 * Tracks already-scheduled task IDs so we never double-call.
 * Re-checks every 30s in case tasks are added without a render cycle.
 */
const EARLY_OFFSET_MS = 2 * 60 * 1000; // 2 minutes
const MAX_LOOKAHEAD_MS = 6 * 60 * 60 * 1000; // 6 hours
const POLL_INTERVAL_MS = 30 * 1000; // 30 seconds

export function useReminderScheduler() {
  const { profile } = useAuth();
  const { tasks } = useTasks();
  const scheduledRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const calledRef = useRef<Set<string>>(new Set());
  const tasksRef = useRef(tasks);
  const phoneRef = useRef(profile?.phone);

  tasksRef.current = tasks;
  phoneRef.current = profile?.phone;

  // Schedule + re-scan loop
  useEffect(() => {
    const scan = () => {
      const phone = phoneRef.current;
      if (!phone) return;

      const scheduled = scheduledRef.current;
      const called = calledRef.current;
      const now = Date.now();

      for (const task of tasksRef.current) {
        if (task.status !== "pending") continue;
        if (scheduled.has(task.id) || called.has(task.id)) continue;

        const dueAt = parseTaskDueTime(task.dueDate, task.dueTime);
        if (!dueAt) continue;

        const lookahead = dueAt - now;
        // Skip past tasks (more than 1 min overdue) and far-future ones
        if (lookahead < -60 * 1000 || lookahead > MAX_LOOKAHEAD_MS) continue;

        // Fire 2 min early when possible, otherwise fire immediately
        const fireDelay = Math.max(0, lookahead - EARLY_OFFSET_MS);

        const timer = setTimeout(() => {
          void fireReminderCall(phone, task.title, task.dueTime);
          called.add(task.id);
          scheduled.delete(task.id);
        }, fireDelay);

        scheduled.set(task.id, timer);
        console.log(
          `[Reminder] Scheduled "${task.title}" — firing in ${Math.round(
            fireDelay / 1000
          )}s (task at ${task.dueTime})`
        );
      }

      // Cancel timers for tasks that disappeared / got completed
      const liveIds = new Set(
        tasksRef.current
          .filter((t) => t.status === "pending")
          .map((t) => t.id)
      );
      for (const [taskId, timer] of scheduled.entries()) {
        if (!liveIds.has(taskId)) {
          clearTimeout(timer);
          scheduled.delete(taskId);
        }
      }
    };

    scan(); // initial scan
    const interval = setInterval(scan, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
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

/** Convert "2024-10-23" + "2:30 PM" → epoch ms of the actual due time. */
function parseTaskDueTime(dueDate: string, dueTime: string): number | null {
  try {
    const match = dueTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const dt = new Date(
      `${dueDate}T${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}:00`
    );
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
    const res = await fetch("/api/reminder-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, taskTitle, taskTime }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[Reminder] Call failed:", data);
    } else {
      console.log("[Reminder] Call queued:", data.callSid);
    }
  } catch (err) {
    console.error("[Reminder] Network error:", err);
  }
}
