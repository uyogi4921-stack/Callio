"use client";

import { AuthProvider, useAuthProvider } from "@/lib/hooks/useAuth";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();

  return <AuthProvider value={auth}>{children}</AuthProvider>;
}
