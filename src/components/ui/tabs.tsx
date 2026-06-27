"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-horizontal/tabs:h-7 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        // Default: pill-style tabs in a contained strip
        default: "rounded-sm border border-[#1e1e24] bg-[#070709] p-[2px]",
        // Line: flush tabs with bottom-line indicator
        line: "gap-0 rounded-none border-b border-[#1e1e24] bg-transparent pb-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Triggers: mono, ALL-CAPS, tracked — reads as mode switches
        "relative inline-flex h-[calc(100%-2px)] flex-1 items-center justify-center gap-1.5 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] whitespace-nowrap text-[#3a3a44] transition-colors duration-75",
        "group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start",
        "hover:text-[#a8a8b8]",
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-35",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
        // Default pill: active = slightly lifted surface + bright text
        "group-data-[variant=default]/tabs-list:rounded-[2px] group-data-[variant=default]/tabs-list:data-active:bg-[#14141a] group-data-[variant=default]/tabs-list:data-active:text-[#e2e2ea] group-data-[variant=default]/tabs-list:data-active:shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
        // Line: bottom border in red — the active channel indicator
        "group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:border-b-[1.5px] group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:pb-[calc(0.25rem+1px)] group-data-[variant=line]/tabs-list:data-active:border-[#e8241a] group-data-[variant=line]/tabs-list:data-active:text-[#e2e2ea]",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-[13px] outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
