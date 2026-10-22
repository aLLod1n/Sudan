"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/** FormData -> short query string: empty fields dropped, repeated keys joined with commas. */
export function formToQuery(form: HTMLFormElement): string {
  const values = new Map<string, string[]>();
  for (const [key, value] of new FormData(form)) {
    if (typeof value !== "string" || value.trim() === "") continue;
    values.set(key, [...(values.get(key) ?? []), value.trim()]);
  }
  const params = new URLSearchParams();
  for (const [key, list] of values) params.set(key, list.join(","));
  return params.toString();
}

/**
 * GET form that keeps shared links short (/listings?city=khartoum&type=APARTMENT,HOUSE
 * instead of ?deal=&type=APARTMENT&type=HOUSE&city=khartoum). Without JS it
 * still submits as a normal GET form, which the server also understands.
 */
export function CleanGetForm({
  action,
  children,
  onQueryChange,
  onNavigate,
  ...props
}: Omit<React.ComponentProps<"form">, "action" | "method" | "onSubmit"> & {
  action: string;
  /** Called with the current query whenever a field changes (live result count). */
  onQueryChange?: (query: string) => void;
  /** Called right before navigating (e.g. to close a popup). */
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      {...props}
      action={action}
      method="get"
      aria-busy={pending || undefined}
      data-pending={pending || undefined}
      onChange={onQueryChange ? (e) => onQueryChange(formToQuery(e.currentTarget)) : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        const query = formToQuery(event.currentTarget);
        onNavigate?.();
        startTransition(() => router.push(query ? `${action}?${query}` : action));
      }}
    >
      {children}
    </form>
  );
}
