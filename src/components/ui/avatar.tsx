"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "lg"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        // Square with tight radius — not a social app bubble, a team roster tag
        "group/avatar relative flex size-6 shrink-0 rounded-sm select-none",
        "data-[size=lg]:size-8 data-[size=sm]:size-5",
        // Inset border — subtle panel edge
        "after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-black/30",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full rounded-[inherit] object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        // Mono initials: tabular, tracked — read as an ID tag, not a profile picture
        "flex size-full items-center justify-center rounded-[inherit] bg-[#14141a] font-mono text-[8px] font-semibold uppercase tracking-[0.06em] text-[#5a5a6a]",
        "group-data-[size=sm]/avatar:text-[7px] group-data-[size=lg]/avatar:text-[10px]",
        className
      )}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-[#e8241a] ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-1.5 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2 group-data-[size=default]/avatar:[&>svg]:size-1.5",
        "group-data-[size=lg]/avatar:size-2.5 group-data-[size=lg]/avatar:[&>svg]:size-1.5",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-1 *:data-[slot=avatar]:ring-1 *:data-[slot=avatar]:ring-[#050507]",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-6 shrink-0 items-center justify-center rounded-sm bg-[#14141a] font-mono text-[8px] font-semibold text-[#52525f] ring-1 ring-[#050507]",
        "group-has-data-[size=lg]/avatar-group:size-8 group-has-data-[size=sm]/avatar-group:size-5",
        "[&>svg]:size-3 group-has-data-[size=lg]/avatar-group:[&>svg]:size-3.5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-2.5",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}
