"use client";

import dynamic from "next/dynamic";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Plus,
} from "lucide-react";
import { useTasks, type TaskData } from "@/lib/hooks/useTasks";
import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useEffect } from "react";
const AccountabilityCallModal = dynamic(
  () => import("@/components/AccountabilityCallModal"),
  { ssr: false }
);

const Scene3DWrapper = dynamic(() => import("@/components/3d/Scene3DWrapper"), {
  ssr: false,
});
const ScoreOrb3D = dynamic(() => import("@/components/3d/ScoreOrb3D"), {
  ssr: false,
});
const WaveformVisualizer = dynamic(
  () => import("@/components/3d/WaveformVisualizer"),
  { ssr: false }
);
const VoiceScheduler = dynamic(
  () => import("@/components/VoiceScheduler"),
  { ssr: false }
);

export default function FocusPage() {
  const { profile } = useAuth();
  const { tasks, updateTask } = useTasks();
  const [callTask, setCallTask] = useState<TaskData | null>(null);
  const [showCall, setShowCall] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const overdueTasks = tasks.filter((t) => t.status === "overdue");
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const totalToday = pendingTasks.length + doneTasks.length + overdueTasks.length;
  const completedCount = doneTasks.length;

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (task.status === "done") {
      updateTask(id, { status: "pending" });
    } else {
      updateTask(id, { status: "done", completedAt: new Date().toISOString() });
    }
  };

  const handleResolve = (task: TaskData) => {
    setCallTask(task);
    setShowCall(true);
  };

  const handleMarkDone = (taskId: string) => {
    updateTask(taskId, { status: "done", completedAt: new Date().toISOString() });
  };

  const progressPercent = totalToday > 0 ? Math.round((completedCount / totalToday) * 100) : 0;
  const userName = profile?.full_name?.split(" ")[0] || "User";
  const score = profile?.accountability_score ?? 50;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl lg:text-4xl text-[var(--foreground)]">
          Your Daily Focus
        </h1>
        <p className="text-sm text-[var(--nav-inactive)] mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}{" "}
          • {pendingTasks.length + overdueTasks.length} tasks remaining
        </p>
      </div>

      {/* Mobile progress bar */}
      <div className="lg:hidden mb-6">
        <div className="flex justify-between text-xs text-[var(--nav-inactive)] mb-2">
          <span className="uppercase tracking-wider font-medium text-[var(--foreground)]">
            Daily Accountability
          </span>
          <span>{progressPercent}% Completed</span>
        </div>
        <div className="w-full h-2 bg-[var(--card-border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-olive rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Overdue section */}
          {overdueTasks.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-overdue" />
                <h2 className="font-serif text-xl text-[var(--foreground)]">
                  Overdue
                </h2>
              </div>
              {overdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 mb-3 fade-in"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg text-[var(--foreground)]">
                        {task.title}
                      </h3>
                      <p className="text-sm text-[var(--nav-inactive)] mt-1">
                        {task.description}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-[var(--badge-overdue-text)] bg-[var(--badge-overdue-bg)] px-2.5 py-1 rounded-full flex-shrink-0 ml-4">
                      <AlertTriangle size={12} />
                      Overdue
                    </span>
                  </div>
                  <button
                    onClick={() => handleResolve(task)}
                    className="mt-4 bg-olive text-white text-sm px-5 py-2.5 rounded-lg hover:bg-olive-dark transition-colors"
                  >
                    Resolve Now
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Voice Scheduler */}
          <div className="mb-6">
            <VoiceScheduler />
          </div>

          {/* Today's Objectives */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl text-[var(--foreground)]">
                Today&apos;s Objectives
              </h2>
              <span className="text-sm text-[var(--nav-inactive)]">
                {completedCount} of {totalToday} Completed
              </span>
            </div>

            <div className="space-y-1">
              {pendingTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center justify-between w-full py-3 px-2 rounded-lg hover:bg-[var(--input-bg)] transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <Circle
                      size={20}
                      className="text-[var(--card-border)] group-hover:text-olive transition-colors"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm text-[var(--foreground)]">
                      {task.title}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--nav-inactive)] bg-[var(--input-bg)] px-2.5 py-1 rounded-md">
                    {task.dueTime}
                  </span>
                </button>
              ))}

              {doneTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center justify-between w-full py-3 px-2 rounded-lg hover:bg-[var(--input-bg)] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      size={20}
                      className="text-olive"
                      strokeWidth={2}
                    />
                    <span className="text-sm text-[var(--nav-inactive)] line-through">
                      {task.title}
                    </span>
                  </div>
                  <CheckCircle2
                    size={16}
                    className="text-olive"
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>

            <button className="flex items-center gap-2 text-sm text-[var(--nav-inactive)] mt-4 px-2 py-2 hover:text-[var(--foreground)] transition-colors">
              <Plus size={16} />
              Add new objective
            </button>
          </div>
        </div>

        {/* Right sidebar - insights (desktop only) */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 mb-4">
            <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
              Callio Insights
            </h3>

            {/* 3D Accountability Score */}
            <div className="text-center mb-6">
              <p className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] mb-3">
                Accountability Score
              </p>
              <div className="relative w-36 h-36 mx-auto">
                <Scene3DWrapper
                  style={{ width: "100%", height: "100%", background: "transparent" }}
                  cameraPosition={[0, 0, 3.5]}
                  cameraFov={50}
                >
                  <ScoreOrb3D score={score} color={isDark ? "#A78BFA" : "#4A5548"} />
                </Scene3DWrapper>
              </div>
              <p className="text-xs text-[var(--nav-inactive)] mt-2">
                Top 2% of users today
              </p>
            </div>

            {/* 3D Efficiency Waveform */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] mb-3">
                Efficiency Waveform
              </p>
              <div className="bg-[var(--input-bg)] rounded-lg overflow-hidden" style={{ height: 100 }}>
                <Scene3DWrapper
                  style={{ width: "100%", height: "100%", background: "transparent" }}
                  cameraPosition={[0, 0.2, 2.5]}
                  cameraFov={50}
                >
                  <WaveformVisualizer color={isDark ? "#A78BFA" : "#4A5548"} barCount={24} />
                </Scene3DWrapper>
              </div>
              <div className="flex justify-between text-[10px] text-[var(--nav-inactive)] mt-1 px-1">
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
            <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-3">
              AI Suggestions
            </h3>
            <div className="space-y-3">
              <div className="border-l-2 border-olive pl-3 py-1">
                <p className="text-xs text-[var(--foreground)] leading-relaxed">
                  &ldquo;You are most productive before noon. Consider moving
                  the &lsquo;Architecture Review&rsquo; to a 10 AM slot
                  tomorrow.&rdquo;
                </p>
              </div>
              <div className="border-l-2 border-olive pl-3 py-1">
                <p className="text-xs text-[var(--foreground)] leading-relaxed">
                  &ldquo;Deep work block detected. Silence notifications for the
                  next 45 minutes?&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 mt-4">
            <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-3">
              System Status
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--foreground)]">Neural Sync</span>
                <span className="w-2 h-2 rounded-full bg-success" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--foreground)]">Cloud Latency</span>
                <span className="text-[var(--nav-inactive)]">12ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AccountabilityCallModal
        task={callTask}
        isOpen={showCall}
        onClose={() => setShowCall(false)}
        onMarkDone={handleMarkDone}
        onSnooze={() => {}}
        userName={userName}
      />
    </div>
  );
}
