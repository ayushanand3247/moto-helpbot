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
  | "TEAM_MANAGER"
  | "CAPTAIN"
  | "SUBSYSTEM_LEAD"
  | "MEMBER";

export type NavigationItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ("ADMIN" | "TEAM_MANAGER" | "CAPTAIN" | "SUBSYSTEM_LEAD" | "MEMBER")[];
};

export const navigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "TEAM_MANAGER", "CAPTAIN", "SUBSYSTEM_LEAD", "MEMBER"],
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
    roles: ["ADMIN", "TEAM_MANAGER", "CAPTAIN", "SUBSYSTEM_LEAD", "MEMBER"],
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: ListChecks,
    roles: ["ADMIN", "TEAM_MANAGER", "CAPTAIN", "SUBSYSTEM_LEAD", "MEMBER"],
  },
  {
    title: "Team",
    href: "/team",
    icon: Users,
    roles: ["ADMIN", "TEAM_MANAGER", "CAPTAIN", "SUBSYSTEM_LEAD", "MEMBER"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN", "TEAM_MANAGER", "CAPTAIN", "SUBSYSTEM_LEAD", "MEMBER"],
  },
  {
    title: "Admin",
    href: "/admin",
    icon: ShieldCheck,
    roles: ["ADMIN"],
  },
];
