import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "cn"

// Native <select>: opens the OS picker on phones, needs no client JS and
// works inside plain GET forms (search filters).
function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className={cn("relative w-full", className)} data-slot="native-select">
      <select
        className="h-11 w-full min-w-0 appearance-none rounded-lg border border-input bg-card ps-3 pe-9 text-base transition-colors outline-none focus-visible:border-hof focus-visible:ring-2 focus-visible:ring-hof/15 disabled:cursor-not-allowed disabled:bg-faint disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 md:text-sm"
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden
        className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-foggy"
      />
    </div>
  )
}

export { NativeSelect }
