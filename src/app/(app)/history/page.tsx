"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Calendar,
  BarChart3,
  Target,
  Flame,
} from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";
import { useAuth } from "@/lib/hooks/useAuth";

export default function ReportPage() {
  const { tasks } = useTasks();
  const { profile } = useAuth();
  const [view, setView] = useState<"daily" | "weekly">("daily");

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, typeof tasks> = {};
    for (const t of tasks) {
      const d = t.dueDate;
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(t);
    }
    return grouped;
  }, [tasks]);

  // Get dates sorted descending
  const sortedDates = useMemo(
    () => Object.keys(tasksByDate).sort((a, b) => b.localeCompare(a)),
    [tasksByDate]
  );

  // Weekly grouping
  const weeklyData = useMemo(() => {
    const weeks: { label: string; dates: string[]; tasks: typeof tasks }[] = [];
    const datesCopy = [...sortedDates];

    while (datesCopy.length > 0) {
      const batch = datesCopy.splice(0, 7);
      const start = batch[batch.length - 1];
      const end = batch[0];
      const startLabel = new Date(start + "T00:00:00").toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" }
      );
      const endLabel = new Date(end + "T00:00:00").toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" }
      );
      const weekTasks = batch.flatMap((d) => tasksByDate[d] || []);
      weeks.push({
        label: `${startLabel} - ${endLabel}`,
        dates: batch,
        tasks: weekTasks,
      });
    }
    return weeks;
  }, [sortedDates, tasksByDate]);

  // Overall stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const overdueTasks = tasks.filter((t) => t.status === "overdue").length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Accountability score calculation
  const accountabilityScore = useMemo(() => {
    if (totalTasks === 0) return 0;
    // 70% weight on completion rate, 15% on no overdues, 15% on streak
    const completionPart = (completedTasks / totalTasks) * 70;
    const overduePenalty =
      totalTasks > 0
        ? Math.max(0, 15 - (overdueTasks / totalTasks) * 15)
        : 15;
    const streakBonus = Math.min(15, (profile?.streak_days ?? 0) * 2);
    return Math.round(completionPart + overduePenalty + streakBonus);
  }, [totalTasks, completedTasks, overdueTasks, profile?.streak_days]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-[var(--foreground)]">
            Report
          </h1>
          <p className="text-sm text-[var(--nav-inactive)] mt-1">
            Your productivity at a glance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["daily", "weekly"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                view === v
                  ? "border-[var(--foreground)] text-[var(--foreground)]"
                  : "border-[var(--card-border)] text-[var(--nav-inactive)]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-olive" />
            <span className="text-xs text-[var(--nav-inactive)] uppercase tracking-wider">
              Score
            </span>
          </div>
          <p className="font-serif text-2xl text-[var(--foreground)]">
            {accountabilityScore}
          </p>
          <p className="text-[10px] text-[var(--nav-inactive)] mt-1">
            out of 100
          </p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-olive" />
            <span className="text-xs text-[var(--nav-inactive)] uppercase tracking-wider">
              Done
            </span>
          </div>
          <p className="font-serif text-2xl text-[var(--foreground)]">
            {completedTasks}
          </p>
          <p className="text-[10px] text-[var(--nav-inactive)] mt-1">
            of {totalTasks} tasks
          </p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-olive" />
            <span className="text-xs text-[var(--nav-inactive)] uppercase tracking-wider">
              Rate
            </span>
          </div>
          <p className="font-serif text-2xl text-[var(--foreground)]">
            {completionRate}%
          </p>
          <p className="text-[10px] text-[var(--nav-inactive)] mt-1">
            completion
          </p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-orange-400" />
            <span className="text-xs text-[var(--nav-inactive)] uppercase tracking-wider">
              Streak
            </span>
          </div>
          <p className="font-serif text-2xl text-[var(--foreground)]">
            {profile?.streak_days ?? 0}
          </p>
          <p className="text-[10px] text-[var(--nav-inactive)] mt-1">days</p>
        </div>
      </div>

      {/* How score works */}
      <div className="bg-[var(--tag-bg)] dark:bg-[var(--tag-bg-dark)] rounded-xl p-4 mb-8">
        <p className="text-xs font-medium text-[var(--foreground)] mb-2 flex items-center gap-1.5">
          <BarChart3 size={13} />
          How your Accountability Score works
        </p>
        <div className="space-y-1.5 text-xs text-[var(--nav-inactive)]">
          <p>
            <span className="text-[var(--foreground)] font-medium">70%</span>{" "}
            &mdash; Task completion rate (completed / total)
          </p>
          <p>
            <span className="text-[var(--foreground)] font-medium">15%</span>{" "}
            &mdash; No overdue tasks (penalty for each overdue task)
          </p>
          <p>
            <span className="text-[var(--foreground)] font-medium">15%</span>{" "}
            &mdash; Streak bonus (2 points per consecutive day, max 15)
          </p>
        </div>
      </div>

      {/* Daily view */}
      {view === "daily" &&
        sortedDates.map((date) => {
          const dayTasks = tasksByDate[date];
          const dayDone = dayTasks.filter((t) => t.status === "done").length;
          const dayTotal = dayTasks.length;
          const dayRate =
            dayTotal > 0 ? Math.round((dayDone / dayTotal) * 100) : 0;

          return (
            <div key={date} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[var(--nav-inactive)]" />
                  <h2 className="text-sm font-medium text-[var(--foreground)]">
                    {formatDate(date)}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--nav-inactive)]">
                    {dayDone}/{dayTotal}
                  </span>
                  <div className="w-20 h-1.5 bg-[var(--card-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-olive rounded-full transition-all duration-500"
                      style={{ width: `${dayRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[var(--foreground)] w-8 text-right">
                    {dayRate}%
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {task.status === "done" ? (
                        <CheckCircle2
                          size={16}
                          className="text-olive flex-shrink-0"
                        />
                      ) : task.status === "overdue" ? (
                        <XCircle
                          size={16}
                          className="text-overdue flex-shrink-0"
                        />
                      ) : (
                        <Clock
                          size={16}
                          className="text-[var(--nav-inactive)] flex-shrink-0"
                        />
                      )}
                      <span
                        className={`text-sm ${
                          task.status === "done"
                            ? "text-[var(--nav-inactive)] line-through"
                            : "text-[var(--foreground)]"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--nav-inactive)] flex-shrink-0 ml-2">
                      {task.dueTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {/* Weekly view */}
      {view === "weekly" &&
        weeklyData.map((week, i) => {
          const weekDone = week.tasks.filter((t) => t.status === "done").length;
          const weekTotal = week.tasks.length;
          const weekRate =
            weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;
          const weekOverdue = week.tasks.filter(
            (t) => t.status === "overdue"
          ).length;

          return (
            <div
              key={i}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 mb-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-[var(--foreground)]">
                  {week.label}
                </h2>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    weekRate >= 80
                      ? "text-[var(--badge-priority-text)] bg-[var(--badge-priority-bg)]"
                      : weekRate >= 50
                        ? "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20"
                        : "text-[var(--badge-overdue-text)] bg-[var(--badge-overdue-bg)]"
                  }`}
                >
                  {weekRate}% completed
                </span>
              </div>

              {/* Visual bar breakdown */}
              <div className="w-full h-3 bg-[var(--card-border)] rounded-full overflow-hidden mb-4 flex">
                {weekTotal > 0 && (
                  <>
                    <div
                      className="h-full bg-olive transition-all duration-500"
                      style={{
                        width: `${(weekDone / weekTotal) * 100}%`,
                      }}
                    />
                    <div
                      className="h-full bg-overdue transition-all duration-500"
                      style={{
                        width: `${(weekOverdue / weekTotal) * 100}%`,
                      }}
                    />
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-serif text-xl text-[var(--foreground)]">
                    {weekTotal}
                  </p>
                  <p className="text-[10px] text-[var(--nav-inactive)] uppercase tracking-wider">
                    Total
                  </p>
                </div>
                <div>
                  <p className="font-serif text-xl text-olive">{weekDone}</p>
                  <p className="text-[10px] text-[var(--nav-inactive)] uppercase tracking-wider">
                    Completed
                  </p>
                </div>
                <div>
                  <p className="font-serif text-xl text-overdue">
                    {weekOverdue}
                  </p>
                  <p className="text-[10px] text-[var(--nav-inactive)] uppercase tracking-wider">
                    Overdue
                  </p>
                </div>
              </div>
            </div>
          );
        })}

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="text-center py-16 text-[var(--nav-inactive)]">
          <BarChart3 size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No tasks yet. Start adding tasks to see your report.</p>
        </div>
      )}
    </div>
  );
}
