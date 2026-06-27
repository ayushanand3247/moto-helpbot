"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navigation } from "@/lib/constants/navigation";
import { nameToSlug } from "@/lib/subsystems/slug";
import { cn } from "@/lib/utils";

type Subsystem = {
  id: string;
  name: string;
  color: string | null;
};

type Props = {
  profile: {
    role: string;
  };
  subsystems: Subsystem[];
};

export function MobileNav({ profile, subsystems }: Props) {
  const pathname = usePathname();

  const visibleItems = navigation.filter((item) =>
    item.roles.includes(profile.role as "ADMIN" | "BOARD" | "MEMBER")
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 border-zinc-800 bg-zinc-950 p-0">
        <SheetHeader className="border-b border-zinc-800 px-4 py-4">
          <SheetTitle className="text-sm font-semibold tracking-tight">
            MotoManipal
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-0.5 p-2">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-900 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-red-600" />
                )}
                {item.title}
              </Link>
            );
          })}

          {subsystems.length > 0 && (
            <div className="mt-4 border-t border-zinc-800 pt-4">
              <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Subsystems
              </p>
              {subsystems.map((sub) => {
                const slug = nameToSlug(sub.name);
                const href = `/subsystems/${slug}`;
                const isActive = pathname === href;

                return (
                  <Link
                    key={sub.id}
                    href={href}
                    className={cn(
                      "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-zinc-900 font-medium text-zinc-100"
                        : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                    )}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: sub.color || "#71717a" }}
                    />
                    {sub.name}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
