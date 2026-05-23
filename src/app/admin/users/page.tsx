"use client";

import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  UserCog,
  Mail,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

interface MockUser {
  id: string;
  full_name: string;
  email: string;
  plan: "free" | "pro";
  accountability_score: number;
  streak_days: number;
  status: "active" | "suspended" | "inactive";
  created_at: string;
  tasks_count: number;
  role: "user" | "admin";
}

const MOCK_USERS: MockUser[] = [
  {
    id: "1",
    full_name: "Alex Rivers",
    email: "alex@example.com",
    plan: "pro",
    accountability_score: 98,
    streak_days: 7,
    status: "active",
    created_at: "2024-09-15T10:00:00Z",
    tasks_count: 9,
    role: "admin",
  },
  {
    id: "2",
    full_name: "Sarah Chen",
    email: "sarah@example.com",
    plan: "pro",
    accountability_score: 85,
    streak_days: 12,
    status: "active",
    created_at: "2024-10-01T08:00:00Z",
    tasks_count: 15,
    role: "user",
  },
  {
    id: "3",
    full_name: "Marcus Johnson",
    email: "marcus@example.com",
    plan: "free",
    accountability_score: 62,
    streak_days: 3,
    status: "active",
    created_at: "2024-10-10T14:00:00Z",
    tasks_count: 6,
    role: "user",
  },
  {
    id: "4",
    full_name: "Emily Park",
    email: "emily@example.com",
    plan: "pro",
    accountability_score: 91,
    streak_days: 21,
    status: "active",
    created_at: "2024-08-20T09:00:00Z",
    tasks_count: 24,
    role: "user",
  },
  {
    id: "5",
    full_name: "David Kim",
    email: "david@example.com",
    plan: "free",
    accountability_score: 45,
    streak_days: 0,
    status: "inactive",
    created_at: "2024-10-18T16:00:00Z",
    tasks_count: 2,
    role: "user",
  },
  {
    id: "6",
    full_name: "Lisa Wang",
    email: "lisa@example.com",
    plan: "free",
    accountability_score: 73,
    streak_days: 5,
    status: "suspended",
    created_at: "2024-09-28T11:00:00Z",
    tasks_count: 8,
    role: "user",
  },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "free" | "pro">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended" | "inactive">("all");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const filtered = MOCK_USERS.filter((u) => {
    const matchSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === "all" || u.plan === filterPlan;
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-[var(--foreground)]">Users</h1>
          <p className="text-sm text-[var(--nav-inactive)] mt-1">
            {MOCK_USERS.length} registered users
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={16} className="text-[var(--nav-inactive)]" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 text-[var(--foreground)] placeholder:text-[var(--nav-inactive)]"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "free", "pro"] as const).map((plan) => (
            <button
              key={plan}
              onClick={() => setFilterPlan(plan)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                filterPlan === plan
                  ? "border-[var(--foreground)] text-[var(--foreground)]"
                  : "border-[var(--card-border)] text-[var(--nav-inactive)]"
              }`}
            >
              {plan}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["all", "active", "suspended", "inactive"] as const).map((status) => (
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

      {/* Users Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--card-border)]">
                <th className="text-left text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium px-5 py-3">
                  User
                </th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium px-5 py-3">
                  Plan
                </th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium px-5 py-3">
                  Score
                </th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium px-5 py-3">
                  Streak
                </th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium px-5 py-3">
                  Tasks
                </th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium px-5 py-3">
                  Status
                </th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium px-5 py-3">
                  Joined
                </th>
                <th className="text-right text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[var(--input-bg)] transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-olive-muted flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {user.full_name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-[var(--foreground)]">
                            {user.full_name}
                          </p>
                          {user.role === "admin" && (
                            <ShieldCheck size={14} className="text-olive" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--nav-inactive)]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.plan === "pro"
                          ? "text-olive bg-olive/10"
                          : "text-[var(--nav-inactive)] bg-[var(--input-bg)]"
                      }`}
                    >
                      {user.plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[var(--input-bg)] rounded-full">
                        <div
                          className={`h-full rounded-full ${
                            user.accountability_score >= 80
                              ? "bg-olive"
                              : user.accountability_score >= 50
                                ? "bg-yellow-500"
                                : "bg-overdue"
                          }`}
                          style={{ width: `${user.accountability_score}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--foreground)]">
                        {user.accountability_score}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--foreground)]">
                    {user.streak_days}d
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--foreground)]">
                    {user.tasks_count}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`flex items-center gap-1 text-xs font-medium ${
                        user.status === "active"
                          ? "text-[var(--badge-priority-text)]"
                          : user.status === "suspended"
                            ? "text-[var(--badge-overdue-text)]"
                            : "text-[var(--nav-inactive)]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.status === "active"
                            ? "bg-success"
                            : user.status === "suspended"
                              ? "bg-overdue"
                              : "bg-[var(--nav-inactive)]"
                        }`}
                      />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--nav-inactive)]">
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() =>
                        setSelectedUser(selectedUser === user.id ? null : user.id)
                      }
                      className="p-1.5 rounded-lg hover:bg-[var(--input-bg)] text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {selectedUser === user.id && (
                      <div className="absolute right-8 mt-1 w-40 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-lg z-10 py-1">
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors">
                          <UserCog size={14} />
                          Edit User
                        </button>
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors">
                          <Mail size={14} />
                          Send Email
                        </button>
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors">
                          <Shield size={14} />
                          Change Role
                        </button>
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-overdue hover:bg-[var(--input-bg)] transition-colors">
                          <Ban size={14} />
                          Suspend
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-[var(--card-border)]">
          {filtered.map((user) => (
            <div key={user.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-olive-muted flex items-center justify-center text-white text-sm font-medium">
                    {user.full_name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {user.full_name}
                      </p>
                      {user.role === "admin" && (
                        <ShieldCheck size={14} className="text-olive" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--nav-inactive)]">{user.email}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.plan === "pro"
                      ? "text-olive bg-olive/10"
                      : "text-[var(--nav-inactive)] bg-[var(--input-bg)]"
                  }`}
                >
                  {user.plan.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[var(--nav-inactive)]">
                <span>Score: {user.accountability_score}</span>
                <span>Streak: {user.streak_days}d</span>
                <span>Tasks: {user.tasks_count}</span>
                <span
                  className={`flex items-center gap-1 ${
                    user.status === "active"
                      ? "text-[var(--badge-priority-text)]"
                      : user.status === "suspended"
                        ? "text-[var(--badge-overdue-text)]"
                        : ""
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      user.status === "active"
                        ? "bg-success"
                        : user.status === "suspended"
                          ? "bg-overdue"
                          : "bg-[var(--nav-inactive)]"
                    }`}
                  />
                  {user.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-[var(--nav-inactive)]">
            No users match your filters
          </div>
        )}
      </div>
    </div>
  );
}
