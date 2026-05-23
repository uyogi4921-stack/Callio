"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import {
  Mic,
  MicOff,
  Clock,
  CheckCircle,
  X,
  PhoneOff,
  Volume2,
} from "lucide-react";
import type { TaskData } from "@/lib/hooks/useTasks";
import { ConversationProvider, useConversation } from "@elevenlabs/react";

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

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
}

const AGENT_ID = "agent_5701ks9s2tetes8a6ev9e0hw6cwf";

export default function AccountabilityCallModal(props: AccountabilityCallModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!props.task || !mounted || !props.isOpen) return null;

  return createPortal(
    <ConversationProvider>
      <AccountabilityCallInner {...props} />
    </ConversationProvider>,
    document.body
  );
}

function AccountabilityCallInner({
  task,
  isOpen,
  onClose,
  onMarkDone,
  onSnooze,
  userName,
}: AccountabilityCallModalProps) {
  const [phase, setPhase] = useState<"ringing" | "active" | "ended">("ringing");
  const [sessionTime, setSessionTime] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);

  const addMessage = useCallback(
    (sender: "ai" | "user", text: string) => {
      const msg: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, msg]);
    },
    []
  );

  const conversation = useConversation({
    onConnect: () => {
      console.log("[ElevenLabs] Connected");
    },
    onDisconnect: () => {
      console.log("[ElevenLabs] Disconnected");
    },
    onMessage: (message) => {
      if (message.source === "ai") {
        addMessage("ai", message.message);
      } else if (message.source === "user") {
        addMessage("user", message.message);
      }
    },
    onError: (error) => {
      console.error("[ElevenLabs] Error:", error);
    },
  });

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

  // Session timer
  useEffect(() => {
    if (!isOpen || phase !== "active") return;
    const timer = setInterval(() => setSessionTime((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen, phase]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPhase("ringing");
      setSessionTime(0);
      setMessages([]);
      setIsMuted(false);
    }
  }, [isOpen]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleAnswer = async () => {
    setPhase("active");
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID,
        overrides: {
          agent: {
            firstMessage: `Hey ${userName}, I noticed your task "${task?.title}" was due at ${task?.dueTime} and it's now overdue. What's going on? What blocked you from completing it?`,
            prompt: {
              prompt: `You are Callio, an AI accountability partner. You are having a voice call with ${userName} about their overdue task: "${task?.title}" — ${task?.description || "No description provided"}. It was due at ${task?.dueTime}. Be empathetic but firm. Help them understand why the task is overdue and create a plan to complete it. Keep responses conversational and concise (2-3 sentences max). Don't be preachy — be like a supportive friend who holds them accountable.`,
            },
          },
        },
      });
    } catch (err) {
      console.error("Failed to start ElevenLabs session:", err);
      addMessage(
        "ai",
        "I couldn't connect to voice. Please check your microphone permissions and try again."
      );
    }
  };

  const handleEndCall = async () => {
    try {
      await conversation.endSession();
    } catch {
      // Session may already be ended
    }
    setPhase("ended");
  };

  const handleClose = async () => {
    try {
      await conversation.endSession();
    } catch {
      // Ignore
    }
    onClose();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    conversation.setVolume({ volume: isMuted ? 1 : 0 });
  };

  if (!task) return null;

  const orbColor = isDark ? "#A78BFA" : "#4A5548";
  const isAgentSpeaking = conversation.isSpeaking;
  const isConnected = conversation.status === "connected";

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
        {/* Header */}
        <div className="absolute top-6 left-6">
          <span className="font-serif text-sm text-[var(--foreground)]">
            Callio AI
          </span>
        </div>

        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors"
        >
          <X size={20} />
        </button>

        {/* RINGING PHASE */}
        {phase === "ringing" && (
          <div className="flex flex-col items-center text-center fade-in">
            <div className="w-32 h-32 mb-8">
              <Scene3DWrapper
                style={{
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                }}
              >
                <FloatingOrb
                  color={orbColor}
                  pulseSpeed={1.5}
                  size={1.2}
                  intensity={0.9}
                />
              </Scene3DWrapper>
            </div>

            <h1 className="font-serif text-4xl lg:text-5xl text-[var(--foreground)] mb-3">
              Incoming Accountability
            </h1>
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--nav-inactive)] mb-12">
              AI Voice Call — Powered by ElevenLabs
            </p>

            <div className="bg-[var(--card-bg)] rounded-xl p-6 max-w-lg w-full mb-12 border border-[var(--card-border)]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-olive flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">AI</span>
                </div>
                <div>
                  <p className="text-sm text-[var(--foreground)] leading-relaxed">
                    {userName}, the {task.title.toLowerCase()} was due{" "}
                    {task.dueTime}. Your focus metrics indicate significant
                    divergence. We need to discuss this — answer to start a voice
                    session.
                  </p>
                  <p className="text-xs text-[var(--nav-inactive)] mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-olive inline-block animate-pulse" />
                    Ready to connect...
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  onSnooze(task.id);
                  handleClose();
                }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-14 h-14 rounded-full border-2 border-[var(--card-border)] flex items-center justify-center hover:bg-[var(--input-bg)] transition-colors">
                  <Clock size={20} className="text-[var(--nav-inactive)]" />
                </div>
                <span className="text-xs text-[var(--nav-inactive)]">
                  Snooze
                </span>
                <span className="text-xs text-[var(--badge-overdue-text)] font-medium">
                  -10 pts
                </span>
              </button>

              <button
                onClick={handleAnswer}
                className="flex items-center gap-2 bg-olive text-white px-8 py-4 rounded-xl font-medium hover:bg-olive-dark transition-colors call-ring"
              >
                <Mic size={18} />
                ANSWER & SPEAK
              </button>

              <button
                onClick={() => {
                  onMarkDone(task.id);
                  handleClose();
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
                <span className="text-xs text-[var(--badge-priority-text)] font-medium">
                  +25 pts
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE CALL PHASE */}
        {phase === "active" && (
          <div className="flex flex-col items-center w-full max-w-lg fade-in">
            {/* Orb — pulses when agent speaks */}
            <div
              className="w-28 h-28 mb-4 transition-transform duration-300"
              style={{
                transform: isAgentSpeaking ? "scale(1.1)" : "scale(1)",
              }}
            >
              <Scene3DWrapper
                style={{
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                }}
              >
                <FloatingOrb
                  color={orbColor}
                  pulseSpeed={isAgentSpeaking ? 2.5 : 0.8}
                  size={0.9}
                  intensity={isAgentSpeaking ? 1 : 0.5}
                />
              </Scene3DWrapper>
            </div>

            <h2 className="font-serif text-2xl text-[var(--foreground)] mb-1">
              Accountability Session
            </h2>
            <div className="flex items-center gap-2 mb-6">
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-[var(--badge-priority-text)] animate-pulse" : "bg-[var(--nav-inactive)]"}`}
              />
              <span className="text-xs text-[var(--nav-inactive)]">
                {isConnected
                  ? isAgentSpeaking
                    ? "Callio is speaking..."
                    : "Listening to you..."
                  : "Connecting..."}
              </span>
            </div>

            {/* Chat transcript */}
            <div className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl max-h-[280px] overflow-y-auto mb-6">
              {messages.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-xs text-[var(--nav-inactive)]">
                    {isConnected
                      ? "Conversation started — speak naturally"
                      : "Connecting to Callio AI..."}
                  </p>
                </div>
              )}
              <div className="p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-medium ${
                        msg.sender === "ai"
                          ? "bg-olive text-white"
                          : "bg-[var(--input-bg)] text-[var(--foreground)]"
                      }`}
                    >
                      {msg.sender === "ai" ? "AI" : "You"}
                    </div>
                    <div
                      className={`flex-1 ${msg.sender === "user" ? "text-right" : ""}`}
                    >
                      <div
                        className={`inline-block text-sm leading-relaxed px-3 py-2 rounded-xl max-w-[85%] ${
                          msg.sender === "ai"
                            ? "bg-[var(--input-bg)] text-[var(--foreground)] text-left"
                            : "bg-olive text-white text-left"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <p className="text-[10px] text-[var(--nav-inactive)] mt-0.5">
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Call controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isMuted
                    ? "bg-[var(--badge-overdue-bg)] text-[var(--badge-overdue-text)]"
                    : "bg-[var(--input-bg)] text-[var(--foreground)] hover:bg-[var(--card-border)]"
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff size={18} /> : <Volume2 size={18} />}
              </button>

              <button
                onClick={handleEndCall}
                className="w-14 h-14 rounded-full bg-[var(--badge-overdue-text)] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                title="End call"
              >
                <PhoneOff size={20} />
              </button>

              <button
                onClick={() => {
                  onMarkDone(task.id);
                  handleEndCall();
                }}
                className="w-12 h-12 rounded-full bg-[var(--input-bg)] text-[var(--foreground)] flex items-center justify-center hover:bg-[var(--card-border)] transition-colors"
                title="Mark task done"
              >
                <CheckCircle size={18} />
              </button>
            </div>
          </div>
        )}

        {/* CALL ENDED PHASE */}
        {phase === "ended" && (
          <div className="flex flex-col items-center w-full max-w-lg fade-in">
            <div className="w-16 h-16 rounded-full bg-olive/10 flex items-center justify-center mb-6">
              <CheckCircle size={28} className="text-olive" />
            </div>

            <h2 className="font-serif text-2xl text-[var(--foreground)] mb-2">
              Session Complete
            </h2>
            <p className="text-sm text-[var(--nav-inactive)] mb-2">
              Duration: {formatTime(sessionTime)}
            </p>
            <p className="text-xs text-[var(--nav-inactive)] mb-8">
              {messages.length} messages exchanged
            </p>

            {/* Transcript summary */}
            {messages.length > 0 && (
              <div className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl max-h-[200px] overflow-y-auto mb-6">
                <div className="p-4 space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className="text-xs">
                      <span
                        className={`font-medium ${msg.sender === "ai" ? "text-olive" : "text-[var(--foreground)]"}`}
                      >
                        {msg.sender === "ai" ? "Callio" : "You"}:
                      </span>{" "}
                      <span className="text-[var(--nav-inactive)]">
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="border border-[var(--card-border)] px-6 py-2.5 rounded-xl text-sm hover:bg-[var(--input-bg)] transition-colors text-[var(--foreground)]"
              >
                Reschedule
              </button>
              <button
                onClick={() => {
                  onMarkDone(task.id);
                  handleClose();
                }}
                className="bg-olive text-white px-6 py-2.5 rounded-xl text-sm hover:bg-olive-dark transition-colors"
              >
                Mark Complete
              </button>
            </div>
          </div>
        )}

        {/* Session info panel */}
        {phase !== "ringing" && (
          <div className="absolute bottom-6 right-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between gap-8">
              <span className="text-[var(--nav-inactive)]">Session</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  phase === "active"
                    ? "bg-[var(--badge-priority-bg)] text-[var(--badge-priority-text)]"
                    : "bg-[var(--input-bg)] text-[var(--nav-inactive)]"
                }`}
              >
                {phase === "active" ? "LIVE" : "ENDED"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-[var(--nav-inactive)]">Duration</span>
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
        )}
      </div>
    </div>
  );

  return modal;
}
