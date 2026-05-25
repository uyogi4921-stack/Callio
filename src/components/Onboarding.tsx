"use client";

import { useState } from "react";
import {
  Mic,
  Phone,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to Callio",
    description:
      "Your AI accountability partner that actually calls you to make sure you get things done. No more forgotten tasks.",
    color: "bg-olive/10 text-olive",
  },
  {
    icon: Mic,
    title: "Speak or Type Your Tasks",
    description:
      "Just say or type what you need to do and when. Callio understands natural language like \"Team standup at 9:30 AM\".",
    color: "bg-violet-400/10 text-violet-400",
  },
  {
    icon: Phone,
    title: "Auto Reminder Calls",
    description:
      "This is the magic. Callio will automatically call you at the scheduled time to remind you. No clicks needed - just add a task and we handle the rest.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: BookOpen,
    title: "Journal & Reports",
    description:
      "Track your progress with a private journal and weekly reports. See your accountability score grow as you complete more tasks.",
    color: "bg-olive/10 text-olive",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { updateProfile, profile } = useAuth();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState(profile?.phone || "");

  const isLastStep = step === STEPS.length;

  const handleFinish = async () => {
    // Save phone and mark onboarding complete
    await updateProfile({
      phone: phone || null,
      onboarding_complete: true,
    });
    onComplete();
  };

  const handleSkip = async () => {
    await updateProfile({ onboarding_complete: true });
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
    >
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl max-w-md w-full overflow-hidden fade-in">
        {/* Skip button */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={handleSkip}
            className="text-xs text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
          >
            Skip
            <X size={14} />
          </button>
        </div>

        {/* Feature steps */}
        {!isLastStep && (
          <div className="px-8 pb-8 text-center">
            <div
              className={`w-16 h-16 rounded-2xl ${STEPS[step].color} flex items-center justify-center mx-auto mb-6`}
            >
              {(() => {
                const Icon = STEPS[step].icon;
                return <Icon size={28} />;
              })()}
            </div>

            <h2 className="font-serif text-2xl text-[var(--foreground)] mb-3">
              {STEPS[step].title}
            </h2>
            <p className="text-sm text-[var(--nav-inactive)] leading-relaxed mb-8">
              {STEPS[step].description}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step
                      ? "w-6 bg-olive"
                      : i < step
                        ? "w-1.5 bg-olive/40"
                        : "w-1.5 bg-[var(--card-border)]"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setStep(step + 1)}
              className="bg-olive text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-olive-dark transition-colors flex items-center gap-2 mx-auto"
            >
              {step === STEPS.length - 1 ? "Set Up Phone" : "Next"}
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Phone setup step */}
        {isLastStep && (
          <div className="px-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-olive/10 text-olive flex items-center justify-center mx-auto mb-6">
              <Phone size={28} />
            </div>

            <h2 className="font-serif text-2xl text-[var(--foreground)] mb-3">
              Your Phone Number
            </h2>
            <p className="text-sm text-[var(--nav-inactive)] leading-relaxed mb-6">
              Enter your phone number so Callio can call you with task reminders.
              Include country code.
            </p>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--nav-inactive)] outline-none focus:border-olive text-center mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 border border-[var(--card-border)] py-3 rounded-xl text-sm text-[var(--nav-inactive)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 bg-olive text-white py-3 rounded-xl text-sm font-medium hover:bg-olive-dark transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                {phone ? "Save & Start" : "Start Without Phone"}
              </button>
            </div>

            {!phone && (
              <p className="text-xs text-[var(--nav-inactive)] mt-3">
                You can add your phone later in Settings.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
