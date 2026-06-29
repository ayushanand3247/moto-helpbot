import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";
import { ProfileWithSubsystem } from "@/types/profile";

type Props = {
  profile: ProfileWithSubsystem;
};

export function TopNavbar({
  profile,
}: Props) {
  return (
    <header className="h-12 flex items-center justify-between px-5 border-b border-border/30 bg-background/80 backdrop-blur-sm">
      <MobileNav profile={profile} />

      {/* Spacer for desktop — pushes user menu to right */}
      <div className="hidden md:block" />

      <UserMenu
        name={profile.full_name}
        role={profile.role}
      />
    </header>
  );
}
