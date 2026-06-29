import { ProfileForm } from "@/components/settings/ProfileForm";

import { getProfile } from "@/lib/auth/get-profile";

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <div className="space-y-8 moto-animate-in">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile.
        </p>
      </div>

      <ProfileForm
        profile={profile}
      />
    </div>
  );
}
