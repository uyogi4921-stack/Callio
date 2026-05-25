"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  X,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";

interface AddedTask {
  id: string;
  title: string;
  time: string;
  category: string;
}

// Web Speech API typing
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [k: number]: {
      isFinal: boolean;
      [k: number]: { transcript: string };
    };
  };
};

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string; message?: string }) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onaudiostart: (() => void) | null;
  onaudioend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getSpeechRecognition(): { new (): SpeechRecognitionLike } | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: { new (): SpeechRecognitionLike };
    webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/**
 * Parse a time string from text. Handles "at 3pm", "2:30 PM", "9 in the morning", etc.
 */
function parseTime(text: string): string | null {
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

  const atTimeRegex =
    /\bat\s+(\d{1,2})(?:[:\.](\d{2}))?\s*(AM|PM|am|pm|a\.m\.|p\.m\.)?/i;
  const atMatch = text.match(atTimeRegex);
  if (atMatch) {
    const hour = parseInt(atMatch[1]);
    const min = atMatch[2] || "00";
    let period = (atMatch[3] || "").toUpperCase().replace(/\./g, "");
    if (!period) period = hour >= 7 && hour <= 11 ? "AM" : "PM";
    return `${hour}:${min} ${period}`;
  }

  const timeRegex = /\b(\d{1,2})[:\.](\d{2})\s*(AM|PM|am|pm|a\.m\.|p\.m\.)?/i;
  const match = text.match(timeRegex);
  if (match) {
    const hour = parseInt(match[1]);
    const min = match[2];
    let period = (match[3] || "").toUpperCase().replace(/\./g, "");
    if (!period) period = hour >= 7 && hour <= 11 ? "AM" : "PM";
    return `${hour}:${min} ${period}`;
  }

  const simpleRegex = /\b(\d{1,2})\s*(AM|PM|am|pm|a\.m\.|p\.m\.)\b/i;
  const simpleMatch = text.match(simpleRegex);
  if (simpleMatch) {
    return `${simpleMatch[1]}:00 ${simpleMatch[2].toUpperCase().replace(/\./g, "")}`;
  }
  return null;
}

function guessCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(meeting|standup|stand up|call|sync|huddle|one.on.one|interview|retro|catchup|catch up|check.in)\b/.test(lower))
    return "Meeting";
  if (/\b(review|write|design|code|build|implement|research|plan|architect|debug|refactor|deep.work|develop|study|read|learn|prepare|presentation)\b/.test(lower))
    return "Deep Work";
  if (/\b(personal|gym|workout|doctor|dentist|grocery|errand|lunch|break|walk|meditat|cook|clean|laundry|pick.up|drop.off|cricket|play|practice)\b/.test(lower))
    return "Personal";
  return "Quick Action";
}

function guessPriority(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(urgent|asap|critical|immediately|emergency|right away)\b/.test(lower)) return "urgent";
  if (/\b(important|high priority|crucial|must|deadline)\b/.test(lower)) return "high";
  if (/\b(low priority|whenever|optional|if time|maybe|might)\b/.test(lower)) return "low";
  return "medium";
}

