"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  X,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useTasks } from "@/lib/hooks/useTasks";
import { useAuth } from "@/lib/hooks/useAuth";

const AGENT_ID = "agent_5701ks9s2tetes8a6ev9e0hw6cwf";

interface AddedTask {
  id: string;
  title: string;
  time: string;
  category: string;
}

/**
 * Parse a time string from natural language.
 * Looks for patterns like "2:00 PM", "10:30 AM", "3pm", "9:30", etc.
 */
function parseTime(text: string): string | null {
  // Match patterns like "2:00 PM", "10:30 AM", "3 PM", "3pm"
  const timeRegex = /\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm|a\.m\.|p\.m\.))\b/i;
  const match = text.match(timeRegex);
  if (match) {
    let t = match[1].trim().toUpperCase();
    // Normalize "3PM" → "3:00 PM"
    if (!t.includes(":")) {
      t = t.replace(/(\d+)\s*(AM|PM)/, "$1:00 $2");
    }
    // Ensure space before AM/PM
    t = t.replace(/(\d)(AM|PM)/, "$1 $2");
    return t;
  }
  return null;
}

/**
 * Guess a category based on keywords in the text.
 */
function guessCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(meeting|standup|call|sync|huddle|1[:\-]1|one.on.one|interview|retro)\b/.test(lower)) {
    return "Meeting";
  }
  if (/\b(review|write|design|code|build|implement|research|plan|architect|debug|refactor|deep work)\b/.test(lower)) {
    return "Deep Work";
  }
  if (/\b(personal|gym|workout|doctor|dentist|grocery|errands?|lunch|break|walk|meditat)\b/.test(lower)) {
    return "Personal";
  }
  return "Quick Action";
}

/**
 * Guess priority from text.
 */
function guessPriority(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(urgent|asap|critical|immediately|emergency)\b/.test(lower)) return "urgent";
  if (/\b(important|high priority|crucial)\b/.test(lower)) return "high";
  if (/\b(low priority|whenever|optional|if time)\b/.test(lower)) return "low";
  return "medium";
}

function VoiceSchedulerInner() {
  const { profile } = useAuth();
  const { addTask } = useTasks();
  const [isActive, setIsActive] = useState(false);
  const [addedTasks, setAddedTasks] = useState<AddedTask[]>([]);
  const [statusText, setStatusText] = useState("Tap to start scheduling");
  const [isDark, setIsDark] = useState(false);
  const addTaskRef = useRef(addTask);
  addTaskRef.current = addTask;
  const isActiveRef = useRef(false);
  const processedMessages = useRef(new Set<string>());

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
    async (title: string, text: string) => {
      const today = new Date().toISOString().split("T")[0];
      const time = parseTime(text) || "12:00 PM";
      const category = guessCategory(text);
      const priority = guessPriority(text);

      const result = await addTaskRef.current({
        title,
        category,
        due_date: today,
        due_time: time,
        priority,
        description: "",
        source: "voice",
      });

      if (result) {
        setAddedTasks((prev) => [
          ...prev,
          {
            id: result.id,
            title,
            time,
            category,
          },
        ]);
      }
    },
    []
  );

  /**
   * Try to extract a task title from the user's speech.
   * We look for common scheduling phrases and extract the task.
   */
  const extractTaskFromUserMessage = useCallback(
    (text: string) => {
      const lower = text.toLowerCase().trim();

      // Skip very short messages, greetings, or meta-conversation
      if (lower.length < 8) return;
      if (/^(hi|hey|hello|thanks|thank you|yes|no|okay|ok|sure|bye|goodbye|that'?s? (?:all|it)|nothing|done|stop|end)/i.test(lower)) return;
      if (/^(what|how|can you|do you|tell me)/i.test(lower)) return;

      // Common scheduling patterns
      const patterns = [
        /(?:add|schedule|create|put|set|remind me (?:to|about))\s+(?:a |an )?(.+)/i,
        /(?:i need to|i have to|i have|i got|i've got)\s+(?:a |an )?(.+)/i,
        /(?:i want to|i should|let me|gotta)\s+(.+)/i,
        /(?:there'?s? (?:a|an))\s+(.+)/i,
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          let title = match[1].trim();
          // Remove trailing time references for cleaner title
          title = title.replace(/\s+at\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?$/i, "").trim();
          // Remove trailing "today/tomorrow"
          title = title.replace(/\s+(today|tomorrow|this (?:morning|afternoon|evening))$/i, "").trim();
          // Capitalize first letter
          title = title.charAt(0).toUpperCase() + title.slice(1);
          if (title.length > 3) {
            handleAddTask(title, text);
            return;
          }
        }
      }

      // Fallback: if message contains a time reference, treat the whole thing as a task
      if (parseTime(text) && lower.length > 10) {
        let title = text.trim();
        title = title.replace(/\s+at\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?$/i, "").trim();
        title = title.charAt(0).toUpperCase() + title.slice(1);
        if (title.length > 3) {
          handleAddTask(title, text);
        }
      }
    },
    [handleAddTask]
  );

  const conversation = useConversation({
    onConnect: () => {
      console.log("[VoiceScheduler] Connected successfully");
      setStatusText("Connected — speak naturally");
    },
    onDisconnect: (details) => {
      console.log("[VoiceScheduler] Disconnected:", details);
      if (isActiveRef.current) {
        setStatusText("Session ended");
        setTimeout(() => {
          setIsActive(false);
          isActiveRef.current = false;
          setStatusText("Tap to start scheduling");
        }, 2000);
      }
    },
    onError: (message, context) => {
      console.error("[VoiceScheduler] Error:", message, context);
      setStatusText("Connection error — try again");
      setTimeout(() => {
        setIsActive(false);
        isActiveRef.current = false;
        setStatusText("Tap to start scheduling");
      }, 3000);
    },
    onModeChange: (mode) => {
      if (mode.mode === "speaking") {
        setStatusText("Callio is responding...");
      } else {
        setStatusText("Listening...");
      }
    },
    onMessage: (message) => {
      console.log("[VoiceScheduler] Message:", message);
      // Process user messages to extract tasks
      if (
        message.source === "user" &&
        message.message &&
        !processedMessages.current.has(message.message)
      ) {
        processedMessages.current.add(message.message);
        extractTaskFromUserMessage(message.message);
      }
    },
  });

  const startSession = async () => {
    setIsActive(true);
    isActiveRef.current = true;
    setAddedTasks([]);
    processedMessages.current.clear();
    setStatusText("Connecting...");

    try {
      const userName = profile?.full_name?.split(" ")[0] || "there";
      conversation.startSession({
        agentId: AGENT_ID,
        dynamicVariables: {
          name: userName,
        },
      });
    } catch (err) {
      console.error("[VoiceScheduler] Failed to start session:", err);
      setStatusText("Failed to connect — try again");
      setTimeout(() => {
        setIsActive(false);
        isActiveRef.current = false;
        setStatusText("Tap to start scheduling");
      }, 3000);
    }
  };

  const stopSession = async () => {
    try {
      await conversation.endSession();
    } catch {
      // ignore
    }
    setIsActive(false);
    isActiveRef.current = false;
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
                &ldquo;I need to review the proposal at 2pm&rdquo; &bull;
                &ldquo;Schedule a team standup at 9:30 AM&rdquo;
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
