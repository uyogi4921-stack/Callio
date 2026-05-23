"use client";

import { useState } from "react";
import {
  AlertTriangle,
  MessageSquare,
  Phone,
  Shield,
  Send,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import {
  mockTasks,
  mockAccountabilityChat,
  mockAccountabilityHistory,
} from "@/lib/mockData";

export default function TaskDetailPage() {
  const task = mockTasks[0];
  const [messages, setMessages] = useState(mockAccountabilityChat);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        taskId: task.id,
        sender: "user" as const,
        message: newMessage,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setNewMessage("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(prev.length + 2),
          taskId: task.id,
          sender: "ai" as const,
          message:
            "I understand. Let me help you break this down into smaller, actionable steps. What's the single most important sub-task you can tackle in the next 30 minutes?",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1500);
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Back link */}
      <Link
        href="/focus"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--nav-inactive)] hover:text-[var(--foreground)] mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Focus
      </Link>

      {/* Task header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-[var(--nav-inactive)] mb-2">
          <span className="border border-[var(--card-border)] rounded-full px-2.5 py-0.5">
            Project X
          </span>
          <span className="border border-[var(--card-border)] rounded-full px-2.5 py-0.5">
            Deadline: Oct 24
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <h1 className="font-serif text-2xl lg:text-3xl text-[var(--foreground)]">
            {task.title}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white bg-olive px-3 py-1 rounded-full">
              High Priority
            </span>
            <span className="text-xs font-medium text-[var(--badge-overdue-text)] bg-[var(--badge-overdue-bg)] px-3 py-1 rounded-full">
              Overdue
            </span>
          </div>
        </div>

        {/* Mobile: action buttons */}
        <div className="flex gap-2 mt-4 lg:hidden">
          <button className="border border-[var(--card-border)] text-sm px-4 py-2 rounded-lg text-[var(--foreground)]">
            Edit Task
          </button>
          <button className="bg-olive text-white text-sm px-4 py-2 rounded-lg">
            Complete
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column: Accountability History */}
        <div className="lg:w-64 flex-shrink-0">
          <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
            Accountability History
          </h3>
          <div className="space-y-4">
            {mockAccountabilityHistory.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[var(--input-bg)] flex items-center justify-center">
                    {item.type === "sms" && (
                      <MessageSquare size={14} className="text-[var(--nav-inactive)]" />
                    )}
                    {item.type === "call" && (
                      <Phone size={14} className="text-[var(--nav-inactive)]" />
                    )}
                    {item.type === "lockout" && (
                      <Shield size={14} className="text-[var(--nav-inactive)]" />
                    )}
                  </div>
                  {i < mockAccountabilityHistory.length - 1 && (
                    <div className="w-px h-8 bg-[var(--card-border)] mt-1" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {item.title}
                  </p>
                  <p className="text-xs text-[var(--nav-inactive)] mt-0.5">
                    {item.description}
                  </p>
                  <p className="text-xs text-olive mt-1 italic">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Chat / Log of Interactions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium">
              Log of Interactions
            </h3>
            <span className="text-xs text-[var(--nav-inactive)] italic">
              Secure end-to-end focus session
            </span>
          </div>

          <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-olive flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                    <span className="text-white text-[10px]">AI</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl p-4 ${
                    msg.sender === "user"
                      ? "bg-olive text-white"
                      : "bg-[var(--card-bg)] border border-[var(--card-border)]"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  <p
                    className={`text-[10px] mt-2 ${
                      msg.sender === "user"
                        ? "text-white/60"
                        : "text-[var(--nav-inactive)]"
                    }`}
                  >
                    {msg.sender === "ai" ? "Callio AI" : "You"} •{" "}
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Reply to Callio AI..."
              className="flex-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--nav-inactive)] outline-none focus:border-olive"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-olive text-white p-3 rounded-xl hover:bg-olive-dark transition-colors"
            >
              <Send size={16} />
            </button>
          </div>

          {/* Quick replies */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={() => {
                setNewMessage("Draft the nudge email");
                setTimeout(sendMessage, 100);
              }}
              className="text-xs border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--nav-inactive)] hover:bg-[var(--input-bg)] transition-colors"
            >
              &ldquo;Draft the nudge email&rdquo;
            </button>
            <button
              onClick={() => {
                setNewMessage("Use estimates for now");
                setTimeout(sendMessage, 100);
              }}
              className="text-xs border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--nav-inactive)] hover:bg-[var(--input-bg)] transition-colors"
            >
              &ldquo;Use estimates for now&rdquo;
            </button>
          </div>
        </div>

        {/* Right column: Critical Status (desktop only) */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <h3 className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-4">
            Critical Status
          </h3>

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--foreground)]">
                Impact Score
              </span>
              <AlertTriangle size={16} className="text-overdue" />
            </div>
            <p className="text-4xl font-serif text-overdue">-14</p>
            <p className="text-xs text-[var(--nav-inactive)] mt-1">
              Overdue status is affecting your project momentum score.
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--foreground)]">
                Cognitive Load
              </span>
              <span className="text-[var(--nav-inactive)]">⚙</span>
            </div>
            <div className="w-full h-2 bg-[var(--card-border)] rounded-full mb-2">
              <div className="w-[78%] h-full bg-olive rounded-full" />
            </div>
            <div className="flex justify-between text-xs text-[var(--nav-inactive)]">
              <span>High (78%)</span>
              <span>Neutral: 40%</span>
            </div>
            <p className="text-xs text-[var(--nav-inactive)] mt-2">
              Attention residue detected from previous task. Take a 5min
              micro-break?
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4">
            <div className="h-24 bg-olive/10 rounded-lg mb-3 flex items-end justify-center">
              <div className="w-16 h-16 bg-olive/20 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-olive" />
              <span className="text-xs text-[var(--foreground)]">
                Focus Session Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
