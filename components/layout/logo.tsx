import { cn } from "cn";

/** House mark in Rausch + wordmark. The only multicolour graphic per the design. */
export function Logo({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-rausch", className)}>
      <svg viewBox="0 0 32 32" aria-hidden className="size-8 shrink-0" fill="currentColor">
        <path d="M16 3.2 2.9 14.1a1.6 1.6 0 0 0 2 2.5l1.5-1.2v11.4A2.2 2.2 0 0 0 8.6 29h4.9v-7.4a2.5 2.5 0 0 1 5 0V29h4.9a2.2 2.2 0 0 0 2.2-2.2V15.4l1.5 1.2a1.6 1.6 0 0 0 2-2.5Z" />
      </svg>
      <span className="text-[22px] font-semibold leading-none">{name}</span>
    </span>
  );
}
