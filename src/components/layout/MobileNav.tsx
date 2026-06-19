"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

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
          | "MEMBER"
      )
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="md:hidden">
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>

      <SheetContent side="left">
        <nav className="mt-8 flex flex-col gap-4">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}