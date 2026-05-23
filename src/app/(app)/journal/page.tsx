"use client";

import { useState } from "react";
import { Lock, Sparkles, ArrowRight, Search } from "lucide-react";
import { useJournal } from "@/lib/hooks/useJournal";
import Link from "next/link";

export default function JournalPage() {
  const { entries } = useJournal();
  const [filter, setFilter] = useState<"this-week" | "all">("this-week");

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

      {/* Desktop: tabs and search */}
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
          <div
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[var(--nav-inactive)]">
                {featuredEntry.date} • {featuredEntry.createdAt.split("T")[1]?.slice(0, 5)}
              </span>
              <Lock size={14} className="text-[var(--nav-inactive)]" />
            </div>
            <h3 className="font-serif text-lg text-[var(--foreground)] mb-2">
              {featuredEntry.title}
            </h3>
            <p className="text-sm text-[var(--nav-inactive)] leading-relaxed mb-4">
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
            7 Day Streak
          </h3>
          <p className="text-xs text-[var(--nav-inactive)] mt-1">
            Consistent reflection leads to clarity.
          </p>
        </div>
      </div>

      {/* Desktop: masonry grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-4 mb-8">
        {/* Featured large card */}
        <div className="lg:col-span-2 lg:row-span-2">
          <div
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 h-full flex flex-col"
          >
            <div className="flex items-center gap-2 text-xs text-[var(--nav-inactive)] mb-4">
              <span className="uppercase">
                {entries[3]?.date}
              </span>
              <span>•</span>
              <span>{entries[3]?.readTime}</span>
            </div>
            <h3 className="font-serif text-2xl text-[var(--foreground)] mb-3">
              {entries[3]?.title}
            </h3>
            <p className="text-sm text-[var(--nav-inactive)] leading-relaxed flex-1">
              {entries[3]?.content}
            </p>
            <div className="flex gap-2 mt-6">
              {entries[3]?.tags.map((tag) => (
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

        {/* Right column cards */}
        {entries.slice(1, 2).map((entry, i) => (
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
            <p className="text-sm text-[var(--nav-inactive)] leading-relaxed">
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

        {/* Bottom row - 3 smaller cards */}
        {entries.slice(2, 5).map((entry, i) => (
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
                <span>•</span>
                <span>{entry.readTime}</span>
              </div>
              <ArrowRight
                size={14}
                className="text-[var(--nav-inactive)] mt-2"
              />
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mt-8 text-center py-6">
          <p className="text-lg italic text-[var(--card-border)] leading-relaxed">
            &ldquo;We do not learn from experience... we learn from reflecting
            on experience.&rdquo;
          </p>
          <p className="text-sm text-[var(--nav-inactive)] mt-2">
            — John Dewey
          </p>
        </div>
      </div>

      {/* New Entry FAB (mobile) */}
      <Link
        href="/journal/new"
        className="lg:hidden fixed bottom-24 left-4 right-4 bg-olive text-white py-3 rounded-xl text-sm font-medium text-center hover:bg-olive-dark transition-colors shadow-lg z-40"
      >
        + New Entry
      </Link>
    </div>
  );
}
