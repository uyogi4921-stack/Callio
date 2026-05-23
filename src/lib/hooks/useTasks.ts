"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import { mockTasks } from "@/lib/mockData";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

export interface TaskData {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "done" | "overdue";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  dueDate: string;
  dueTime: string;
  completedAt?: string;
  source: "voice" | "text" | "ai_extracted";
  createdAt: string;
}

function rowToTask(row: TaskRow): TaskData {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    category: row.category,
    dueDate: row.due_date,
    dueTime: row.due_time,
    completedAt: row.completed_at ?? undefined,
    source: row.source,
    createdAt: row.created_at,
  };
}

export function useTasks() {
  const { user, isConfigured } = useAuth();
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!isConfigured || !user) {
      setTasks(mockTasks);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true });

    if (error || !data) {
      setTasks(mockTasks);
    } else {
      setTasks(data.map(rowToTask));
    }
    setLoading(false);
  }, [user, isConfigured]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(
    async (task: {
      title: string;
      description?: string;
      priority?: string;
      category?: string;
      due_date: string;
      due_time?: string;
      source?: string;
    }) => {
      if (!isConfigured || !user) {
        const newTask: TaskData = {
          id: crypto.randomUUID(),
          title: task.title,
          description: task.description || "",
          status: "pending",
          priority: (task.priority as TaskData["priority"]) || "medium",
          category: task.category || "Quick Action",
          dueDate: task.due_date,
          dueTime: task.due_time || "12:00 PM",
          source: (task.source as TaskData["source"]) || "text",
          createdAt: new Date().toISOString(),
        };
        setTasks((prev) => [newTask, ...prev]);
        return newTask;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          title: task.title,
          description: task.description || "",
          priority: (task.priority || "medium") as TaskRow["priority"],
          category: task.category || "Quick Action",
          due_date: task.due_date,
          due_time: task.due_time || "12:00 PM",
          source: (task.source || "text") as TaskRow["source"],
        } as any)
        .select()
        .single();

      if (error || !data) return null;
      const newTask = rowToTask(data);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    [user, isConfigured]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<TaskData>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );

      if (!isConfigured || !user) return;

      const supabase = createClient();
      const dbUpdates: Record<string, unknown> = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.status) {
        dbUpdates.status = updates.status;
        if (updates.status === "done") {
          dbUpdates.completed_at = new Date().toISOString();
        }
      }
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.category) dbUpdates.category = updates.category;

      await (supabase as any)
        .from("tasks")
        .update(dbUpdates)
        .eq("id", id)
        .eq("user_id", user.id);
    },
    [user, isConfigured]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));

      if (!isConfigured || !user) return;

      const supabase = createClient();
      await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
    },
    [user, isConfigured]
  );

  return { tasks, loading, addTask, updateTask, deleteTask, refetch: fetchTasks };
}
