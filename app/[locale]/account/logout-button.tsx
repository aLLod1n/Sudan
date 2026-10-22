"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { getPathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { signOut } from "@/server/actions/auth";

export function LogoutButton({ label }: { label: string }) {
  const router = useRouter();
  const locale = useLocale();
  const { refresh } = useAuth();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOut();
          await refresh();
          router.replace(getPathname({ href: "/", locale }));
        })
      }
    >
      <LogOut aria-hidden />
      {label}
    </Button>
  );
}
