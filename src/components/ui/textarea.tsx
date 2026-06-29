import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn("flex min-h-20 w-full rounded-sm border border-border/60 bg-input px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:ring-1 focus-visible:ring-primary/20 disabled:opacity-40", className)} {...props} />
}

export { Textarea }
