export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          plan: "free" | "pro";
          accountability_score: number;
          streak_days: number;
          onboarding_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          plan?: "free" | "pro";
          accountability_score?: number;
          streak_days?: number;
          onboarding_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          plan?: "free" | "pro";
          accountability_score?: number;
          streak_days?: number;
          onboarding_complete?: boolean;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          status: "pending" | "in_progress" | "done" | "overdue";
          priority: "low" | "medium" | "high" | "urgent";
          category: string;
          due_date: string;
          due_time: string;
          completed_at: string | null;
          source: "voice" | "text" | "ai_extracted";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          status?: "pending" | "in_progress" | "done" | "overdue";
          priority?: "low" | "medium" | "high" | "urgent";
          category?: string;
          due_date: string;
          due_time?: string;
          completed_at?: string | null;
          source?: "voice" | "text" | "ai_extracted";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          status?: "pending" | "in_progress" | "done" | "overdue";
          priority?: "low" | "medium" | "high" | "urgent";
          category?: string;
          due_date?: string;
          due_time?: string;
          completed_at?: string | null;
          source?: "voice" | "text" | "ai_extracted";
          updated_at?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          tags: string[];
          mood: string | null;
          source: "voice" | "text";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          tags?: string[];
          mood?: string | null;
          source?: "voice" | "text";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          tags?: string[];
          mood?: string | null;
          source?: "voice" | "text";
          updated_at?: string;
        };
      };
      accountability_logs: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          sender: "ai" | "user";
          message: string;
          log_type: "sms" | "call" | "chat" | "lockout";
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          sender: "ai" | "user";
          message: string;
          log_type?: "sms" | "call" | "chat" | "lockout";
          created_at?: string;
        };
        Update: {
          message?: string;
          sender?: "ai" | "user";
          log_type?: "sms" | "call" | "chat" | "lockout";
        };
      };
      reminders: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          remind_at: string;
          type: "push" | "sms" | "call";
          sent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          remind_at: string;
          type?: "push" | "sms" | "call";
          sent?: boolean;
          created_at?: string;
        };
        Update: {
          remind_at?: string;
          type?: "push" | "sms" | "call";
          sent?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
