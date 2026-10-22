import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-28 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base transition-colors outline-none placeholder:text-grey-500 focus-visible:border-hof focus-visible:ring-2 focus-visible:ring-hof/15 disabled:cursor-not-allowed disabled:bg-faint disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
