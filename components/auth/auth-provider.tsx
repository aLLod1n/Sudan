"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Role } from "@/generated/prisma/enums";

export type Me = { name: string; role: Role; needsName: boolean };

type AuthContextValue = {
  /** undefined while loading, null when logged out. */
  user: Me | null | undefined;
  /** Opens the login popup; after login, navigates to `next` if given. */
  openLogin: (next?: string) => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Loaded only when someone actually opens it (most visitors never do).
const LoginDialog = dynamic(() => import("./login-dialog").then((m) => m.LoginDialog), { ssr: false });

/**
 * Who is logged in, fetched from /api/me after the page loads, so pages can
 * stay cached (ISR) and identical for everyone.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<Me | null | undefined>(undefined);
  const [login, setLogin] = useState<{ next?: string } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      setUser(((await res.json()) as { user: Me | null }).user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Initial "who am I" fetch once the page has loaded.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, refresh, openLogin: (next) => setLogin({ next }) }),
    [user, refresh],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {login && (
        <LoginDialog
          onClose={() => setLogin(null)}
          onDone={async () => {
            const next = login.next;
            setLogin(null);
            await refresh();
            if (next) router.push(next);
            else router.refresh();
          }}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
