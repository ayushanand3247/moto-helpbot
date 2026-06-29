import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-sm border px-1.5 py-0 font-mono text-[9px] font-medium uppercase tracking-[0.08em] transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-primary/20",
        secondary: "bg-secondary text-secondary-foreground border-border/40",
        destructive: "bg-primary/15 text-primary border-primary/20",
        outline: "border-border text-foreground",
        ghost: "text-muted-foreground",
        warning: "bg-[#ff6b2b]/15 text-[#ff6b2b] border-[#ff6b2b]/20",
        success: "bg-[#84cc16]/15 text-[#84cc16] border-[#84cc16]/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({ className, variant = "default", ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
