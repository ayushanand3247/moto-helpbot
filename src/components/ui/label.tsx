"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        // Labels: mono, tracked — panel field identifiers
        "flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] leading-none text-[#52525f] select-none",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-35",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-35",
        className
      )}
      {...props}
    />
  )
}

export { Label }
