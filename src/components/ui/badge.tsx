import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // Badges: mono, ALL-CAPS, 10px — they read as system states, not labels
  // Height exactly 16px — fits inline with 13px body text without pushing line height
  "group/badge inline-flex h-4 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border px-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.08em] whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-2!",
  {
    variants: {
      variant: {
        // Default: red — critical / high-priority signal
        default: "border-[#5a1a18]/60 bg-[#1a0804] text-[#e8241a]",
        secondary: "border-[#28282e] bg-[#0e0e12] text-[#52525f]",
        destructive: "border-[#5a1a18]/60 bg-[#1a0804] text-[#e8241a]",
        // Outline: standard state tag
        outline: "border-[#2a2a32] bg-transparent text-[#52525f]",
        ghost: "border-transparent bg-transparent text-[#3a3a44]",
        link: "border-transparent bg-transparent text-[#e8241a] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