function cleanTaskTitle(text: string): string {
  let title = text.trim();
  title = title.replace(
    /^(uh+|um+|so|and|also|then|oh|well|like|basically|actually|please|can you|could you|i want to|i need to|i have to|i've got to|i got to|i gotta|i should|i must|let me|remind me to|add|schedule|create|put|set up|set)\s+/i,
    ""
  );
  title = title.replace(
    /\s+(?:at|by|around|before|after)\s+\d{1,2}(?:[:\.]\d{2})?\s*(?:AM|PM|am|pm|a\.m\.|p\.m\.)?$/i,
    ""
  ).trim();
  title = title.replace(
    /\s+(today|tomorrow|tonight|this (?:morning|afternoon|evening)|in the (?:morning|afternoon|evening))$/i,
    ""
  ).trim();
  title = title.replace(/\s+(?:please|can you|could you).*$/i, "").trim();
  title = title.replace(/^(a |an )/i, "").trim();
  if (title.length > 0) title = title.charAt(0).toUpperCase() + title.slice(1);
  return title;
}

function isNonTaskMessage(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (lower.length < 4) return true;
  if (/^(hi|hey|hello|yo|sup|thanks|thank you|thank|yes|yeah|yep|yup|no|nope|nah|okay|ok|sure|right|correct|exactly|bye|goodbye|see you|stop|end|done)\b$/i.test(lower)) return true;
  return false;
}

export default function VoiceScheduler() {
  const { addTask } = useTasks();
  const [isActive, setIsActive] = useState(false);
  const [statusText, setStatusText] = useState("Tap to start scheduling");
  const [error, setError] = useState<string | null>(null);
  const [addedTasks, setAddedTasks] = useState<AddedTask[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const addTaskRef = useRef(addTask);
  addTaskRef.current = addTask;
  const isActiveRef = useRef(false);
  const processedFinals = useRef(new Set<string>());

  const handleAddTaskFromText = useCallback(async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isNonTaskMessage(trimmed)) return;
    if (processedFinals.current.has(trimmed)) return;
    processedFinals.current.add(trimmed);

    const title = cleanTaskTitle(trimmed);
    if (title.length < 3) return;

    const today = new Date().toISOString().split("T")[0];
    const time = parseTime(trimmed) || "12:00 PM";
    const category = guessCategory(trimmed);
    const priority = guessPriority(trimmed);

    console.log("[VoiceScheduler] Adding task:", title, "at", time);

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
        { id: result.id, title, time, category },
      ]);
    }
  }, []);

  const handleAddTaskFromTextRef = useRef(handleAddTaskFromText);
  handleAddTaskFromTextRef.current = handleAddTaskFromText;

  const startSession = () => {
    setError(null);
    processedFinals.current.clear();
    setAddedTasks([]);
    setLiveTranscript("");

    const SR = getSpeechRecognition();
    if (!SR) {
      setError(
        "Your browser doesn't support voice recognition. Try Chrome or Edge."
      );
      return;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      console.log("[VoiceScheduler] Listening started");
      setStatusText("Listening — say a task");
    };

    rec.onaudiostart = () => {
      setStatusText("Listening — say a task");
    };

    rec.onresult = (e: SpeechRecognitionEventLike) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res[0].transcript;
        if (res.isFinal) {
          console.log("[VoiceScheduler] FINAL:", text);
          void handleAddTaskFromTextRef.current(text);
          interim = "";
          setLiveTranscript("");
        } else {
          interim += text;
        }
      }
      if (interim) {
        setLiveTranscript(interim);
        setStatusText("Hearing you...");
      }
    };

    rec.onerror = (e) => {
      console.error("[VoiceScheduler] Error:", e.error, e.message);
      if (e.error === "not-allowed" || e.error === "permission-denied") {
        setError(
          "Microphone access denied. Click the lock icon in the address bar → Site settings → allow Microphone, then try again."
        );
        setIsActive(false);
        isActiveRef.current = false;
      } else if (e.error === "no-speech") {
        // ignore — natural pause
        setStatusText("Waiting... speak when ready");
      } else if (e.error === "aborted") {
        // ignore — we triggered it
      } else {
        setError(`Voice error: ${e.error}. Try again.`);
      }
    };

    rec.onend = () => {
      console.log("[VoiceScheduler] Recognition ended");
      // Auto-restart if user hasn't stopped — keeps it listening forever
      if (isActiveRef.current) {
        try {
          rec.start();
        } catch (err) {
          console.error("[VoiceScheduler] Restart failed:", err);
          setIsActive(false);
          isActiveRef.current = false;
          setStatusText("Tap to start scheduling");
        }
      } else {
        setStatusText("Tap to start scheduling");
      }
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      setIsActive(true);
      isActiveRef.current = true;
      setStatusText("Connecting...");
    } catch (err) {
      console.error("[VoiceScheduler] Start failed:", err);
      setError(
        "Couldn't start voice. Check microphone permissions and try again."
      );
    }
  };

  const stopSession = () => {
    isActiveRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsActive(false);
    setStatusText("Tap to start scheduling");
    setLiveTranscript("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

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
            title="Stop scheduling"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="p-5">
        {!isActive ? (
          <div className="text-center">
            <p className="text-xs text-[var(--nav-inactive)] mb-4">
              Tell Callio what you need to do — your browser&apos;s built-in
              voice recognition will turn each sentence into a task.
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
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-olive voice-pulse flex items-center justify-center">
                {statusText.includes("Connecting") ? (
                  <Loader2 size={24} className="text-white animate-spin" />
                ) : (
                  <Mic size={24} className="text-white" />
                )}
              </div>
            </div>

            <p className="text-xs text-[var(--nav-inactive)] mb-1">
              {statusText}
            </p>

            {/* Live interim transcript */}
            {liveTranscript && (
              <div className="mt-3 bg-[var(--input-bg)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] italic max-w-sm mx-auto">
                &ldquo;{liveTranscript}&rdquo;
              </div>
            )}

            <p className="text-[10px] text-[var(--nav-inactive)] mt-3">
              Try: &ldquo;Team standup at 9:30 AM&rdquo; &bull; &ldquo;Gym at 6
              PM&rdquo;
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-overdue/10 border border-overdue/20 rounded-lg text-[11px] text-overdue leading-relaxed">
            {error}
          </div>
        )}

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
                  <CheckCircle2 size={14} className="text-olive flex-shrink-0" />
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
