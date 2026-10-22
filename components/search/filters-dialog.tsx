"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { CleanGetForm, formToQuery } from "./clean-get-form";

/** Resets every field to "any". Selects get a change event so city -> neighbourhood resets too. */
function clearForm(form: HTMLFormElement) {
  const selects: HTMLSelectElement[] = [];
  for (const el of Array.from(form.elements)) {
    if (el instanceof HTMLInputElement) {
      if (el.type === "checkbox") el.checked = false;
      else if (el.type === "radio") el.checked = el.value === "";
      else if (el.type !== "hidden") el.value = "";
    } else if (el instanceof HTMLSelectElement) {
      el.selectedIndex = 0;
      selects.push(el);
    }
  }
  // Only after everything is cleared, so listeners never see a half-cleared form.
  for (const select of selects) select.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * "Filters" button + popup (myhome.ge / Airbnb pattern): centred on desktop,
 * full screen on phones, sticky footer with "Clear all" and a live
 * "Show N results" button so nobody lands on an empty page.
 */
export function FiltersDialog({
  action,
  activeCount,
  initialCount,
  children,
}: {
  action: string;
  activeCount: number;
  initialCount: number;
  children: React.ReactNode;
}) {
  const t = useTranslations("Search");
  const tCommon = useTranslations("Common");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [count, setCount] = useState(initialCount);
  const [counting, setCounting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abort = useRef<AbortController>(undefined);

  // New page of results -> the server count is the truth again.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setCount(initialCount), [initialCount]);

  const updateCount = useCallback((query: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      abort.current?.abort();
      abort.current = new AbortController();
      setCounting(true);
      try {
        const res = await fetch(`/api/listings/count?${query}`, { signal: abort.current.signal });
        setCount(((await res.json()) as { count: number }).count);
      } catch {
        // Aborted or offline: keep the last number.
      } finally {
        setCounting(false);
      }
    }, 250);
  }, []);

  const close = () => dialogRef.current?.close();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        shape="pill"
        className={cn("shrink-0 border-deco", activeCount > 0 && "border-hof border-2")}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <SlidersHorizontal aria-hidden />
        {t("filters")}
        {activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-hof text-xs text-white">{activeCount}</span>
        )}
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby="filters-title"
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-white p-0 backdrop:bg-black/50 md:m-auto md:h-auto md:max-h-[88dvh] md:max-w-[780px] md:rounded-2xl md:shadow-overlay"
      >
        <CleanGetForm
          ref={formRef}
          action={action}
          onQueryChange={updateCount}
          onNavigate={close}
          className="flex h-full max-h-[inherit] flex-col md:max-h-[88dvh]"
        >
          <header className="relative flex h-16 shrink-0 items-center justify-center border-b border-bebe px-14">
            <Button type="button" variant="ghost" size="icon" className="absolute start-3" aria-label={tCommon("close")} onClick={close}>
              <X aria-hidden />
            </Button>
            <h2 id="filters-title" className="text-ui font-semibold">
              {t("filters")}
            </h2>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 md:px-8">{children}</div>

          <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-bebe px-6 py-4 md:px-8">
            <button
              type="button"
              className="min-h-11 text-sm font-medium underline underline-offset-4"
              onClick={() => {
                if (!formRef.current) return;
                clearForm(formRef.current);
                updateCount(formToQuery(formRef.current));
              }}
            >
              {t("clear")}
            </button>
            <Button type="submit" size="lg" className="min-w-44" disabled={count === 0}>
              {counting ? <Loader2 className="animate-spin" aria-hidden /> : null}
              {t("showCount", { count })}
            </Button>
          </footer>
        </CleanGetForm>
      </dialog>
    </>
  );
}
