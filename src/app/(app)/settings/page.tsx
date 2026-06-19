import { ProfileForm } from "@/components/settings/ProfileForm";

import { getProfile } from "@/lib/auth/get-profile";

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        <p className="text-muted-foreground">
          Manage your profile.
        </p>
      </div>

      <ProfileForm
        profile={profile}
      />
    </div>
  );
}