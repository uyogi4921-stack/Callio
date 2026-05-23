"use client";

import { useState, useRef, useEffect } from "react";
import { Lock, Sparkles, ArrowRight, Mic, MicOff, Send, X, Plus } from "lucide-react";
import { useJournal } from "@/lib/hooks/useJournal";
import Link from "next/link";

const moodOptions = [
  { emoji: "\u{1F60C}", label: "Calm" },
  { emoji: "\u{1F4AA}", label: "Motivated" },
  { emoji: "\u{1F610}", label: "Neutral" },
  { emoji: "\u{1F624}", label: "Frustrated" },
  { emoji: "\u{1F914}", label: "Reflective" },
];

export default function JournalPage() {
  const { entries, addEntry } = useJournal();
  const [filter, setFilter] = useState<"this-week" | "all">("this-week");

  // Inline journal composer state
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tags, setTags] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [saving, setSaving] = useState(false);
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
    setSaving(true);

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

    // Reset
    setTitle("");
    setContent("");
    setSelectedMood(null);
    setTags("");
    setShowComposer(false);
    setSaving(false);
  };

  const resetComposer = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setTitle("");
    setContent("");
    setSelectedMood(null);
    setTags("");
    setShowComposer(false);
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const featuredEntry = entries[0];
  const previousEntries = entries.slice(1);

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.15em] text-[var(--nav-inactive)] mb-1">
          Private Space
        </p>
        <h1 className="font-serif text-3xl lg:text-4xl text-[var(--foreground)] mb-2">
          Journal
        </h1>
        <p className="text-sm text-[var(--nav-inactive)] max-w-lg">
          A quiet corner for your thoughts. Everything here is encrypted and
          visible only to you.
        </p>
      </div>

      {/* Quick compose card */}
      {!showComposer ? (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 mb-6 fade-in">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowComposer(true);
                setTimeout(() => textareaRef.current?.focus(), 100);
              }}
              className="flex-1 text-left bg-[var(--input-bg)] rounded-xl px-4 py-3 text-sm text-[var(--nav-inactive)] hover:bg-[var(--card-border)]/30 transition-colors"
            >
              What&apos;s on your mind today?
            </button>
            <button
              onClick={() => {
                setShowComposer(true);
                setTimeout(() => toggleListening(), 200);
              }}
              className="w-11 h-11 rounded-xl bg-olive/10 flex items-center justify-center hover:bg-olive/20 transition-colors flex-shrink-0"
            >
              <Mic size={18} className="text-olive" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 mb-6 fade-in">
          {/* Composer header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] font-medium">
              New Entry
            </p>
            <button
              onClick={resetComposer}
              className="text-[var(--nav-inactive)] hover:text-[var(--foreground)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry title..."
            className="w-full bg-transparent text-lg font-serif text-[var(--foreground)] placeholder:text-[var(--card-border)] outline-none mb-3"
          />

          {/* Content textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts..."
            rows={5}
            className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl p-4 text-sm text-[var(--foreground)] placeholder:text-[var(--nav-inactive)] outline-none focus:border-olive resize-none leading-relaxed"
          />

          {/* Voice toggle */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={toggleListening}
              className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all ${
                isListening
                  ? "bg-olive text-white voice-pulse"
                  : "bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--nav-inactive)] hover:border-olive/50"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff size={14} />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic size={14} />
                  Speak
                </>
              )}
            </button>
            {isListening && (
              <span className="text-xs text-olive animate-pulse">
                Listening...
              </span>
            )}
          </div>

          {/* Mood selector */}
          <div className="mt-4">
            <p className="text-xs text-[var(--nav-inactive)] mb-2">Mood</p>
            <div className="flex flex-wrap gap-1.5">
              {moodOptions.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() =>
                    setSelectedMood(
                      selectedMood === mood.label ? null : mood.label
                    )
                  }
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                    selectedMood === mood.label
                      ? "border-olive bg-olive/5 text-[var(--foreground)]"
                      : "border-[var(--card-border)] text-[var(--nav-inactive)] hover:border-olive/50"
                  }`}
                >
                  <span>{mood.emoji}</span>
                  <span>{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-3">
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="#focus, #morning, #strategy"
              className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--nav-inactive)] outline-none focus:border-olive"
            />
          </div>

          {/* Save */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              disabled={(!title.trim() && !content.trim()) || saving}
              className="bg-olive text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-olive-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={14} />
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </div>
      )}

      {/* Desktop: tabs */}
      <div className="hidden lg:flex items-center justify-between mb-8">
        <div />
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("this-week")}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              filter === "this-week"
                ? "border-[var(--foreground)] text-[var(--foreground)]"
                : "border-[var(--card-border)] text-[var(--nav-inactive)] hover:border-[var(--foreground)]"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              filter === "all"
                ? "border-[var(--foreground)] text-[var(--foreground)]"
                : "border-[var(--card-border)] text-[var(--nav-inactive)] hover:border-[var(--foreground)]"
            }`}
          >
            All Categories
          </button>
        </div>
      </div>

      {/* Mobile: Featured entry card */}
      <div className="lg:hidden mb-6">
        {featuredEntry && (
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[var(--nav-inactive)]">
                {featuredEntry.date} &bull;{" "}
                {featuredEntry.createdAt.split("T")[1]?.slice(0, 5)}
              </span>
              <Lock size={14} className="text-[var(--nav-inactive)]" />
            </div>
            <h3 className="font-serif text-lg text-[var(--foreground)] mb-2">
              {featuredEntry.title}
            </h3>
            <p className="text-sm text-[var(--nav-inactive)] leading-relaxed mb-4 line-clamp-4">
              {featuredEntry.content}
            </p>
            <div className="flex gap-2">
              {featuredEntry.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs border border-[var(--card-border)] rounded-full px-3 py-1 text-[var(--nav-inactive)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Streak card (mobile) */}
      <div className="lg:hidden mb-8">
        <div className="bg-[var(--tag-bg)] dark:bg-[var(--tag-bg-dark)] rounded-xl p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-olive/10 flex items-center justify-center mx-auto mb-3">
            <Sparkles size={20} className="text-olive" />
          </div>
          <h3 className="font-serif text-xl text-[var(--foreground)]">
            {entries.length > 0 ? `${Math.min(entries.length, 7)} Day Streak` : "Start Your Streak"}
          </h3>
          <p className="text-xs text-[var(--nav-inactive)] mt-1">
            Consistent reflection leads to clarity.
          </p>
        </div>
      </div>

      {/* Desktop: masonry grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-4 mb-8">
        {/* Featured large card */}
        {entries[0] && (
          <div className="lg:col-span-2 lg:row-span-2">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 text-xs text-[var(--nav-inactive)] mb-4">
                <span className="uppercase">{entries[0].date}</span>
                <span>&bull;</span>
                <span>{entries[0].readTime}</span>
              </div>
              <h3 className="font-serif text-2xl text-[var(--foreground)] mb-3">
                {entries[0].title}
              </h3>
              <p className="text-sm text-[var(--nav-inactive)] leading-relaxed flex-1 line-clamp-6">
                {entries[0].content}
              </p>
              <div className="flex gap-2 mt-6">
                {entries[0].tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs border border-[var(--card-border)] rounded-full px-3 py-1 text-[var(--nav-inactive)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right column cards */}
        {entries.slice(1, 3).map((entry) => (
          <div
            key={entry.id}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5"
          >
            <p className="text-xs text-[var(--nav-inactive)] uppercase mb-2">
              {entry.date}
            </p>
            <h3 className="font-serif text-lg text-[var(--foreground)] mb-2">
              {entry.title}
            </h3>
            <p className="text-sm text-[var(--nav-inactive)] leading-relaxed line-clamp-3">
              {entry.content}
            </p>
            <div className="flex gap-2 mt-4">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs border border-[var(--card-border)] rounded-full px-3 py-1 text-[var(--nav-inactive)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom row cards */}
        {entries.slice(3, 6).map((entry) => (
          <div
            key={entry.id}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5"
          >
            <p className="text-xs text-[var(--nav-inactive)] uppercase mb-2">
              {entry.date}
            </p>
            <h3 className="font-serif text-base text-[var(--foreground)] mb-2">
              {entry.title}
            </h3>
            <p className="text-sm text-[var(--nav-inactive)] leading-relaxed line-clamp-3">
              {entry.content}
            </p>
            <div className="flex gap-2 mt-4">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs border border-[var(--card-border)] rounded-full px-3 py-1 text-[var(--nav-inactive)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: Previous entries list */}
      <div className="lg:hidden">
        <h2 className="text-xs uppercase tracking-[0.15em] text-[var(--nav-inactive)] mb-4">
          Previous Entries
        </h2>
        <div className="divide-y divide-[var(--card-border)]">
          {previousEntries.map((entry) => (
            <div key={entry.id} className="py-4">
              <h3 className="font-serif text-base text-[var(--foreground)] mb-1">
                {entry.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-[var(--nav-inactive)]">
                <span>{entry.date}</span>
                <span>&bull;</span>
                <span>{entry.readTime}</span>
              </div>
              <ArrowRight
                size={14}
                className="text-[var(--nav-inactive)] mt-2"
              />
            </div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-12 text-[var(--nav-inactive)]">
            <p className="text-sm">
              No journal entries yet. Tap the text box or mic above to start writing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
