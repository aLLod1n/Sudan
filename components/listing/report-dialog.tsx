"use client";

import { useActionState, useRef } from "react";
import { CircleCheck, Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reportListing, type ReportState } from "@/server/actions/report";

type Labels = {
  button: string;
  title: string;
  reason: string;
  comment: string;
  commentPlaceholder: string;
  submit: string;
  sending: string;
  success: string;
  close: string;
  reasons: { value: string; label: string }[];
  errors: Record<"errorReason" | "errorComment" | "errorRateLimit" | "errorGeneric", string>;
};

/** "Report this listing" link + native <dialog> with the reasons form. */
export function ReportDialog({ listingId, labels }: { listingId: string; labels: Labels }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<ReportState, FormData>(reportListing, { status: "idle" });

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-foggy underline underline-offset-4 hover:text-hof"
      >
        <Flag className="size-4" aria-hidden />
        {labels.button}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="report-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 shadow-overlay backdrop:bg-black/50"
      >
        <div className="flex items-center justify-between border-b border-bebe px-5 py-3">
          <h2 id="report-title" className="text-ui font-semibold">
            {labels.title}
          </h2>
          <Button type="button" variant="ghost" size="icon" aria-label={labels.close} onClick={() => dialogRef.current?.close()}>
            <X aria-hidden />
          </Button>
        </div>

        {state.status === "success" ? (
          <div className="flex flex-col items-center gap-3 px-5 py-8 text-center" role="status">
            <CircleCheck className="size-10 text-hof" strokeWidth={1.5} aria-hidden />
            <p>{labels.success}</p>
            <Button type="button" variant="outline" onClick={() => dialogRef.current?.close()}>
              {labels.close}
            </Button>
          </div>
        ) : (
          <form action={action} className="flex flex-col gap-4 p-5">
            <input type="hidden" name="listingId" value={listingId} />
            <fieldset className="flex flex-col gap-1" aria-describedby={state.status === "error" ? "report-error" : undefined}>
              <legend className="mb-2 text-sm font-medium">{labels.reason}</legend>
              {labels.reasons.map((r) => (
                <label key={r.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-faint">
                  <input type="radio" name="reason" value={r.value} required className="size-5 accent-hof" />
                  {r.label}
                </label>
              ))}
            </fieldset>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-comment" className="text-sm font-medium">
                {labels.comment}
              </label>
              <Textarea id="report-comment" name="comment" maxLength={500} placeholder={labels.commentPlaceholder} className="min-h-20" />
            </div>
            {state.status === "error" && (
              <p id="report-error" role="alert" className="text-sm text-destructive">
                {labels.errors[state.error]}
              </p>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? labels.sending : labels.submit}
            </Button>
          </form>
        )}
      </dialog>
    </>
  );
}
