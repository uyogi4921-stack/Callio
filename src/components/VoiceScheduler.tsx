"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  X,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useTasks } from "@/lib/hooks/useTasks";

const AGENT_ID = "agent_5701ks9s2tetes8a6ev9e0hw6cwf";

interface AddedTask {
  id: string;
  title: string;
  time: string;
  category: string;
}

function VoiceSchedulerInner() {
  const { addTask } = useTasks();
  const [isActive, setIsActive] = useState(false);
  const [addedTasks, setAddedTasks] = useState<AddedTask[]>([]);
  const [statusText, setStatusText] = useState("Tap to start scheduling");
  const [isDark, setIsDark] = useState(false);
  const addTaskRef = useRef(addTask);
  addTaskRef.current = addTask;

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const handleAddTask = useCallback(
    async (params: {
      title: string;
      category?: string;
      due_time?: string;
      priority?: string;
      description?: string;
    }) => {
      const today = new Date().toISOString().split("T")[0];
      const result = await addTaskRef.current({
        title: params.title,
        category: params.category || "Quick Action",
        due_date: today,
        due_time: params.due_time || "12:00 PM",
        priority: params.priority || "medium",
        description: params.description || "",
        source: "voice",
      });

      if (result) {
        setAddedTasks((prev) => [
          ...prev,
          {
            id: result.id,
            title: params.title,
            time: params.due_time || "12:00 PM",
            category: params.category || "Quick Action",
          },
        ]);
      }

      return `Task "${params.title}" has been added to your schedule${params.due_time ? ` at ${params.due_time}` : ""}. What else would you like to schedule?`;
    },
    []
  );

  const conversation = useConversation({
    clientTools: {
      addTask: async (params: Record<string, unknown>) => {
        const result = await handleAddTask({
          title: (params.title as string) || "Untitled task",
          category: params.category as string | undefined,
          due_time: params.due_time as string | undefined,
          priority: params.priority as string | undefined,
          description: params.description as string | undefined,
        });
        return result;
      },
    },
    onConnect: () => {
      setStatusText("Connected — speak naturally");
    },
    onDisconnect: () => {
      setStatusText("Session ended");
      setTimeout(() => {
        setIsActive(false);
        setStatusText("Tap to start scheduling");
      }, 2000);
    },
    onError: (error) => {
      console.error("[VoiceScheduler] Error:", error);
      setStatusText("Connection error — try again");
    },
    onModeChange: (mode) => {
      if (mode.mode === "speaking") {
        setStatusText("Callio is responding...");
      } else {
        setStatusText("Listening...");
      }
    },
  });

  const startSession = async () => {
    setIsActive(true);
    setAddedTasks([]);
    setStatusText("Connecting...");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID,
        overrides: {
          agent: {
            firstMessage:
              "Hey! I'm Callio, your scheduling assistant. Tell me what tasks you'd like to add to your day — I'll organize them for you. What's on your plate?",
            prompt: {
              prompt: `You are Callio, a voice-powered scheduling assistant. Your job is to help users plan their day by adding tasks to their schedule.

When the user tells you about a task they need to do:
1. Extract the task title, time, category, and priority
2. Use the addTask tool to add it to their schedule
3. Confirm it was added and ask if there's anything else

Categories: "Deep Work" (focused work), "Quick Action" (short tasks), "Personal" (personal errands), "Meeting" (calls/meetings)
Priorities: "low", "medium", "high", "urgent"

Be conversational, concise (1-2 sentences), and friendly. If the user doesn't specify a time, suggest a reasonable one. If they don't specify priority, default to medium.

Examples:
- "I need to review the project proposal at 2pm" → addTask(title: "Review project proposal", due_time: "2:00 PM", category: "Deep Work", priority: "high")
- "Remind me to call the dentist" → addTask(title: "Call the dentist", due_time: "10:00 AM", category: "Personal", priority: "medium")
- "Team standup at 9:30" → addTask(title: "Team standup", due_time: "9:30 AM", category: "Meeting", priority: "high")`,
            },
          },
        },
      });
    } catch (err) {
      console.error("Failed to start session:", err);
      setStatusText("Mic access denied — check permissions");
      setTimeout(() => setIsActive(false), 3000);
    }
  };

  const stopSession = async () => {
    try {
      await conversation.endSession();
    } catch {
      // ignore
    }
    setIsActive(false);
    setStatusText("Tap to start scheduling");
  };

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl overflow-hidden fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-olive" />
          <h3 className="text-sm font-medium text-[var(--foreground)]">
            Voice Scheduler
          </h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-olive/10 text-olive font-medium uppercase tracking-wider">
            AI
          </span>
        </div>
        {isActive && (
          <button
            onClick={stopSession}
            className="text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="p-5">
        {!isActive ? (
          /* Idle state */
          <div className="text-center">
            <p className="text-xs text-[var(--nav-inactive)] mb-4">
              Tell Callio what you need to do today — it&apos;ll add tasks to
              your schedule automatically.
            </p>
            <button
              onClick={startSession}
              className="inline-flex items-center gap-2 bg-olive text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-olive-dark transition-all group"
            >
              <Mic
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
              Start Scheduling
            </button>
          </div>
        ) : (
          /* Active state */
          <div className="text-center">
            {/* Mic indicator */}
            <div className="flex justify-center mb-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isConnected
                    ? isSpeaking
                      ? "bg-olive/20 scale-110"
                      : "bg-olive voice-pulse"
                    : "bg-[var(--input-bg)]"
                }`}
              >
                {isConnected ? (
                  isSpeaking ? (
                    <Sparkles size={24} className="text-olive animate-pulse" />
                  ) : (
                    <Mic size={24} className="text-white" />
                  )
                ) : (
                  <Loader2
                    size={24}
                    className="text-[var(--nav-inactive)] animate-spin"
                  />
                )}
              </div>
            </div>

            {/* Status */}
            <p className="text-xs text-[var(--nav-inactive)] mb-1">
              {statusText}
            </p>
            {isConnected && (
              <p className="text-[10px] text-[var(--nav-inactive)]">
                &ldquo;Add a team meeting at 3pm&rdquo; &bull;
                &ldquo;Schedule a code review for tomorrow&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Added tasks */}
        {addedTasks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
            <p className="text-[10px] uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-2">
              Just Added ({addedTasks.length})
            </p>
            <div className="space-y-2">
              {addedTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 text-xs fade-in"
                >
                  <CheckCircle2
                    size={14}
                    className="text-olive flex-shrink-0"
                  />
                  <span className="text-[var(--foreground)] flex-1 truncate">
                    {t.title}
                  </span>
                  <span className="text-[var(--nav-inactive)] flex-shrink-0">
                    {t.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VoiceScheduler() {
  return (
    <ConversationProvider>
      <VoiceSchedulerInner />
    </ConversationProvider>
  );
}
