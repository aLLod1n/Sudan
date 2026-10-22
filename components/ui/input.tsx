import * as React from "react"
import { cn } from "cn"

// 44px tall, 16px text on mobile (prevents iOS zoom), 8px radius per design.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2 text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-grey-500 focus-visible:border-hof focus-visible:ring-2 focus-visible:ring-hof/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-faint disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
