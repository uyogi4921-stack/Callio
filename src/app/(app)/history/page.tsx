"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, Filter } from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";
import Link from "next/link";

export default function HistoryPage() {
  const { tasks: allTasks } = useTasks();
  const [filterStatus, setFilterStatus] = useState<"all" | "done" | "overdue">(
    "all"
  );
  const filtered =
    filterStatus === "all"
      ? allTasks
      : allTasks.filter((t) => t.status === filterStatus);

  const groupedByDate = filtered.reduce(
    (acc, task) => {
      const date = task.dueDate;
      if (!acc[date]) acc[date] = [];
      acc[date].push(task);
      return acc;
    },
    {} as Record<string, typeof filtered>
  );

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-[var(--foreground)]">
            History
          </h1>
          <p className="text-sm text-[var(--nav-inactive)] mt-1">
            Your accountability trail
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "done", "overdue"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                filterStatus === status
                  ? "border-[var(--foreground)] text-[var(--foreground)]"
                  : "border-[var(--card-border)] text-[var(--nav-inactive)]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {Object.entries(groupedByDate).map(([date, tasks]) => (
        <div key={date} className="mb-8">
          <h2 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-3">
            {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <div
                key={task.id}
              >
                <Link
                  href={`/tasks/${task.id}`}
                  className="flex items-center justify-between bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 hover:border-olive/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {task.status === "done" ? (
                      <CheckCircle2
                        size={20}
                        className="text-olive flex-shrink-0"
                      />
                    ) : task.status === "overdue" ? (
                      <XCircle
                        size={20}
                        className="text-overdue flex-shrink-0"
                      />
                    ) : (
                      <Clock
                        size={20}
                        className="text-[var(--nav-inactive)] flex-shrink-0"
                      />
                    )}
                    <div>
                      <p
                        className={`text-sm ${
                          task.status === "done"
                            ? "text-[var(--nav-inactive)] line-through"
                            : "text-[var(--foreground)]"
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-[var(--nav-inactive)] mt-0.5">
                        {task.category} • {task.dueTime}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      task.status === "done"
                        ? "text-[var(--badge-priority-text)] bg-[var(--badge-priority-bg)]"
                        : task.status === "overdue"
                          ? "text-[var(--badge-overdue-text)] bg-[var(--badge-overdue-bg)]"
                          : "text-[var(--nav-inactive)] bg-[var(--input-bg)]"
                    }`}
                  >
                    {task.status}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
