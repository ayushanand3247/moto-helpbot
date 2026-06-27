import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";
import { ProfileWithSubsystem } from "@/types/profile";

type Subsystem = {
  id: string;
  name: string;
  color: string | null;
};

type Props = {
  children: ReactNode;
  profile: ProfileWithSubsystem;
  subsystems: Subsystem[];
};

export function AppShell({ children, profile, subsystems }: Props) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <div className="hidden md:block">
        <AppSidebar profile={profile} subsystems={subsystems} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar profile={profile} subsystems={subsystems} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}


