"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Scene3DWrapper = dynamic(() => import("@/components/3d/Scene3DWrapper"), {
  ssr: false,
});
const FloatingOrb = dynamic(() => import("@/components/3d/FloatingOrb"), {
  ssr: false,
});

export default function LoginPage() {
  const { signIn, signUp, isConfigured } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isConfigured) {
      router.push("/focus");
      return;
    }

    if (mode === "login") {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/focus");
      }
    } else {
      const result = await signUp(email, password, fullName);
      if (result.error) {
        setError(result.error);
      } else {
        setError("");
        setMode("login");
        alert("Check your email to confirm your account.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md">
        {/* 3D Orb */}
        <div className="w-24 h-24 mx-auto mb-6">
          <Scene3DWrapper
            style={{ width: "100%", height: "100%", background: "transparent" }}
            cameraPosition={[0, 0, 3]}
            cameraFov={50}
          >
            <FloatingOrb color="#4A5548" pulseSpeed={0.8} size={0.8} intensity={0.7} />
          </Scene3DWrapper>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-[var(--foreground)] mb-2">
            Callio
          </h1>
          <p className="text-sm text-[var(--nav-inactive)]">
            AI Accountability
          </p>
        </div>

        {!isConfigured && (
          <div className="bg-[var(--tag-bg)] dark:bg-[var(--tag-bg-dark)] rounded-xl p-4 mb-6 text-center">
            <p className="text-xs text-[var(--nav-inactive)]">
              Demo mode — no Supabase configured
            </p>
            <button
              onClick={() => router.push("/focus")}
              className="mt-3 bg-olive text-white text-sm px-6 py-2.5 rounded-lg hover:bg-olive-dark transition-colors"
            >
              Enter Demo
            </button>
          </div>
        )}

        {isConfigured && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] mb-1.5 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Rivers"
                  required
                  className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--nav-inactive)] outline-none focus:border-olive"
                />
              </div>
            )}

            <div>
              <label className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                required
                className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--nav-inactive)] outline-none focus:border-olive"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-[var(--nav-inactive)] mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--nav-inactive)] outline-none focus:border-olive"
              />
            </div>

            {error && (
              <p className="text-xs text-overdue bg-[var(--badge-overdue-bg)] px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-olive text-white py-3 rounded-xl text-sm font-medium hover:bg-olive-dark transition-colors disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>

            <p className="text-center text-sm text-[var(--nav-inactive)]">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("signup"); setError(""); }}
                    className="text-olive hover:text-olive-dark transition-colors"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(""); }}
                    className="text-olive hover:text-olive-dark transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
