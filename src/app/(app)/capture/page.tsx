"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Mic,
  MicOff,
  MoreVertical,
  Clock,
  Check,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";

const Scene3DWrapper = dynamic(() => import("@/components/3d/Scene3DWrapper"), {
  ssr: false,
});
const ParticleField = dynamic(() => import("@/components/3d/ParticleField"), {
  ssr: false,
});

interface CapturedTask {
  id: string;
  category: string;
  title: string;
  time: string;
  confirmed: boolean;
}

export default function CapturePage() {
  const { addTask } = useTasks();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [capturedTasks, setCapturedTasks] = useState<CapturedTask[]>([
    {
      id: "1",
      category: "Deep Work",
      title:
        "Finalize the quarterly architecture review and distribute the memo to the lead engineers.",
      time: "2:00 PM - 4:00 PM",
      confirmed: false,
    },
    {
      id: "2",
      category: "Quick Action",
      title: "Call David regarding the client feedback loop.",
      time: "",
      confirmed: false,
    },
    {
      id: "3",
      category: "Personal",
      title: "Pick up architectural magazines for the moodboard.",
      time: "",
      confirmed: false,
    },
  ]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } else {
      alert("Voice recognition is not supported in this browser. Please use Chrome.");
    }
  };

  const confirmTask = async (id: string) => {
    const task = capturedTasks.find((t) => t.id === id);
    if (!task || task.confirmed) return;

    await addTask({
      title: task.title,
      category: task.category,
      due_date: new Date().toISOString().split("T")[0],
      due_time: task.time || "12:00 PM",
      source: "voice",
    });

    setCapturedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, confirmed: true } : t))
    );
  };

  const confirmAll = async () => {
    for (const task of capturedTasks.filter((t) => !t.confirmed)) {
      await addTask({
        title: task.title,
        category: task.category,
        due_date: new Date().toISOString().split("T")[0],
        due_time: task.time || "12:00 PM",
        source: "voice",
      });
    }
    setCapturedTasks((prev) => prev.map((t) => ({ ...t, confirmed: true })));
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-[var(--foreground)] mb-2">
          Morning Reflection
        </h1>
        <p className="text-sm text-[var(--nav-inactive)]">
          Capture your intentions. Speak naturally, and I&apos;ll organize your day.
        </p>
      </div>

      {/* Mic Button with 3D Particle Background */}
      <div className="flex flex-col items-center mb-12 relative">
        <div className="absolute inset-0 -top-8 -bottom-8 pointer-events-none" style={{ zIndex: 0 }}>
          <Scene3DWrapper
            style={{ width: "100%", height: "100%", background: "transparent" }}
          >
            <ParticleField
              count={isListening ? 120 : 60}
              color="#4A5548"
              spread={5}
              speed={isListening ? 0.8 : 0.2}
            />
          </Scene3DWrapper>
        </div>

        <button
          onClick={toggleListening}
          className={`relative z-10 w-24 h-24 rounded-2xl flex items-center justify-center transition-all ${
            isListening
              ? "bg-olive voice-pulse shadow-lg"
              : "bg-[var(--input-bg)] border border-[var(--card-border)] hover:border-olive"
          }`}
        >
          {isListening ? (
            <MicOff size={32} className="text-white" />
          ) : (
            <Mic size={32} className="text-[var(--nav-inactive)]" />
          )}
        </button>
        <p className="relative z-10 text-xs uppercase tracking-[0.15em] text-[var(--nav-inactive)] mt-3">
          {isListening ? "Listening..." : "Tap to Speak"}
        </p>

        {/* Transcript */}
        {transcript && (
          <div className="relative z-10 mt-4 w-full max-w-md fade-in">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4">
              <p className="text-sm text-[var(--foreground)] italic">
                &ldquo;{transcript}&rdquo;
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Captured Intentions */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-serif text-xl text-[var(--foreground)]">
              Captured Intentions
            </h2>
            <p className="text-xs text-[var(--nav-inactive)] mt-0.5">
              Review and confirm tasks from your last session.
            </p>
          </div>
          <button
            onClick={confirmAll}
            className="text-sm text-olive font-medium hover:text-olive-dark transition-colors"
          >
            Confirm All
          </button>
        </div>

        <div className="space-y-3">
          {capturedTasks.map((task, i) => (
            <div
              key={task.id}
              className={`bg-[var(--card-bg)] border rounded-xl p-4 transition-colors ${
                task.confirmed
                  ? "border-olive/30 bg-success-bg/30"
                  : "border-[var(--card-border)]"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-[var(--foreground)] bg-[var(--input-bg)] px-2 py-0.5 rounded">
                  {task.category}
                </span>
                <button className="text-[var(--nav-inactive)]">
                  <MoreVertical size={16} />
                </button>
              </div>

              <p className="text-sm text-[var(--foreground)] leading-relaxed mb-3">
                {task.title}
              </p>

              {task.time && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--nav-inactive)] mb-3">
                  <Clock size={14} />
                  {task.time}
                </div>
              )}

              {!task.confirmed ? (
                <div className="flex gap-2">
                  {task.category === "Personal" ? (
                    <>
                      <button className="flex-1 border border-[var(--card-border)] text-sm py-2 rounded-lg hover:bg-[var(--input-bg)] transition-colors text-[var(--foreground)]">
                        Reschedule
                      </button>
                      <button
                        onClick={() => confirmTask(task.id)}
                        className="flex-1 bg-olive text-white text-sm py-2 rounded-lg hover:bg-olive-dark transition-colors"
                      >
                        Confirm
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex-1 border border-[var(--card-border)] text-sm py-2 rounded-lg hover:bg-[var(--input-bg)] transition-colors text-[var(--foreground)]">
                        Edit
                      </button>
                      <button
                        onClick={() => confirmTask(task.id)}
                        className="flex-1 bg-olive text-white text-sm py-2 rounded-lg hover:bg-olive-dark transition-colors"
                      >
                        Confirm
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-olive font-medium">
                  <Check size={14} />
                  Confirmed
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Journal Entry Created */}
      <div
        className="bg-[var(--tag-bg)] dark:bg-[var(--tag-bg-dark)] rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div className="w-12 h-12 rounded-xl bg-overdue/10 flex items-center justify-center flex-shrink-0">
          <BookOpen size={20} className="text-overdue" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--nav-inactive)]">
            Journal Entry Created
          </p>
          <p className="text-sm text-[var(--foreground)] italic mt-0.5 truncate">
            &ldquo;Feeling focused today. The morning air was crisp...&rdquo;
          </p>
        </div>
        <ChevronRight size={18} className="text-[var(--nav-inactive)]" />
      </div>
    </div>
  );
}
