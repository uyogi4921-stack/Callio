"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  Phone,
  Sparkles,
  Loader2,
  PhoneIncoming,
  Calendar,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useAuth } from "@/lib/hooks/useAuth";

const AGENT_ID = "agent_5701ks9s2tetes8a6ev9e0hw6cwf";

interface VoiceOnboardingProps {
  onComplete: () => void;
}

interface TourStep {
  icon: typeof Mic;
  title: string;
  body: string;
  voiceLine: string;
  /** ms to dwell on this step before auto-advancing (0 = wait for user) */
  autoAdvanceMs: number;
}

function buildTourSteps(userName: string): TourStep[] {
  return [
    {
      icon: Sparkles,
      title: `Hey ${userName} — meet Callio`,
      body: "Your AI accountability partner. Tell me what you need to do and when, and I'll make sure you actually do it.",
      voiceLine: `Hey ${userName}! I'm Callio, your AI accountability partner. Let me show you how this works in thirty seconds.`,
      autoAdvanceMs: 7000,
    },
    {
      icon: Mic,
      title: "Capture tasks by voice or text",
      body: "Just say it out loud — \"team standup at 9:30\" — or type it. I'll add it to your daily focus, no forms.",
      voiceLine:
        "First, you tell me what to do. Just say it out loud, like, team standup at nine thirty. I'll add it to your schedule. No forms, no friction.",
      autoAdvanceMs: 8500,
    },
    {
      icon: PhoneIncoming,
      title: "I call you when it's time — the magic part",
      body: "Two minutes before each task, your phone rings. Not a notification. Not a buzz. A real call from me.",
      voiceLine:
        "Here's the magic part. Two minutes before each task, your phone rings. Not a notification. A real phone call. From me. That's accountability.",
      autoAdvanceMs: 9000,
    },
    {
      icon: Calendar,
      title: "Score your day, build the streak",
      body: "Complete tasks to grow your accountability score. Skip them and it drops. The app you can't ignore.",
      voiceLine:
        "Complete tasks and your accountability score grows. Skip them and it drops. This is the app you can't ignore.",
      autoAdvanceMs: 7500,
    },
    {
      icon: Phone,
      title: "One thing — your phone number",
      body: "So I can actually call you. Add it below and we're off.",
      voiceLine:
        "One last thing. Drop your phone number below so I can actually call you. With country code please.",
      autoAdvanceMs: 0,
    },
  ];
}

function extractPhoneNumber(text: string): string | null {
  const cleaned = text.replace(/[^\d+]/g, "");
  const match = cleaned.match(/(\+?\d{10,15})/);
  return match ? match[1] : null;
}

type VoiceStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "failed"
  | "muted";

