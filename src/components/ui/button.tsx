import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base — instrument-grade: tight, precise, no excess
  "group/button inline-flex shrink-0 items-center justify-center rounded-sm border border-transparent bg-clip-padding text-[11px] font-medium uppercase tracking-[0.06em] whitespace-nowrap transition-all duration-75 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-35 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        // Primary — velocity red, one per screen. Maximum action.
        // Left edge has no radius — butts against context like a panel-mount button.
        default:
          "rounded-sm border-[#c01c14] bg-[#e8241a] text-white shadow-[0_1px_3px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] hover:bg-[#d41e16] hover:border-[#b01810] active:bg-[#c01c14] active:shadow-none",
        // Outline — secondary action. Panel-style: visible border, no fill.
        outline:
          "border-[#2a2a32] bg-transparent text-[#a8a8b8] hover:border-[#38383f] hover:bg-[#14141a] hover:text-[#c8c8d0] active:bg-[#0e0e12]",
        // Secondary — ghost with surface
        secondary:
          "border-transparent bg-[#14141a] text-[#a8a8b8] hover:bg-[#1a1a20] hover:text-[#c8c8d0] active:bg-[#0e0e12]",
        // Ghost — minimal, toolbar actions
        ghost:
          "border-transparent bg-transparent text-[#52525f] hover:bg-[#14141a] hover:text-[#a8a8b8] active:bg-[#0e0e12]",
        // Destructive — outline only, never filled. Caution, not panic.
        destructive:
          "border-[#5a1a18] bg-transparent text-[#e8241a] hover:border-[#7a2420] hover:bg-[#1a0a09] hover:text-[#ff3a30] active:bg-[#150706]",
        link: "border-transparent bg-transparent text-[#e8241a] underline-offset-4 hover:text-[#ff3a30] hover:underline",
      },
      size: {
        default:
          "h-7 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-5 gap-1 rounded-sm px-2 text-[10px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-6 gap-1 rounded-sm px-2.5 text-[10px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-8 gap-2 px-4 text-[11px] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-7",
        "icon-xs": "size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
        "icon-sm": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-lg": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
