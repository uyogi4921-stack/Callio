"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { Mic, Clock, CheckCircle, X } from "lucide-react";
import type { TaskData } from "@/lib/hooks/useTasks";

const Scene3DWrapper = dynamic(() => import("@/components/3d/Scene3DWrapper"), {
  ssr: false,
});
const FloatingOrb = dynamic(() => import("@/components/3d/FloatingOrb"), {
  ssr: false,
});

interface AccountabilityCallModalProps {
  task: TaskData | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkDone: (taskId: string) => void;
  onSnooze: (taskId: string) => void;
  userName: string;
}

export default function AccountabilityCallModal({
  task,
  isOpen,
  onClose,
  onMarkDone,
  onSnooze,
  userName,
}: AccountabilityCallModalProps) {
  const [phase, setPhase] = useState<"ringing" | "active" | "responding">(
    "ringing"
  );
  const [sessionTime, setSessionTime] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setPhase("ringing");
      setSessionTime(0);
      setUserResponse("");
      return;
    }
    const timer = setInterval(() => setSessionTime((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleAnswer = () => setPhase("active");

  if (!task || !mounted || !isOpen) return null;

  const modal = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="relative flex flex-col items-center w-full max-w-2xl px-6 h-full justify-center">
        <div className="absolute top-6 left-6">
          <span className="font-serif text-sm text-[var(--foreground)]">
            Callio AI
          </span>
        </div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors"
        >
          <X size={20} />
        </button>

        {phase === "ringing" && (
          <div className="flex flex-col items-center text-center animate-[fadeIn_0.3s_ease-in-out]">
            <div className="w-32 h-32 mb-8">
              <Scene3DWrapper
                style={{ width: "100%", height: "100%", background: "transparent" }}
              >
                <FloatingOrb color="#4A5548" pulseSpeed={1.5} size={1.2} intensity={0.9} />
              </Scene3DWrapper>
            </div>

            <h1 className="font-serif text-4xl lg:text-5xl text-[var(--foreground)] mb-3">
              Incoming Accountability
            </h1>
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--nav-inactive)] mb-12">
              Sentinel Observe Mode Active
            </p>

            <div className="bg-[var(--card-bg)] rounded-xl p-6 max-w-lg w-full mb-12 border border-[var(--card-border)]">
              <div className="flex items-start gap-3">
                <span className="text-lg">🤖</span>
                <div>
                  <p className="text-sm text-[var(--foreground)] leading-relaxed">
                    {userName}, the {task.title.toLowerCase()} was due{" "}
                    {task.dueTime}. Your focus metrics indicate significant
                    divergence into non-productive domains. We need to reconcile
                    this drift now.
                  </p>
                  <p className="text-xs text-[var(--nav-inactive)] mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-olive inline-block" />
                    Analyzing vocal patterns...
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  onSnooze(task.id);
                  onClose();
                }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-14 h-14 rounded-full border-2 border-[var(--card-border)] flex items-center justify-center hover:bg-[var(--input-bg)] transition-colors">
                  <Clock size={20} className="text-[var(--nav-inactive)]" />
                </div>
                <span className="text-xs text-[var(--nav-inactive)]">
                  Snooze
                </span>
                <span className="text-xs text-overdue font-medium">
                  -10 pts
                </span>
              </button>

              <button
                onClick={handleAnswer}
                className="flex items-center gap-2 bg-olive text-white px-8 py-4 rounded-xl font-medium hover:bg-olive-dark transition-colors"
              >
                <Mic size={18} />
                ANSWER & SPEAK
              </button>

              <button
                onClick={() => {
                  onMarkDone(task.id);
                  onClose();
                }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-14 h-14 rounded-full border-2 border-[var(--card-border)] flex items-center justify-center hover:bg-[var(--input-bg)] transition-colors">
                  <CheckCircle
                    size={20}
                    className="text-[var(--nav-inactive)]"
                  />
                </div>
                <span className="text-xs text-[var(--nav-inactive)]">
                  Mark Done
                </span>
                <span className="text-xs text-success font-medium">
                  +25 pts
                </span>
              </button>
            </div>
          </div>
        )}

        {phase === "active" && (
          <div className="flex flex-col items-center w-full max-w-lg animate-[fadeIn_0.3s_ease-in-out] relative">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-24 h-24 opacity-40 pointer-events-none">
              <Scene3DWrapper
                style={{ width: "100%", height: "100%", background: "transparent" }}
              >
                <FloatingOrb color="#4A5548" pulseSpeed={0.8} size={0.8} intensity={0.5} />
              </Scene3DWrapper>
            </div>
            <h2 className="font-serif text-2xl text-[var(--foreground)] mb-2">
              Accountability Session
            </h2>
            <p className="text-xs text-[var(--nav-inactive)] mb-8">
              Session active — speak freely
            </p>

            <div className="w-full space-y-4 mb-8">
              <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--card-border)]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-olive flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">AI</span>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">
                      {userName}, your task &ldquo;{task.title}&rdquo; is
                      overdue. What happened? What blocked you from completing
                      it?
                    </p>
                    <p className="text-xs text-[var(--nav-inactive)] mt-1">
                      Callio AI &bull; Just now
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex gap-2">
              <input
                type="text"
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Reply to Callio AI..."
                className="flex-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--nav-inactive)] outline-none focus:border-olive"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && userResponse.trim()) {
                    setPhase("responding");
                  }
                }}
              />
              <button
                onClick={() => {
                  if (userResponse.trim()) setPhase("responding");
                }}
                className="bg-olive text-white p-3 rounded-xl hover:bg-olive-dark transition-colors"
              >
                <Mic size={18} />
              </button>
            </div>

            <div className="flex gap-2 mt-4 w-full">
              <button
                onClick={() => {
                  setUserResponse("I got distracted by other priorities");
                  setPhase("responding");
                }}
                className="text-xs border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--nav-inactive)] hover:bg-[var(--input-bg)] transition-colors"
              >
                &ldquo;I got distracted&rdquo;
              </button>
              <button
                onClick={() => {
                  setUserResponse(
                    "I'm waiting on dependencies from a teammate"
                  );
                  setPhase("responding");
                }}
                className="text-xs border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--nav-inactive)] hover:bg-[var(--input-bg)] transition-colors"
              >
                &ldquo;Waiting on dependencies&rdquo;
              </button>
            </div>
          </div>
        )}

        {phase === "responding" && (
          <div className="flex flex-col items-center w-full max-w-lg animate-[fadeIn_0.3s_ease-in-out]">
            <h2 className="font-serif text-2xl text-[var(--foreground)] mb-8">
              Response Logged
            </h2>

            <div className="w-full space-y-4 mb-8">
              <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--card-border)]">
                <p className="text-sm text-[var(--foreground)]">
                  AI: What blocked you from completing &ldquo;{task.title}
                  &rdquo;?
                </p>
              </div>
              <div className="bg-olive rounded-xl p-4 ml-8">
                <p className="text-sm text-white">{userResponse}</p>
              </div>
              <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--card-border)]">
                <p className="text-sm text-[var(--foreground)]">
                  Understood. I&apos;ve logged this reason. Would you like to
                  reschedule the task or break it into smaller steps?
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="border border-[var(--card-border)] px-6 py-2.5 rounded-xl text-sm hover:bg-[var(--input-bg)] transition-colors text-[var(--foreground)]"
              >
                Reschedule
              </button>
              <button
                onClick={() => {
                  onMarkDone(task.id);
                  onClose();
                }}
                className="bg-olive text-white px-6 py-2.5 rounded-xl text-sm hover:bg-olive-dark transition-colors"
              >
                Mark Complete
              </button>
            </div>
          </div>
        )}

        {/* Session info */}
        <div className="absolute bottom-6 right-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between gap-8">
            <span className="text-[var(--nav-inactive)]">Current Session</span>
            <span className="bg-overdue text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
              LIVE
            </span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-[var(--nav-inactive)]">
              Session Duration
            </span>
            <span className="text-[var(--foreground)] font-medium">
              {formatTime(sessionTime)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-[var(--nav-inactive)]">Trust Level</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-1.5 h-4 rounded-sm ${i <= 4 ? "bg-olive" : "bg-[var(--card-border)]"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
