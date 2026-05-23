"use client";

import { useState } from "react";
import { Search, BookOpen, Trash2, Eye, Tag } from "lucide-react";
import { useJournal, type JournalData } from "@/lib/hooks/useJournal";

export default function AdminJournalPage() {
  const { entries, deleteEntry } = useJournal();
  const [search, setSearch] = useState("");
  const [filterMood, setFilterMood] = useState<string>("all");
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const allMoods = Array.from(
    new Set(entries.map((e) => e.mood).filter(Boolean))
  ) as string[];

  const filtered = entries.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase());
    const matchMood = filterMood === "all" || e.mood === filterMood;
    return matchSearch && matchMood;
  });

  const moodColors: Record<string, string> = {
    motivated: "bg-olive/20 text-olive",
    struggling: "bg-overdue/20 text-overdue",
    neutral: "bg-[var(--input-bg)] text-[var(--nav-inactive)]",
    happy: "bg-yellow-100 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-400",
    anxious: "bg-purple-100 text-purple-700 dark:bg-purple-400/10 dark:text-purple-400",
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-[var(--foreground)]">Journal Entries</h1>
        <p className="text-sm text-[var(--nav-inactive)] mt-1">
          {entries.length} total entries across all users
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 text-center">
          <p className="font-serif text-2xl text-[var(--foreground)]">{entries.length}</p>
          <p className="text-xs text-[var(--nav-inactive)] mt-0.5">Total</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 text-center">
          <p className="font-serif text-2xl text-olive">
            {entries.filter((e) => e.source === "voice").length}
          </p>
          <p className="text-xs text-[var(--nav-inactive)] mt-0.5">Voice</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 text-center">
          <p className="font-serif text-2xl text-violet-400">
            {entries.filter((e) => e.source === "text").length}
          </p>
          <p className="text-xs text-[var(--nav-inactive)] mt-0.5">Text</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 text-center">
          <p className="font-serif text-2xl text-purple-500">
            {new Set(entries.flatMap((e) => e.tags)).size}
          </p>
          <p className="text-xs text-[var(--nav-inactive)] mt-0.5">Unique Tags</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={16} className="text-[var(--nav-inactive)]" />
          <input
            type="text"
            placeholder="Search journal entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 text-[var(--foreground)] placeholder:text-[var(--nav-inactive)]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterMood("all")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filterMood === "all"
                ? "border-[var(--foreground)] text-[var(--foreground)]"
                : "border-[var(--card-border)] text-[var(--nav-inactive)]"
            }`}
          >
            All Moods
          </button>
          {allMoods.map((mood) => (
            <button
              key={mood}
              onClick={() => setFilterMood(mood)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                filterMood === mood
                  ? "border-[var(--foreground)] text-[var(--foreground)]"
                  : "border-[var(--card-border)] text-[var(--nav-inactive)]"
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {filtered.map((entry) => (
          <div
            key={entry.id}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl overflow-hidden fade-in"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 min-w-0">
                  <BookOpen
                    size={18}
                    className="text-[var(--nav-inactive)] flex-shrink-0 mt-0.5"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-[var(--foreground)]">
                      {entry.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--nav-inactive)]">
                        {new Date(entry.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-xs text-[var(--nav-inactive)]">
                        &middot; {entry.readTime}
                      </span>
                      <span className="text-xs text-[var(--nav-inactive)] capitalize">
                        &middot; {entry.source}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {entry.mood && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        moodColors[entry.mood] || moodColors.neutral
                      }`}
                    >
                      {entry.mood}
                    </span>
                  )}
                </div>
              </div>

              {/* Preview / Expanded */}
              <div className="ml-[30px]">
                <p
                  className={`text-xs text-[var(--nav-inactive)] leading-relaxed ${
                    expandedEntry === entry.id ? "" : "line-clamp-2"
                  }`}
                >
                  {entry.content}
                </p>

                {/* Tags */}
                {entry.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    <Tag size={12} className="text-[var(--nav-inactive)]" />
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--input-bg)] text-[var(--nav-inactive)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1 mt-3">
                <button
                  onClick={() =>
                    setExpandedEntry(expandedEntry === entry.id ? null : entry.id)
                  }
                  className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--nav-inactive)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--input-bg)] transition-colors"
                >
                  <Eye size={14} />
                  {expandedEntry === entry.id ? "Collapse" : "Expand"}
                </button>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--nav-inactive)] hover:text-overdue rounded-lg hover:bg-[var(--badge-overdue-bg)] transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-8 text-center text-sm text-[var(--nav-inactive)]">
            No journal entries match your search
          </div>
        )}
      </div>
    </div>
  );
}
