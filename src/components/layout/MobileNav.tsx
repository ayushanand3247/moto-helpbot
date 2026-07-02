"use client";

import Link from "next/link";
import { Menu, Hexagon } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { navigation } from "@/lib/constants/navigation";

type Props = {
  profile: {
    role: string;
  };
};

export function MobileNav({
  profile,
}: Props) {
  const visibleItems = navigation.filter(
    (item) =>
      item.roles.includes(
        profile.role as
          | "ADMIN"
          | "BOARD"
          | "MANAGER"
          | "MEMBER"
      )
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="md:hidden size-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <Menu className="size-4" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-56 p-0">
        {/* Brand */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-border/30">
          <Hexagon className="size-5 text-moto-cyan" strokeWidth={1.5} />
          <span className="text-sm font-semibold tracking-widest uppercase text-foreground/90">
            MotoManipal
          </span>
        </div>

        <nav className="flex flex-col gap-0.5 p-2 mt-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.8rem] font-medium tracking-wide text-sidebar-foreground hover:text-foreground/90 hover:bg-muted/50 transition-colors"
              >
                <Icon className="size-4 text-muted-foreground/70 group-hover:text-foreground/70" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
