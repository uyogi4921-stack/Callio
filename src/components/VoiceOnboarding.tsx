"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Phone, Sparkles, Loader2 } from "lucide-react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useAuth } from "@/lib/hooks/useAuth";

const AGENT_ID = "agent_5701ks9s2tetes8a6ev9e0hw6cwf";

interface VoiceOnboardingProps {
  onComplete: () => void;
}

/**
 * Try to extract a phone number from a transcribed user message.
 * Supports international format (+91...), spaced digits, and 10+ digit runs.
 */
function extractPhoneNumber(text: string): string | null {
  // Strip word-spelled digits first? Skip — most users will say digits aloud
  // and ElevenLabs transcribes "+91 9876543210" or "919876543210"
  const cleaned = text.replace(/[^\d+]/g, "");
  // Need at least 10 digits (with optional + prefix)
  const match = cleaned.match(/(\+?\d{10,15})/);
  if (!match) return null;
  return match[1];
}

function VoiceOnboardingInner({ onComplete }: VoiceOnboardingProps) {
  const { profile, updateProfile } = useAuth();
  const [statusText, setStatusText] = useState("Starting your voice tour...");
  const [capturedPhone, setCapturedPhone] = useState<string | null>(null);
  const [manualPhone, setManualPhone] = useState("");
  const [step, setStep] = useState<"intro" | "phone" | "done">("intro");
  const [saving, setSaving] = useState(false);
  const startedRef = useRef(false);
  const processedMessages = useRef(new Set<string>());

  const userName = profile?.full_name?.split(" ")[0] || "there";

  const conversation = useConversation({
    onConnect: () => {
      console.log("[VoiceOnboarding] Connected");
      setStatusText("Listen — Callio is introducing the app...");
    },
    onDisconnect: () => {
      console.log("[VoiceOnboarding] Disconnected");
      setStatusText("Tour ended");
      if (step === "intro") setStep("phone");
    },
    onError: (message, context) => {
      console.error("[VoiceOnboarding] Error:", message, context);
      setStatusText("Voice connection failed — you can still continue");
      setStep("phone");
    },
    onModeChange: (mode) => {
      if (mode.mode === "speaking") {
        setStatusText("Callio is speaking...");
      } else {
        setStatusText("Your turn — ask anything or share your phone number");
      }
    },
    onMessage: (message) => {
      console.log(
        "[VoiceOnboarding]",
        message.source,
        "—",
        message.message
      );
      // Detect phone number in user messages
      if (
        message.source === "user" &&
        message.message &&
        !processedMessages.current.has(message.message)
      ) {
        processedMessages.current.add(message.message);
        const phone = extractPhoneNumber(message.message);
        if (phone && !capturedPhone) {
          console.log("[VoiceOnboarding] Captured phone:", phone);
          setCapturedPhone(phone);
          setManualPhone(phone);
        }
      }
    },
  });

  const startTour = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      const intro =
        `Hey ${userName}! Welcome to Callio — your AI accountability partner. ` +
        `Here's how I work: just tell me what you need to do and when. ` +
        `I'll add it to your schedule and call your phone right before it's due — ` +
        `so you never miss what matters. ` +
        `To make that work, what's your phone number? Please include the country code.`;

      const tutorialPrompt =
        `You are Callio, an AI accountability partner currently onboarding a brand new user named ${userName}. ` +
        `Your job in this conversation is to: ` +
        `1) Warmly welcome them. ` +
        `2) Explain that Callio lets them schedule tasks by voice or text. ` +
        `3) Explain that Callio will automatically PHONE CALL them right before each scheduled task — that's the magic. ` +
        `4) Ask them to say their phone number out loud (with country code). ` +
        `5) After they share it, confirm it back and tell them they're all set and can start scheduling tasks. ` +
        `Keep responses SHORT — 2 sentences max. Be warm, energetic, hackathon-pitch-ready.`;

      conversation.startSession({
        agentId: AGENT_ID,
        dynamicVariables: {
          name: userName,
          mode: "onboarding",
        },
        overrides: {
          agent: {
            firstMessage: intro,
            prompt: { prompt: tutorialPrompt },
          },
        },
      } as Parameters<typeof conversation.startSession>[0]);
    } catch (err) {
      console.error("[VoiceOnboarding] Failed to start:", err);
      setStatusText("Voice unavailable — please enter your phone manually");
      setStep("phone");
    }
  }, [conversation, userName]);

  // Auto-start the tour on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      void startTour();
    }, 600);
    return () => clearTimeout(timer);
  }, [startTour]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        conversation.endSession();
      } catch {
        // ignore
      }
    };
  }, [conversation]);

  const handleFinish = async () => {
    const phone = manualPhone.trim() || capturedPhone || "";
    if (!phone) return;

    setSaving(true);
    try {
      try {
        await conversation.endSession();
      } catch {
        // ignore — already disconnected
      }
      await updateProfile({
        phone,
        onboarding_complete: true,
      });
      onComplete();
    } catch (err) {
      console.error("[VoiceOnboarding] Save failed:", err);
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      try {
        await conversation.endSession();
      } catch {
        // ignore — already disconnected
      }
      await updateProfile({ onboarding_complete: true });
      onComplete();
    } catch {
      setSaving(false);
    }
  };

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--card-border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center">
            <Sparkles size={18} className="text-olive" />
          </div>
          <div>
            <h2 className="font-serif text-lg text-[var(--foreground)]">
              Meet Callio
            </h2>
            <p className="text-xs text-[var(--nav-inactive)]">
              Your AI accountability partner
            </p>
          </div>
        </div>

        {/* Voice orb */}
        <div className="px-6 pt-8 pb-6 text-center">
          <div className="relative w-32 h-32 mx-auto mb-5">
            <div
              className={`absolute inset-0 rounded-full transition-all duration-500 ${
                isConnected
                  ? isSpeaking
                    ? "bg-olive/30 scale-110 animate-pulse"
                    : "bg-olive/20 scale-100"
                  : "bg-[var(--input-bg)]"
              }`}
            />
            <div
              className={`absolute inset-3 rounded-full flex items-center justify-center transition-all ${
                isConnected
                  ? isSpeaking
                    ? "bg-olive/40"
                    : "bg-olive voice-pulse"
                  : "bg-[var(--input-bg)]"
              }`}
            >
              {isConnected ? (
                isSpeaking ? (
                  <Sparkles size={32} className="text-olive animate-pulse" />
                ) : (
                  <Mic size={32} className="text-white" />
                )
              ) : (
                <Loader2
                  size={28}
                  className="text-[var(--nav-inactive)] animate-spin"
                />
              )}
            </div>
          </div>

          <p className="text-sm text-[var(--foreground)] font-medium mb-1">
            {statusText}
          </p>
          <p className="text-[11px] text-[var(--nav-inactive)] leading-relaxed px-4">
            {step === "intro"
              ? "Callio is explaining how the app works. When asked, just say your phone number out loud — or type it below."
              : "Almost done! Confirm your phone number so Callio can call you for reminders."}
          </p>

          {capturedPhone && (
            <div className="mt-4 inline-flex items-center gap-2 bg-olive/10 text-olive text-xs px-3 py-1.5 rounded-full">
              <Phone size={12} />
              <span>Got it: {capturedPhone}</span>
            </div>
          )}
        </div>

        {/* Phone input */}
        <div className="px-6 pb-2">
          <label className="text-[10px] uppercase tracking-wider text-[var(--nav-inactive)] font-medium mb-1.5 block">
            Your Phone Number
          </label>
          <input
            type="tel"
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--nav-inactive)] outline-none focus:border-olive transition-colors"
          />
          <p className="text-[10px] text-[var(--nav-inactive)] mt-1.5">
            Include country code. Callio will call this number for reminders.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-5 flex gap-3">
          <button
            type="button"
            onClick={handleSkip}
            disabled={saving}
            className="flex-1 text-sm text-[var(--nav-inactive)] hover:text-[var(--foreground)] px-4 py-3 rounded-xl transition-colors disabled:opacity-40"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={!manualPhone.trim() || saving}
            className="flex-[2] bg-olive text-white text-sm font-medium px-4 py-3 rounded-xl hover:bg-olive-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "I'm ready"}
          </button>
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
