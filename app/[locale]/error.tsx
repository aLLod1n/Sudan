"use client";

import { useTranslations } from "next-intl";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("Common");
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <WifiOff className="size-12 text-foggy" strokeWidth={1.4} aria-hidden />
      <h1 className="text-heading-sm font-semibold">{t("error")}</h1>
      <p className="text-foggy">{t("errorBody")}</p>
      <Button onClick={reset}>{t("retry")}</Button>
    </div>
  );
}
