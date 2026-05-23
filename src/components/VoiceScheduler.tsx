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
 * Parse a time string from text.
 * Matches: "2:00 PM", "10:30 AM", "3pm", "3 p.m.", "at 9", "at 2:30", etc.
 */
function parseTime(text: string): string | null {
  // Word-based times: "six thirty", "ten fifteen", "nine forty five"
  const wordNums: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
    seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  };
  const wordMins: Record<string, string> = {
    "o'clock": "00", "o clock": "00", oclock: "00",
    fifteen: "15", thirty: "30", "forty five": "45", "forty-five": "45",
  };
  for (const [hourWord, hourNum] of Object.entries(wordNums)) {
    const wordPattern = new RegExp(
      `\\b${hourWord}\\s+(${Object.keys(wordMins).join("|")})\\b`,
      "i"
    );
    const wordMatch = text.match(wordPattern);
    if (wordMatch) {
      const min = wordMins[wordMatch[1].toLowerCase()];
      const period = hourNum >= 7 && hourNum <= 11 ? "AM" : "PM";
      return `${hourNum}:${min} ${period}`;
    }
  }

  // "at 3", "at 9:30", "at 6.30", "at 2:00 PM"
  const atTimeRegex = /\bat\s+(\d{1,2})(?:[:\.](\d{2}))?\s*(AM|PM|am|pm|a\.m\.|p\.m\.)?/i;
  const atMatch = text.match(atTimeRegex);
  if (atMatch) {
    const hour = parseInt(atMatch[1]);
    const min = atMatch[2] || "00";
    let period = (atMatch[3] || "").toUpperCase().replace(/\./g, "");
    if (!period) {
      period = hour >= 7 && hour <= 11 ? "AM" : "PM";
    }
    return `${hour}:${min} ${period}`;
  }

  // Standalone time: "2:00 PM", "10.30 AM", "3pm", "6.30"
  const timeRegex = /\b(\d{1,2})[:\.](\d{2})\s*(AM|PM|am|pm|a\.m\.|p\.m\.)?/i;
  const match = text.match(timeRegex);
  if (match) {
    const hour = parseInt(match[1]);
    const min = match[2];
    let period = (match[3] || "").toUpperCase().replace(/\./g, "");
    if (!period) {
      period = hour >= 7 && hour <= 11 ? "AM" : "PM";
    }
    return `${hour}:${min} ${period}`;
  }

  // Just "3pm", "9am" (no minutes)
  const simpleRegex = /\b(\d{1,2})\s*(AM|PM|am|pm|a\.m\.|p\.m\.)\b/i;
  const simpleMatch = text.match(simpleRegex);
  if (simpleMatch) {
    const hour = simpleMatch[1];
    const period = simpleMatch[2].toUpperCase().replace(/\./g, "");
    return `${hour}:00 ${period}`;
  }

  return null;
}

/**
 * Guess a category based on keywords.
 */
function guessCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(meeting|standup|stand up|call|sync|huddle|one.on.one|interview|retro|catchup|catch up|check.in)\b/.test(lower)) {
    return "Meeting";
  }
  if (/\b(review|write|design|code|build|implement|research|plan|architect|debug|refactor|deep.work|develop|study|read|learn|prepare|presentation)\b/.test(lower)) {
    return "Deep Work";
  }
  if (/\b(personal|gym|workout|doctor|dentist|grocery|errand|lunch|break|walk|meditat|cook|clean|laundry|pick.up|drop.off)\b/.test(lower)) {
    return "Personal";
  }
  return "Quick Action";
}

/**
 * Guess priority from text.
 */
function guessPriority(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(urgent|asap|critical|immediately|emergency|right away)\b/.test(lower)) return "urgent";
  if (/\b(important|high priority|crucial|must|deadline)\b/.test(lower)) return "high";
  if (/\b(low priority|whenever|optional|if time|maybe|might)\b/.test(lower)) return "low";
  return "medium";
}

/**
 * Clean up a user message into a proper task title.
 */
