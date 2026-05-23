"use client";

import {
  Users,
  ListTodo,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import { useTasks } from "@/lib/hooks/useTasks";
import { useJournal } from "@/lib/hooks/useJournal";
import { useAuth } from "@/lib/hooks/useAuth";

export default function AdminDashboard() {
  const { tasks } = useTasks();
  const { entries } = useJournal();
  const { profile } = useAuth();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const overdueTasks = tasks.filter((t) => t.status === "overdue").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const highPriorityTasks = tasks.filter(
    (t) => (t.priority === "high" || t.priority === "urgent") && t.status !== "done"
  );

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const stats = [
    {
      label: "Total Users",
      value: "1",
      change: "+0%",
      trend: "up" as const,
      icon: Users,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
    {
      label: "Total Tasks",
      value: totalTasks.toString(),
      change: `${completedTasks} done`,
      trend: "up" as const,
      icon: ListTodo,
      color: "text-olive",
      bg: "bg-olive/10",
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      change: completionRate >= 50 ? "On track" : "Needs attention",
      trend: completionRate >= 50 ? ("up" as const) : ("down" as const),
      icon: TrendingUp,
      color: "text-[var(--badge-priority-text)]",
      bg: "bg-[var(--badge-priority-bg)]",
    },
    {
      label: "Journal Entries",
      value: entries.length.toString(),
      change: "All time",
      trend: "up" as const,
      icon: BookOpen,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl lg:text-4xl text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="text-sm text-[var(--nav-inactive)] mt-1">
          System overview and key metrics
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 fade-in"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  stat.trend === "up"
                    ? "text-[var(--badge-priority-text)]"
                    : "text-[var(--badge-overdue-text)]"
                }`}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {stat.change}
              </span>
            </div>
            <p className="font-serif text-2xl text-[var(--foreground)]">{stat.value}</p>
            <p className="text-xs text-[var(--nav-inactive)] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl">
            <div className="flex items-center justify-between p-5 border-b border-[var(--card-border)]">
              <h2 className="font-serif text-lg text-[var(--foreground)]">Recent Tasks</h2>
              <Link
                href="/admin/tasks"
                className="text-xs text-olive hover:text-olive-dark transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="divide-y divide-[var(--card-border)]">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {task.status === "done" ? (
                      <CheckCircle2 size={18} className="text-olive flex-shrink-0" />
                    ) : task.status === "overdue" ? (
                      <AlertTriangle size={18} className="text-overdue flex-shrink-0" />
                    ) : (
                      <Clock size={18} className="text-[var(--nav-inactive)] flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--foreground)] truncate">{task.title}</p>
                      <p className="text-xs text-[var(--nav-inactive)]">
                        {task.category} &middot; {task.priority}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-3 ${
                      task.status === "done"
                        ? "text-[var(--badge-priority-text)] bg-[var(--badge-priority-bg)]"
                        : task.status === "overdue"
                          ? "text-[var(--badge-overdue-text)] bg-[var(--badge-overdue-bg)]"
                          : "text-[var(--nav-inactive)] bg-[var(--input-bg)]"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <div className="p-8 text-center text-sm text-[var(--nav-inactive)]">
                  No tasks yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Alerts */}
          {overdueTasks > 0 && (
            <div className="bg-[var(--badge-overdue-bg)] border border-overdue/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-overdue" />
                <h3 className="text-sm font-medium text-[var(--badge-overdue-text)]">
                  Overdue Alert
                </h3>
              </div>
              <p className="text-xs text-[var(--badge-overdue-text)]/80">
                {overdueTasks} task{overdueTasks !== 1 ? "s" : ""} overdue and require attention.
              </p>
              <Link
                href="/admin/tasks"
                className="inline-block mt-3 text-xs font-medium text-[var(--badge-overdue-text)] hover:underline"
              >
                Review Now
              </Link>
            </div>
          )}

          {/* High Priority */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
            <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-3">
              High Priority
            </h3>
            <div className="space-y-2">
              {highPriorityTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.priority === "urgent" ? "bg-overdue" : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-xs text-[var(--foreground)] truncate">{task.title}</span>
                </div>
              ))}
              {highPriorityTasks.length === 0 && (
                <p className="text-xs text-[var(--nav-inactive)]">No high priority tasks</p>
              )}
            </div>
          </div>

          {/* Task Breakdown */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
            <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
              Task Breakdown
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--foreground)]">Completed</span>
                  <span className="text-[var(--nav-inactive)]">{completedTasks}</span>
                </div>
                <div className="w-full h-2 bg-[var(--input-bg)] rounded-full">
                  <div
                    className="h-full bg-olive rounded-full transition-all"
                    style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--foreground)]">Pending</span>
                  <span className="text-[var(--nav-inactive)]">{pendingTasks}</span>
                </div>
                <div className="w-full h-2 bg-[var(--input-bg)] rounded-full">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: `${totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--foreground)]">Overdue</span>
                  <span className="text-[var(--nav-inactive)]">{overdueTasks}</span>
                </div>
                <div className="w-full h-2 bg-[var(--input-bg)] rounded-full">
                  <div
                    className="h-full bg-overdue rounded-full transition-all"
                    style={{ width: `${totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Journal */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium">
                Recent Journal
              </h3>
              <Link
                href="/admin/journal"
                className="text-xs text-olive hover:text-olive-dark transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="border-l-2 border-[var(--card-border)] pl-3">
                  <p className="text-xs font-medium text-[var(--foreground)] truncate">
                    {entry.title}
                  </p>
                  <p className="text-[10px] text-[var(--nav-inactive)] mt-0.5">
                    {entry.mood ? `${entry.mood} mood` : "No mood"} &middot; {entry.readTime}
                  </p>
                </div>
              ))}
              {recentEntries.length === 0 && (
                <p className="text-xs text-[var(--nav-inactive)]">No journal entries</p>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
            <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-3">
              System Status
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--foreground)]">Database</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-[var(--nav-inactive)]">Connected</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--foreground)]">Auth Service</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-[var(--nav-inactive)]">Active</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--foreground)]">AI Engine</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-[var(--nav-inactive)]">Online</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--foreground)]">API Latency</span>
                <span className="text-[var(--nav-inactive)]">12ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
