"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { NativeSelect } from "@/components/ui/native-select";

/** Changing the sort navigates right away and keeps the other filters. */
export function SortSelect({
  label,
  value,
  options,
  hrefFor,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  /** Prebuilt URL for each sort value (built on the server). */
  hrefFor: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-foggy sm:inline">{label}</span>
      <NativeSelect
        aria-label={label}
        className="w-44"
        value={value}
        disabled={pending}
        onChange={(e) => startTransition(() => router.push(hrefFor[e.target.value]))}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </NativeSelect>
    </label>
  );
}
