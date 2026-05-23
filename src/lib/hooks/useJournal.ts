"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import { mockJournalEntries } from "@/lib/mockData";
import type { Database } from "@/lib/supabase/types";

type JournalRow = Database["public"]["Tables"]["journal_entries"]["Row"];

export interface JournalData {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mood: string | null;
  source: "voice" | "text";
  readTime: string;
  createdAt: string;
  date: string;
}

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function rowToJournal(row: JournalRow): JournalData {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tags: row.tags,
    mood: row.mood,
    source: row.source as "voice" | "text",
    readTime: estimateReadTime(row.content),
    createdAt: row.created_at,
    date: formatDate(row.created_at),
  };
}

export function useJournal() {
  const { user, isConfigured } = useAuth();
  const [entries, setEntries] = useState<JournalData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!isConfigured || !user) {
      setEntries(mockJournalEntries as unknown as JournalData[]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data) {
      setEntries(mockJournalEntries as unknown as JournalData[]);
    } else {
      setEntries(data.map(rowToJournal));
    }
    setLoading(false);
  }, [user, isConfigured]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(
    async (entry: {
      title: string;
      content: string;
      tags?: string[];
      mood?: string;
      source?: "voice" | "text";
    }) => {
      if (!isConfigured || !user) {
        const newEntry: JournalData = {
          id: crypto.randomUUID(),
          title: entry.title,
          content: entry.content,
          tags: entry.tags || [],
          mood: entry.mood || null,
          source: entry.source || "text",
          readTime: estimateReadTime(entry.content),
          createdAt: new Date().toISOString(),
          date: "Today",
        };
        setEntries((prev) => [newEntry, ...prev]);
        return newEntry;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          title: entry.title,
          content: entry.content,
          tags: entry.tags || [],
          mood: entry.mood || null,
          source: entry.source || "text",
        } as any)
        .select()
        .single();

      if (error || !data) return null;
      const newEntry = rowToJournal(data);
      setEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    },
    [user, isConfigured]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      setEntries((prev) => prev.filter((e) => e.id !== id));

      if (!isConfigured || !user) return;

      const supabase = createClient();
      await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
    },
    [user, isConfigured]
  );

  return { entries, loading, addEntry, deleteEntry, refetch: fetchEntries };
}
