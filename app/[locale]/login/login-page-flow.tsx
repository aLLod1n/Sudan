"use client";

import { useRouter } from "next/navigation";
import { LoginFlow } from "@/components/auth/login-flow";
import { useAuth } from "@/components/auth/auth-provider";

export function LoginPageFlow({ next }: { next: string }) {
  const router = useRouter();
  const { refresh } = useAuth();
  return (
    <LoginFlow
      onDone={async () => {
        await refresh();
        router.replace(next);
      }}
    />
  );
}
