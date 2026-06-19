"use client";

import { useState } from "react";

import { updateProfile } from "@/actions/profile/update-profile";

import { ProfileWithSubsystem } from "@/types/profile";

type Props = {
  profile: ProfileWithSubsystem;
};

export function ProfileForm({
  profile,
}: Props) {
  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    formData: FormData
  ) {
    const result =
      await updateProfile(formData);

    setMessage(result.message);
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-6 max-w-2xl"
    >
      <div>
        <label className="block mb-2">
          Full Name
        </label>

        <input
          name="full_name"
          defaultValue={
            profile.full_name
          }
          className="w-full rounded-md border p-2"
        />
      </div>

      <div>
        <label className="block mb-2">
          Email
        </label>

        <input
          disabled
          value={profile.email}
          className="w-full rounded-md border p-2 bg-muted"
        />
      </div>

      <div>
        <label className="block mb-2">
          Phone
        </label>

        <input
          name="phone"
          defaultValue={
            profile.phone ?? ""
          }
          className="w-full rounded-md border p-2"
        />
      </div>

      <div>
        <label className="block mb-2">
          Skills
        </label>

        <input
          name="skills"
          defaultValue={
            profile.skills?.join(", ") ??
            ""
          }
          className="w-full rounded-md border p-2"
        />
      </div>

      <button
        type="submit"
        className="rounded-md border px-4 py-2"
      >
        Save Changes
      </button>

      {message && (
        <p className="text-sm">
          {message}
        </p>
      )}
    </form>
  );
}