function cleanTaskTitle(text: string): string {
  let title = text.trim();

  // Remove leading filler words / scheduling phrases
  title = title.replace(/^(uh+|um+|so|and|also|then|oh|well|like|basically|actually|please|can you|could you|i want to|i need to|i have to|i've got to|i got to|i gotta|i should|i must|let me|remind me to|add|schedule|create|put|set up|set)\s+/i, "");

  // Remove trailing time references for cleaner title (handles : and . separators)
  title = title.replace(/\s+(?:at|by|around|before|after)\s+\d{1,2}(?:[:\.]\d{2})?\s*(?:AM|PM|am|pm|a\.m\.|p\.m\.)?$/i, "").trim();

  // Remove trailing temporal markers
  title = title.replace(/\s+(today|tomorrow|tonight|this (?:morning|afternoon|evening)|in the (?:morning|afternoon|evening))$/i, "").trim();

  // Remove trailing conversational phrases
  title = title.replace(/\s+(so\s+)?(?:schedule|add|put)\s+(it|this|that).*$/i, "").trim();
  title = title.replace(/\s+(?:please|can you|could you).*$/i, "").trim();

  // Remove "a " / "an " at the start
  title = title.replace(/^(a |an )/i, "").trim();

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return title;
}

/**
 * Check if a message is just conversational filler (not a task).
 */
function isNonTaskMessage(text: string): boolean {
  const lower = text.toLowerCase().trim();

  // Too short to be a meaningful task
  if (lower.length < 5) return true;

  // Greetings, acknowledgments, farewells
  if (/^(hi|hey|hello|yo|sup|thanks|thank you|thank|yes|yeah|yep|yup|no|nope|nah|okay|ok|sure|right|correct|exactly|bye|goodbye|see you|that'?s?\s*(all|it)|nothing|done|stop|end|i'?m\s*done|that'?s?\s*everything|no\s*more)/i.test(lower)) {
    return true;
  }

  // Questions directed at the AI
  if (/^(what|how|can you|could you|do you|will you|are you|is there|is it|where|when|why|who|tell me|show me)\b/i.test(lower)) {
    return true;
  }

  // Talking about the app/tool itself (meta-conversation)
  if (/\b(today'?s?\s*objective|to.do\s*list|schedule\s*it|add\s*(it|this|that)|put\s*(it|this|that)|the\s*list|your\s*list|my\s*list)\b/i.test(lower) && !/\b(at|by|around|before)\s+\d/i.test(lower)) {
    return true;
  }

  // Pure responses to AI
  if (/^(sounds good|perfect|great|awesome|nice|cool|good|alright|fine|got it|understood|absolutely|definitely)\b/i.test(lower)) {
    return true;
  }

  return false;
}

function VoiceSchedulerInner() {
  const { profile } = useAuth();
  const { addTask } = useTasks();
  const [isActive, setIsActive] = useState(false);
  const [addedTasks, setAddedTasks] = useState<AddedTask[]>([]);
  const [statusText, setStatusText] = useState("Tap to start scheduling");
  const addTaskRef = useRef(addTask);
  addTaskRef.current = addTask;
  const isActiveRef = useRef(false);
  const processedMessages = useRef(new Set<string>());

  const handleAddTask = useCallback(
    async (title: string, originalText: string) => {
      const today = new Date().toISOString().split("T")[0];
      const time = parseTime(originalText) || "12:00 PM";
      const category = guessCategory(originalText);
      const priority = guessPriority(originalText);

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
   * Process a user message — every substantial message in a scheduling
   * context is treated as a task to add.
   */
  const processUserMessage = useCallback(
    (text: string) => {
      // Skip non-task messages (greetings, questions, confirmations)
      if (isNonTaskMessage(text)) {
        console.log("[VoiceScheduler] Skipping non-task message:", text);
        return;
      }

      // Clean up and create the task
      const title = cleanTaskTitle(text);
      if (title.length < 4) {
        console.log("[VoiceScheduler] Title too short after cleanup:", title);
        return;
      }

      console.log("[VoiceScheduler] Adding task:", title, "from:", text);
      handleAddTask(title, text);
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
      console.log("[VoiceScheduler] Message:", message.source, "—", message.message);
      // Process every user message as a potential task
      if (
        message.source === "user" &&
        message.message &&
        !processedMessages.current.has(message.message)
      ) {
        processedMessages.current.add(message.message);
        processUserMessage(message.message);
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
                &ldquo;Team standup at 9:30 AM&rdquo;
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
