import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Users,
  Settings,
  ShieldCheck,
} from "lucide-react";

export type UserRole =
  | "ADMIN"
  | "BOARD"
  | "MANAGER"
  | "MEMBER";

export type NavigationItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ("ADMIN" | "BOARD" | "MANAGER" | "MEMBER")[];
};

export const navigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "BOARD", "MANAGER", "MEMBER"],
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
    roles: ["ADMIN", "BOARD", "MANAGER", "MEMBER"],
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: ListChecks,
    roles: ["ADMIN", "BOARD", "MANAGER", "MEMBER"],
  },
  {
    title: "Team",
    href: "/team",
    icon: Users,
    roles: ["ADMIN", "BOARD", "MANAGER", "MEMBER"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN", "BOARD", "MANAGER", "MEMBER"],
  },
  {
    title: "Admin",
    href: "/admin",
    icon: ShieldCheck,
    roles: ["ADMIN"],
  },
];
