import * as React from "react";
import { cn } from "cn";

// Pill buttons for short option lists (deal, type, rooms…). Selected = dark
// fill, per the design's monochrome system. Two flavours:
//  - PillInput: a real radio/checkbox inside a form (works without JS)
//  - pillClass: style for links that toggle a URL filter

export function pillClass(selected: boolean, className?: string) {
  return cn(
    "inline-flex h-11 shrink-0 cursor-pointer select-none items-center justify-center gap-2 rounded-full border px-4 text-sm whitespace-nowrap transition-colors",
    selected ? "border-hof bg-hof font-medium text-white" : "border-deco bg-white text-hof hover:border-hof",
    className,
  );
}

/** Radio or checkbox styled as a pill. The input is visually hidden but focusable. */
export function PillInput({
  type,
  name,
  value,
  defaultChecked,
  icon,
  children,
  className,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  defaultChecked?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        // relative: keeps the visually-hidden input inside the pill, so focusing it
        // never scrolls an outer container.
        "relative inline-flex h-11 shrink-0 cursor-pointer select-none items-center justify-center gap-2 rounded-full border border-deco bg-white px-4 text-sm whitespace-nowrap text-hof transition-colors hover:border-hof",
        "has-[:checked]:border-hof has-[:checked]:bg-hof has-[:checked]:font-medium has-[:checked]:text-white",
        "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-hof/30",
        className,
      )}
    >
      <input type={type} name={name} value={value} defaultChecked={defaultChecked} className="sr-only" />
      {icon}
      {children}
    </label>
  );
}

/** Section of pills with a visible heading; role=group keeps it one unit for screen readers. */
export function PillGroup({
  legend,
  children,
  className,
}: {
  legend: string;
  children: React.ReactNode;
  className?: string;
}) {
  const id = React.useId();
  return (
    <div role="group" aria-labelledby={id} className={className}>
      <h3 id={id} className="mb-3 text-ui font-semibold">
        {legend}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
