import { ProfileForm } from "@/components/settings/ProfileForm";

import { getProfile } from "@/lib/auth/get-profile";

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          Settings
        </h1>
        <p className="text-sm text-zinc-400">Manage your profile.</p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}
