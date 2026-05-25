"use client";

import { useState } from "react";
import {
  MessageSquare,
  Phone,
  Mail,
  Lock,
  Bot,
  User,
  Filter,
} from "lucide-react";
import {
  mockAccountabilityChat,
  mockAccountabilityHistory,
} from "@/lib/mockData";

const LOG_TYPE_ICONS: Record<string, typeof MessageSquare> = {
  chat: MessageSquare,
  call: Phone,
  sms: Mail,
  lockout: Lock,
};

const LOG_TYPE_COLORS: Record<string, string> = {
  chat: "bg-violet-400/10 text-violet-400",
  call: "bg-olive/10 text-olive",
  sms: "bg-purple-500/10 text-purple-500",
  lockout: "bg-overdue/10 text-overdue",
};

export default function AdminAccountabilityPage() {
  const [filterType, setFilterType] = useState<string>("all");

  const chatLogs = mockAccountabilityChat;
  const historyLogs = mockAccountabilityHistory;

  const filteredHistory =
    filterType === "all"
      ? historyLogs
      : historyLogs.filter((l) => l.type === filterType);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-[var(--foreground)]">
          Accountability Logs
        </h1>
        <p className="text-sm text-[var(--nav-inactive)] mt-1">
          AI interactions, calls, and enforcement actions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Chat Messages",
            value: chatLogs.length,
            icon: MessageSquare,
            color: "text-violet-400",
            bg: "bg-violet-400/10",
          },
          {
            label: "Voice Calls",
            value: historyLogs.filter((l) => l.type === "call").length,
            icon: Phone,
            color: "text-olive",
            bg: "bg-olive/10",
          },
          {
            label: "SMS Reminders",
            value: historyLogs.filter((l) => l.type === "sms").length,
            icon: Mail,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
          {
            label: "Lockouts",
            value: historyLogs.filter((l) => l.type === "lockout").length,
            icon: Lock,
            color: "text-overdue",
            bg: "bg-overdue/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon size={20} className={stat.color} />
              </div>
              <div>
                <p className="font-serif text-2xl text-[var(--foreground)]">
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--nav-inactive)]">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chat Thread */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl">
          <div className="p-5 border-b border-[var(--card-border)]">
            <h2 className="font-serif text-lg text-[var(--foreground)]">
              Recent AI Conversation
            </h2>
            <p className="text-xs text-[var(--nav-inactive)] mt-0.5">
              Task: Complete Hackathon Presentation
            </p>
          </div>
          <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
            {chatLogs.map((log) => (
              <div
                key={log.id}
                className={`flex gap-3 ${
                  log.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    log.sender === "ai"
                      ? "bg-olive/10 text-olive"
                      : "bg-violet-400/10 text-violet-400"
                  }`}
                >
                  {log.sender === "ai" ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div
                  className={`flex-1 ${
                    log.sender === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`inline-block text-xs leading-relaxed p-3 rounded-xl max-w-[85%] ${
                      log.sender === "ai"
                        ? "bg-[var(--input-bg)] text-[var(--foreground)] text-left"
                        : "bg-olive text-white text-left"
                    }`}
                  >
                    {log.message}
                  </div>
                  <p className="text-[10px] text-[var(--nav-inactive)] mt-1">
                    {log.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity History */}
        <div>
          {/* Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all", "sms", "call", "lockout"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                  filterType === type
                    ? "border-[var(--foreground)] text-[var(--foreground)]"
                    : "border-[var(--card-border)] text-[var(--nav-inactive)]"
                }`}
              >
                {type === "all" ? "All Types" : type.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl">
            <div className="p-5 border-b border-[var(--card-border)]">
              <h2 className="font-serif text-lg text-[var(--foreground)]">
                Enforcement History
              </h2>
            </div>
            <div className="divide-y divide-[var(--card-border)]">
              {filteredHistory.map((log, i) => {
                const Icon = LOG_TYPE_ICONS[log.type] || MessageSquare;
                const colorClass = LOG_TYPE_COLORS[log.type] || LOG_TYPE_COLORS.chat;
                return (
                  <div key={i} className="flex items-start gap-4 p-5">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {log.title}
                      </p>
                      <p className="text-xs text-[var(--nav-inactive)] mt-0.5">
                        {log.description}
                      </p>
                      <p className="text-[10px] text-[var(--nav-inactive)] mt-1">
                        {log.time}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-medium flex-shrink-0 ${colorClass}`}
                    >
                      {log.type}
                    </span>
                  </div>
                );
              })}
              {filteredHistory.length === 0 && (
                <div className="p-8 text-center text-sm text-[var(--nav-inactive)]">
                  No logs match the selected filter
                </div>
              )}
            </div>
          </div>

          {/* Escalation Rules */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 mt-6">
            <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-3">
              Escalation Rules
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-olive/10 text-olive text-xs flex items-center justify-center font-medium">
                    1
                  </span>
                  <span className="text-xs text-[var(--foreground)]">
                    SMS reminder at due time
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-success" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-yellow-500/10 text-yellow-500 text-xs flex items-center justify-center font-medium">
                    2
                  </span>
                  <span className="text-xs text-[var(--foreground)]">
                    AI voice call after 30 min overdue
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-success" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-overdue/10 text-overdue text-xs flex items-center justify-center font-medium">
                    3
                  </span>
                  <span className="text-xs text-[var(--foreground)]">
                    Browser lockout after 2 hours overdue
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-success" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
