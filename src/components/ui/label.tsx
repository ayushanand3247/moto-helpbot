import * as React from "react"
import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-[9px] font-mono font-medium uppercase tracking-[0.1em] text-muted-foreground", className)} {...props} />
}

export { Label }
