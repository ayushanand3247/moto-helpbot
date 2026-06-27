"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-sm border border-[#1e1e24]"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-[12px]", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        // Header: near-black, harder than the body rows.
        // Like the label strip on an instrument cluster.
        "sticky top-0 z-10 bg-[#070709] [&_tr]:border-b [&_tr]:border-[#1e1e24]",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-[#1e1e24] bg-[#070709] font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[#3a3a44] [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        // Row: thin hairline separator, channel-active stripe on hover/selected.
        // The left-edge stripe is the signature element — a live telemetry channel.
        "border-b border-[#1a1a20] transition-colors duration-75",
        "hover:bg-[#0d0d11] hover:shadow-[inset_2px_0_0_#e8241a]",
        "has-aria-expanded:bg-[#0d0d11] has-aria-expanded:shadow-[inset_2px_0_0_#e8241a]",
        "data-[state=selected]:bg-[#0f0f14] data-[state=selected]:shadow-[inset_2px_0_0_#e8241a]",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        // Column headers: mono, ALL-CAPS, wide tracking.
        // Reads as instrument panel labels, not spreadsheet headers.
        "h-7 px-3 text-left align-middle font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-[#3a3a44] whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-3 py-2 align-middle text-[#a8a8b8] whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#3a3a44]", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
