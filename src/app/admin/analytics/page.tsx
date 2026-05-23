"use client";

import {
  TrendingUp,
  TrendingDown,
  Users,
  ListTodo,
  BookOpen,
  Clock,
  BarChart3,
  Calendar,
  Zap,
} from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";
import { useJournal } from "@/lib/hooks/useJournal";

export default function AdminAnalyticsPage() {
  const { tasks } = useTasks();
  const { entries } = useJournal();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const overdueTasks = tasks.filter((t) => t.status === "overdue").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const categoryBreakdown = tasks.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const priorityBreakdown = tasks.reduce(
    (acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const sourceBreakdown = tasks.reduce(
    (acc, t) => {
      acc[t.source] = (acc[t.source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const moodBreakdown = entries.reduce(
    (acc, e) => {
      const mood = e.mood || "none";
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const activityData = weekDays.map((day, i) => ({
    day,
    tasks: Math.floor(Math.random() * 5) + 1,
    journal: Math.floor(Math.random() * 3),
  }));

  const maxActivity = Math.max(...activityData.map((d) => d.tasks + d.journal));

  const priorityColors: Record<string, string> = {
    urgent: "bg-overdue",
    high: "bg-yellow-500",
    medium: "bg-blue-500",
    low: "bg-[var(--nav-inactive)]",
  };

  const sourceColors: Record<string, string> = {
    voice: "bg-olive",
    text: "bg-blue-500",
    ai_extracted: "bg-purple-500",
  };

  const moodColors: Record<string, string> = {
    motivated: "bg-olive",
    struggling: "bg-overdue",
    neutral: "bg-[var(--nav-inactive)]",
    happy: "bg-yellow-500",
    anxious: "bg-purple-500",
    none: "bg-[var(--card-border)]",
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl lg:text-4xl text-[var(--foreground)]">
          Analytics
        </h1>
        <p className="text-sm text-[var(--nav-inactive)] mt-1">
          Platform performance and user engagement metrics
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            trend: completionRate >= 50 ? "up" : "down",
            delta: completionRate >= 50 ? "+12%" : "-5%",
            icon: TrendingUp,
          },
          {
            label: "Active Tasks",
            value: (totalTasks - completedTasks).toString(),
            trend: "up",
            delta: "In progress",
            icon: ListTodo,
          },
          {
            label: "Avg. Score",
            value: "98",
            trend: "up",
            delta: "+3 pts",
            icon: Zap,
          },
          {
            label: "Journal Activity",
            value: entries.length.toString(),
            trend: "up",
            delta: "This month",
            icon: BookOpen,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 fade-in"
          >
            <div className="flex items-center justify-between mb-3">
              <kpi.icon size={18} className="text-[var(--nav-inactive)]" />
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  kpi.trend === "up"
                    ? "text-[var(--badge-priority-text)]"
                    : "text-[var(--badge-overdue-text)]"
                }`}
              >
                {kpi.trend === "up" ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {kpi.delta}
              </span>
            </div>
            <p className="font-serif text-2xl text-[var(--foreground)]">{kpi.value}</p>
            <p className="text-xs text-[var(--nav-inactive)] mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Activity Chart */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg text-[var(--foreground)]">
              Weekly Activity
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-olive" />
                <span className="text-[10px] text-[var(--nav-inactive)]">Tasks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                <span className="text-[10px] text-[var(--nav-inactive)]">Journal</span>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {activityData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-0.5" style={{ height: 120 }}>
                  <div className="w-full flex flex-col justify-end flex-1 gap-0.5">
                    <div
                      className="w-full bg-olive rounded-t-sm transition-all"
                      style={{
                        height: `${maxActivity > 0 ? (d.tasks / maxActivity) * 100 : 0}%`,
                        minHeight: d.tasks > 0 ? 4 : 0,
                      }}
                    />
                    <div
                      className="w-full bg-blue-500 rounded-b-sm transition-all"
                      style={{
                        height: `${maxActivity > 0 ? (d.journal / maxActivity) * 100 : 0}%`,
                        minHeight: d.journal > 0 ? 4 : 0,
                      }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-[var(--nav-inactive)]">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Status Breakdown */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="font-serif text-lg text-[var(--foreground)] mb-6">
            Task Status
          </h3>
          <div className="space-y-4">
            {[
              { label: "Completed", count: completedTasks, color: "bg-olive", pct: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0 },
              { label: "Pending", count: tasks.filter((t) => t.status === "pending").length, color: "bg-yellow-500", pct: totalTasks > 0 ? (tasks.filter((t) => t.status === "pending").length / totalTasks) * 100 : 0 },
              { label: "In Progress", count: tasks.filter((t) => t.status === "in_progress").length, color: "bg-blue-500", pct: totalTasks > 0 ? (tasks.filter((t) => t.status === "in_progress").length / totalTasks) * 100 : 0 },
              { label: "Overdue", count: overdueTasks, color: "bg-overdue", pct: totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--foreground)]">{item.label}</span>
                  <span className="text-[var(--nav-inactive)]">
                    {item.count} ({Math.round(item.pct)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[var(--input-bg)] rounded-full">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Priority Distribution */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
            By Priority
          </h3>
          <div className="space-y-3">
            {Object.entries(priorityBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([priority, count]) => (
                <div key={priority} className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${priorityColors[priority] || "bg-[var(--nav-inactive)]"}`}
                  />
                  <span className="text-xs text-[var(--foreground)] capitalize flex-1">
                    {priority}
                  </span>
                  <span className="text-xs font-medium text-[var(--foreground)]">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
            By Category
          </h3>
          <div className="space-y-3">
            {Object.entries(categoryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => (
                <div key={category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--foreground)]">{category}</span>
                    <span className="text-[var(--nav-inactive)]">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--input-bg)] rounded-full">
                    <div
                      className="h-full bg-olive rounded-full"
                      style={{
                        width: `${totalTasks > 0 ? (count / totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Source & Mood */}
        <div className="space-y-6">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
            <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
              Task Sources
            </h3>
            <div className="space-y-3">
              {Object.entries(sourceBreakdown).map(([source, count]) => (
                <div key={source} className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${sourceColors[source] || "bg-[var(--nav-inactive)]"}`}
                  />
                  <span className="text-xs text-[var(--foreground)] capitalize flex-1">
                    {source.replace("_", " ")}
                  </span>
                  <span className="text-xs font-medium text-[var(--foreground)]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
            <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
              Journal Moods
            </h3>
            <div className="space-y-3">
              {Object.entries(moodBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([mood, count]) => (
                  <div key={mood} className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full ${moodColors[mood] || "bg-[var(--nav-inactive)]"}`}
                    />
                    <span className="text-xs text-[var(--foreground)] capitalize flex-1">
                      {mood}
                    </span>
                    <span className="text-xs font-medium text-[var(--foreground)]">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
