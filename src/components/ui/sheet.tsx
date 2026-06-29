"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) { return <SheetPrimitive.Root {...props} /> }
function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) { return <SheetPrimitive.Trigger {...props} /> }
function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) { return <SheetPrimitive.Close {...props} /> }

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) { return <SheetPrimitive.Portal {...props} /> }

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return <SheetPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/40 backdrop-blur-sm", className)} {...props} />
}

function SheetContent({ className, children, side = "right", ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content className={cn("fixed z-50 flex flex-col gap-4 border-[#222228] bg-popover shadow-[0_8px_32px_rgba(0,0,0,0.6)] data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:border-b", className)} {...props}>
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("flex flex-col gap-1.5 px-5 pt-5", className)} {...props} /> }
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("mt-auto flex flex-col gap-2 border-t border-[#1e1e24] px-5 py-3", className)} {...props} /> }
function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) { return <SheetPrimitive.Title className={cn("font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground", className)} {...props} /> }
function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) { return <SheetPrimitive.Description className={cn("text-sm text-foreground/70", className)} {...props} /> }

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger }
