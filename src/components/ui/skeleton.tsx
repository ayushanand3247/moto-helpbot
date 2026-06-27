import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        // Scan shimmer — not a pulse. A sweep, like a data acquisition pass.
        // Uses the .scan-shimmer utility defined in globals.css
        "rounded-sm scan-shimmer",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
