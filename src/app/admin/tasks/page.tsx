"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { useTasks, type TaskData } from "@/lib/hooks/useTasks";

type SortField = "title" | "dueDate" | "priority" | "status" | "createdAt";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };
const STATUS_ORDER = { overdue: 0, pending: 1, in_progress: 2, done: 3 };

export default function AdminTasksPage() {
  const { tasks, updateTask, deleteTask } = useTasks();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = tasks
    .filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || t.status === filterStatus;
      const matchPriority = filterPriority === "all" || t.priority === filterPriority;
      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortField) {
        case "title":
          return dir * a.title.localeCompare(b.title);
        case "dueDate":
          return dir * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        case "priority":
          return dir * (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
        case "status":
          return dir * (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
        case "createdAt":
          return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        default:
          return 0;
      }
    });

  const handleStatusChange = (id: string, status: TaskData["status"]) => {
    updateTask(id, {
      status,
      ...(status === "done" ? { completedAt: new Date().toISOString() } : {}),
    });
  };

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-[var(--foreground)]">Tasks</h1>
        <p className="text-sm text-[var(--nav-inactive)] mt-1">
          Manage all tasks across the platform
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-[var(--foreground)]" },
          { label: "Done", value: stats.done, color: "text-olive" },
          { label: "Pending", value: stats.pending, color: "text-yellow-500" },
          { label: "Overdue", value: stats.overdue, color: "text-overdue" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 text-center"
          >
            <p className={`font-serif text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[var(--nav-inactive)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={16} className="text-[var(--nav-inactive)]" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 text-[var(--foreground)] placeholder:text-[var(--nav-inactive)]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "in_progress", "done", "overdue"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filterStatus === s
                  ? "border-[var(--foreground)] text-[var(--foreground)]"
                  : "border-[var(--card-border)] text-[var(--nav-inactive)]"
              }`}
            >
              {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "urgent", "high", "medium", "low"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                filterPriority === p
                  ? "border-[var(--foreground)] text-[var(--foreground)]"
                  : "border-[var(--card-border)] text-[var(--nav-inactive)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl overflow-hidden">
        {/* Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--card-border)]">
                {[
                  { key: "title" as SortField, label: "Task" },
                  { key: "status" as SortField, label: "Status" },
                  { key: "priority" as SortField, label: "Priority" },
                  { key: "dueDate" as SortField, label: "Due Date" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="text-left text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium px-5 py-3 cursor-pointer hover:text-[var(--foreground)] transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown size={12} className={sortField === col.key ? "text-olive" : ""} />
                    </span>
                  </th>
                ))}
                <th className="text-left text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium px-5 py-3">
                  Category
                </th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium px-5 py-3">
                  Source
                </th>
                <th className="text-right text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filtered.map((task) => (
                <tr key={task.id} className="hover:bg-[var(--input-bg)] transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm text-[var(--foreground)]">{task.title}</p>
                      <p className="text-xs text-[var(--nav-inactive)] mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value as TaskData["status"])
                      }
                      className="text-xs rounded-lg border border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--foreground)] px-2 py-1 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        task.priority === "urgent"
                          ? "text-[var(--badge-overdue-text)] bg-[var(--badge-overdue-bg)]"
                          : task.priority === "high"
                            ? "text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-400/10"
                            : task.priority === "medium"
                              ? "text-violet-700 bg-violet-100 dark:text-violet-400 dark:bg-violet-400/10"
                              : "text-[var(--nav-inactive)] bg-[var(--input-bg)]"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--foreground)]">
                    {new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    <span className="text-[var(--nav-inactive)]">{task.dueTime}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-[var(--nav-inactive)] bg-[var(--input-bg)] px-2 py-0.5 rounded-md">
                      {task.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-[var(--nav-inactive)] capitalize">
                      {task.source.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {task.status !== "done" && (
                        <button
                          onClick={() => handleStatusChange(task.id, "done")}
                          className="p-1.5 rounded-lg hover:bg-[var(--badge-priority-bg)] text-[var(--nav-inactive)] hover:text-olive transition-colors"
                          title="Mark done"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg hover:bg-[var(--badge-overdue-bg)] text-[var(--nav-inactive)] hover:text-overdue transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-[var(--card-border)]">
          {filtered.map((task) => (
            <div key={task.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  {task.status === "done" ? (
                    <CheckCircle2 size={18} className="text-olive flex-shrink-0 mt-0.5" />
                  ) : task.status === "overdue" ? (
                    <AlertTriangle size={18} className="text-overdue flex-shrink-0 mt-0.5" />
                  ) : (
                    <Clock size={18} className="text-[var(--nav-inactive)] flex-shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--foreground)]">{task.title}</p>
                    <p className="text-xs text-[var(--nav-inactive)] mt-0.5 line-clamp-1">
                      {task.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ml-2 ${
                    task.priority === "urgent"
                      ? "text-[var(--badge-overdue-text)] bg-[var(--badge-overdue-bg)]"
                      : task.priority === "high"
                        ? "text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-400/10"
                        : "text-[var(--nav-inactive)] bg-[var(--input-bg)]"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-xs text-[var(--nav-inactive)]">
                  <span>{task.category}</span>
                  <span>{task.dueTime}</span>
                  <span className="capitalize">{task.status}</span>
                </div>
                <div className="flex items-center gap-1">
                  {task.status !== "done" && (
                    <button
                      onClick={() => handleStatusChange(task.id, "done")}
                      className="p-1 text-[var(--nav-inactive)] hover:text-olive"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-[var(--nav-inactive)] hover:text-overdue"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-[var(--nav-inactive)]">
            No tasks match your filters
          </div>
        )}
      </div>
    </div>
  );
}
