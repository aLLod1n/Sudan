"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginFlow } from "./login-flow";

/**
 * Airbnb-style "Log in or sign up" popup: centred card on desktop,
 * bottom sheet on phones. Native <dialog>: Esc and the back gesture close it.
 */
export function LoginDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const t = useTranslations("Auth");
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="login-title"
      onClose={onClose}
      // Click on the backdrop closes it.
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-white p-0 shadow-overlay backdrop:bg-black/50 md:m-auto md:max-w-[568px] md:rounded-[32px]"
    >
      <div className="flex justify-end px-4 pt-4 md:px-6 md:pt-6">
        <Button type="button" variant="ghost" size="icon" aria-label={t("close")} onClick={() => ref.current?.close()}>
          <X aria-hidden />
        </Button>
      </div>
      <div className="px-6 pb-8 md:px-8 md:pb-10">
        <LoginFlow onDone={onDone} />
      </div>
    </dialog>
  );
}
