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
    <header className="border-b p-4">
      <div className="flex items-center justify-between">
        <MobileNav profile={profile} />

        <UserMenu
          name={profile.full_name}
          role={profile.role}
        />
      </div>
    </header>
  );
}