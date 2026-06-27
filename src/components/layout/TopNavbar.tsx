import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";
import { ProfileWithSubsystem } from "@/types/profile";

type Subsystem = {
  id: string;
  name: string;
  color: string | null;
};

type Props = {
  profile: ProfileWithSubsystem;
  subsystems: Subsystem[];
};

export function TopNavbar({ profile, subsystems }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center border-b border-zinc-800 bg-zinc-950/95 px-4 backdrop-blur-sm md:px-6">
      <div className="flex w-full items-center justify-between gap-4">
        <MobileNav profile={profile} subsystems={subsystems} />

        <UserMenu name={profile.full_name} role={profile.role} />
      </div>
    </header>
  );
}
