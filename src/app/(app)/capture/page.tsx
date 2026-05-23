"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Plus,
  Clock,
  X,
  CheckCircle2,
  Circle,
  Trash2,
  Send,
} from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";

const VoiceScheduler = dynamic(
  () => import("@/components/VoiceScheduler"),
  { ssr: false }
);

export default function CapturePage() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("12:00");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const handleAddTask = async () => {
    const title = newTitle.trim();
    if (!title) return;

    const [h, m] = newTime.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const dueTime = `${hour12}:${m.toString().padStart(2, "0")} ${period}`;

    await addTask({
      title,
      due_date: new Date().toISOString().split("T")[0],
      due_time: dueTime,
      source: "text",
    });

    setNewTitle("");
    setNewTime("12:00");
    setShowTimePicker(false);
    inputRef.current?.focus();
  };

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (task.status === "done") {
      updateTask(id, { status: "pending" });
    } else {
      updateTask(id, { status: "done", completedAt: new Date().toISOString() });
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-[var(--foreground)] mb-2">
          Plan Your Day
        </h1>
        <p className="text-sm text-[var(--nav-inactive)]">
          Speak or type what you need to do — Callio organises your schedule.
        </p>
      </div>

      {/* Voice Scheduler */}
      <div className="mb-6">
        <VoiceScheduler />
      </div>

      {/* Manual quick-add */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 mb-6 fade-in">
        <p className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-3">
          Or type it
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTask();
          }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 flex items-center bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl px-3 py-2.5 focus-within:ring-1 focus-within:ring-olive/40 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Team standup at 9:30 AM"
              className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--nav-inactive)] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowTimePicker(!showTimePicker)}
              className={`ml-2 flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                showTimePicker
                  ? "bg-olive/10 text-olive"
                  : "text-[var(--nav-inactive)] hover:text-[var(--foreground)]"
              }`}
            >
              <Clock size={13} />
              <span className="hidden sm:inline">Time</span>
            </button>
          </div>
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="bg-olive text-white p-2.5 rounded-xl hover:bg-olive-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </form>

        {showTimePicker && (
          <div className="flex items-center gap-2 mt-3 fade-in">
            <Clock size={13} className="text-[var(--nav-inactive)]" />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-olive/40 [&::-webkit-calendar-picker-indicator]:invert-[0.5]"
            />
            <button
              onClick={() => setShowTimePicker(false)}
              className="text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Today's task list */}
      {(pendingTasks.length > 0 || doneTasks.length > 0) && (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 mb-6 fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-[var(--foreground)]">
              Today&apos;s List
            </h2>
            <span className="text-xs text-[var(--nav-inactive)]">
              {doneTasks.length}/{pendingTasks.length + doneTasks.length} done
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[var(--card-border)] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-olive rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${
                  pendingTasks.length + doneTasks.length > 0
                    ? Math.round(
                        (doneTasks.length /
                          (pendingTasks.length + doneTasks.length)) *
                          100
                      )
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="space-y-1">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-[var(--input-bg)] transition-colors group"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <Circle
                    size={20}
                    className="text-[var(--card-border)] group-hover:text-olive transition-colors flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  <span className="text-sm text-[var(--foreground)] truncate">
                    {task.title}
                  </span>
                </button>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-xs text-[var(--nav-inactive)] bg-[var(--input-bg)] px-2 py-0.5 rounded-md">
                    {task.dueTime}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-[var(--nav-inactive)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-[var(--input-bg)] transition-colors group"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <CheckCircle2
                    size={20}
                    className="text-olive flex-shrink-0"
                    strokeWidth={2}
                  />
                  <span className="text-sm text-[var(--nav-inactive)] line-through truncate">
                    {task.title}
                  </span>
                </button>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-xs text-[var(--nav-inactive)] bg-[var(--input-bg)] px-2 py-0.5 rounded-md">
                    {task.dueTime}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-[var(--nav-inactive)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {pendingTasks.length === 0 && doneTasks.length === 0 && (
        <div className="text-center py-12 text-[var(--nav-inactive)]">
          <p className="text-sm">
            No tasks yet. Speak or type above to start planning your day.
          </p>
        </div>
      )}
    </div>
  );
}