function VoiceOnboardingInner({ onComplete }: VoiceOnboardingProps) {
  const { profile, updateProfile } = useAuth();
  const userName = profile?.full_name?.split(" ")[0] || "there";
  const tourSteps = useRef(buildTourSteps(userName)).current;

  const [stepIndex, setStepIndex] = useState(0);
  const [manualPhone, setManualPhone] = useState(profile?.phone || "");
  const [capturedPhone, setCapturedPhone] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [saving, setSaving] = useState(false);
  const [hasUserStartedVoice, setHasUserStartedVoice] = useState(false);

  const autoCompletedRef = useRef(false);
  const processedMessages = useRef(new Set<string>());

  const currentStep = tourSteps[stepIndex];
  const isLastStep = stepIndex === tourSteps.length - 1;

  // Auto-complete if phone already saved
  useEffect(() => {
    if (autoCompletedRef.current) return;
    if (profile?.phone && profile.phone.trim().length > 0) {
      autoCompletedRef.current = true;
      void (async () => {
        try {
          await updateProfile({ onboarding_complete: true });
        } catch {
          // ignore
        }
        onComplete();
      })();
    }
  }, [profile?.phone, updateProfile, onComplete]);

  const conversation = useConversation({
    onConnect: () => {
      setVoiceStatus("connected");
    },
    onDisconnect: () => {
      // If session ends unexpectedly, mark as failed but DO NOT cancel the visual tour
      setVoiceStatus((current) => (current === "muted" ? "muted" : "failed"));
    },
    onError: () => {
      setVoiceStatus("failed");
    },
    onMessage: (message) => {
      if (
        message.source === "user" &&
        message.message &&
        !processedMessages.current.has(message.message)
      ) {
        processedMessages.current.add(message.message);
        const phone = extractPhoneNumber(message.message);
        if (phone && !capturedPhone) {
          setCapturedPhone(phone);
          setManualPhone(phone);
        }
      }
    },
  });

  const conversationRef = useRef(conversation);
  conversationRef.current = conversation;

  // Start voice on user click (browsers require gesture for mic access)
  const startVoice = useCallback(async () => {
    setHasUserStartedVoice(true);
    setVoiceStatus("connecting");

    try {
      conversationRef.current.startSession({
        agentId: AGENT_ID,
        dynamicVariables: {
          name: userName,
          mode: "onboarding",
        },
      });
    } catch {
      setVoiceStatus("failed");
    }
  }, [userName]);

  // Don't inject fake messages — that confused the agent and made it
  // hang up. Just let the agent be itself. The visual tour runs alongside
  // and the user can speak naturally to the agent at any point.

  // Visual auto-advance (always runs, regardless of voice state)
  useEffect(() => {
    if (currentStep.autoAdvanceMs === 0) return;
    const timer = setTimeout(() => {
      setStepIndex((i) => Math.min(i + 1, tourSteps.length - 1));
    }, currentStep.autoAdvanceMs);
    return () => clearTimeout(timer);
  }, [currentStep, tourSteps.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        conversationRef.current.endSession();
      } catch {
        // ignore
      }
    };
  }, []);

  const toggleMute = () => {
    if (voiceStatus === "connected") {
      try {
        conversationRef.current.endSession();
      } catch {
        // ignore
      }
      setVoiceStatus("muted");
    } else if (voiceStatus === "muted" || voiceStatus === "failed") {
      void startVoice();
    }
  };

  const handleFinish = async () => {
    const phone = manualPhone.trim() || capturedPhone || "";
    if (!phone) return;

    setSaving(true);
    try {
      try {
        conversationRef.current.endSession();
      } catch {
        // ignore
      }
      await updateProfile({ phone, onboarding_complete: true });
      onComplete();
    } catch {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      try {
        conversationRef.current.endSession();
      } catch {
        // ignore
      }
      await updateProfile({ onboarding_complete: true });
      onComplete();
    } catch {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      void handleFinish();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const Icon = currentStep.icon;
  const isSpeaking = conversation.isSpeaking;
  const isConnected = conversation.status === "connected";

  const statusLabel = (() => {
    switch (voiceStatus) {
      case "connecting":
        return "Connecting voice...";
      case "connected":
        return isSpeaking ? "Callio is speaking" : "Voice on";
      case "failed":
        return "Voice unavailable — text tour";
      case "muted":
        return "Voice muted";
      default:
        return hasUserStartedVoice ? "Voice off" : "Tap volume to enable voice";
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 fade-in">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isSpeaking
                  ? "bg-olive/20 scale-110"
                  : isConnected
                    ? "bg-olive/15"
                    : "bg-olive/10"
              }`}
            >
              <Sparkles
                size={16}
                className={`text-olive ${isSpeaking ? "animate-pulse" : ""}`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Welcome to Callio
              </p>
              <p className="text-[10px] text-[var(--nav-inactive)]">
                {statusLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            className="text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors p-2 rounded-lg hover:bg-[var(--input-bg)]"
            title={
              voiceStatus === "connected" || voiceStatus === "connecting"
                ? "Mute voice"
                : "Enable voice"
            }
          >
            {voiceStatus === "connected" || voiceStatus === "connecting" ? (
              <Volume2 size={16} />
            ) : (
              <VolumeX size={16} />
            )}
          </button>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 py-3">
          {tourSteps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStepIndex(i)}
              className={`h-1 rounded-full transition-all ${
                i === stepIndex
                  ? "w-8 bg-olive"
                  : i < stepIndex
                    ? "w-1.5 bg-olive/40"
                    : "w-1.5 bg-[var(--card-border)]"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="px-6 pb-6 pt-2 text-center min-h-[260px] flex flex-col items-center justify-center">
          <div key={stepIndex} className="flex flex-col items-center fade-in">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all ${
                isSpeaking ? "bg-olive scale-110" : "bg-olive/10"
              }`}
            >
              {voiceStatus === "connecting" ? (
                <Loader2 size={26} className="text-olive animate-spin" />
              ) : (
                <Icon
                  size={26}
                  className={isSpeaking ? "text-white" : "text-olive"}
                />
              )}
            </div>

            <h2 className="font-serif text-xl text-[var(--foreground)] mb-2 px-2">
              {currentStep.title}
            </h2>
            <p className="text-sm text-[var(--nav-inactive)] leading-relaxed px-2 max-w-sm">
              {currentStep.body}
            </p>
          </div>

          {/* Voice CTA — only shown before user has started voice */}
          {!hasUserStartedVoice && (
            <button
              type="button"
              onClick={() => void startVoice()}
              className="mt-5 inline-flex items-center gap-2 bg-olive text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-olive-dark transition-colors"
            >
              <Volume2 size={12} />
              Hear Callio speak this tour
            </button>
          )}
        </div>

        {/* Phone input on last step */}
        {isLastStep && (
          <div className="px-6 pb-4 fade-in">
            <label className="text-[10px] uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-1.5 block">
              Your Phone Number
            </label>
            <input
              type="tel"
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--nav-inactive)] outline-none focus:border-olive transition-colors"
              autoFocus
            />
            {capturedPhone && capturedPhone === manualPhone && (
              <p className="text-[10px] text-olive mt-1.5 flex items-center gap-1">
                <Phone size={10} />
                Heard you say {capturedPhone}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 border-t border-[var(--card-border)] flex gap-3 items-center">
          <button
            type="button"
            onClick={handleSkip}
            disabled={saving}
            className="text-xs text-[var(--nav-inactive)] hover:text-[var(--foreground)] px-3 py-2 transition-colors disabled:opacity-40"
          >
            Skip tour
          </button>
          <div className="flex-1" />
          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-olive text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-olive-dark transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={!manualPhone.trim() || saving}
              className="bg-olive text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-olive-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Let's go"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VoiceOnboarding(props: VoiceOnboardingProps) {
  return (
    <ConversationProvider>
      <VoiceOnboardingInner {...props} />
    </ConversationProvider>
  );
}
