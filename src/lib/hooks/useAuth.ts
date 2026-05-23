"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  profile: ProfileData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  plan: "free" | "pro";
  accountability_score: number;
  streak_days: number;
}

const MOCK_PROFILE: ProfileData = {
  id: "mock-user",
  full_name: "Alex Rivers",
  email: "alex@example.com",
  avatar_url: null,
  plan: "pro",
  accountability_score: 98,
  streak_days: 7,
};

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://")
  );
}

export function useAuthProvider(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setProfile(MOCK_PROFILE);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data as ProfileData);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!configured) return { error: "Supabase not configured" };
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data as ProfileData);
      }

      return {};
    },
    [configured]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, phone?: string) => {
      if (!configured) return { error: "Supabase not configured" };
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone: phone || "" } },
      });
      if (error) return { error: error.message };
      return {};
    },
    [configured]
  );

  const signOut = useCallback(async () => {
    if (!configured) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [configured]);

  return {
    user,
    profile: configured ? profile : MOCK_PROFILE,
    loading,
    signIn,
    signUp,
    signOut,
    isConfigured: configured,
  };
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = AuthContext.Provider;

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
