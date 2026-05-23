"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, ArrowLeft, Save } from "lucide-react";
import { useJournal } from "@/lib/hooks/useJournal";
import Link from "next/link";
import { useRouter } from "next/navigation";

const moodOptions = [
  { emoji: "😌", label: "Calm" },
  { emoji: "💪", label: "Motivated" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "🤔", label: "Reflective" },
];

export default function NewJournalPage() {
  const { addEntry } = useJournal();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tags, setTags] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [saved, setSaved] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        setContent(text);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    }
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    await addEntry({
      title: title || "Untitled Entry",
      content,
      tags: parsedTags,
      mood: selectedMood?.toLowerCase(),
      source: isListening ? "voice" : "text",
    });

    setSaved(true);
    setTimeout(() => {
      router.push("/journal");
    }, 1500);
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <Link
        href="/journal"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--nav-inactive)] hover:text-[var(--foreground)] mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Journal
      </Link>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.15em] text-[var(--nav-inactive)] mb-1">
          Private Entry
        </p>
        <h1 className="font-serif text-3xl text-[var(--foreground)]">
          New Journal Entry
        </h1>
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Entry title..."
        className="w-full bg-transparent text-xl font-serif text-[var(--foreground)] placeholder:text-[var(--card-border)] outline-none mb-4"
      />

      {/* Voice toggle */}
      <div className="flex items-center justify-center mb-6">
        <button
          onClick={toggleListening}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
            isListening
              ? "bg-olive voice-pulse"
              : "bg-[var(--input-bg)] border border-[var(--card-border)] hover:border-olive"
          }`}
        >
          {isListening ? (
            <MicOff size={24} className="text-white" />
          ) : (
            <Mic size={24} className="text-[var(--nav-inactive)]" />
          )}
        </button>
      </div>
      <p className="text-center text-xs text-[var(--nav-inactive)] mb-6">
        {isListening ? "Listening... speak your thoughts" : "Tap to dictate, or type below"}
      </p>

      {/* Content */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your thoughts..."
        rows={8}
        className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 text-sm text-[var(--foreground)] placeholder:text-[var(--nav-inactive)] outline-none focus:border-olive resize-none leading-relaxed"
      />

      {/* Mood */}
      <div className="mt-6">
        <p className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] mb-3">
          How are you feeling?
        </p>
        <div className="flex gap-2">
          {moodOptions.map((mood) => (
            <button
              key={mood.label}
              onClick={() =>
                setSelectedMood(
                  selectedMood === mood.label ? null : mood.label
                )
              }
              className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors ${
                selectedMood === mood.label
                  ? "border-olive bg-olive/5 text-[var(--foreground)]"
                  : "border-[var(--card-border)] text-[var(--nav-inactive)] hover:border-olive/50"
              }`}
            >
              <span>{mood.emoji}</span>
              <span className="text-xs">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mt-6">
        <p className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] mb-2">
          Tags
        </p>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="#focus, #morning, #strategy"
          className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--nav-inactive)] outline-none focus:border-olive"
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="mt-8 w-full bg-olive text-white py-3 rounded-xl text-sm font-medium hover:bg-olive-dark transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        {saved ? (
          <>
            <span className="fade-in">✓</span>
            Saved Privately
          </>
        ) : (
          <>
            <Save size={16} />
            Save Entry
          </>
        )}
      </button>
    </div>
  );
}
