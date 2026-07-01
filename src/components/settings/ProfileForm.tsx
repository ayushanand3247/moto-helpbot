"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { updateProfile } from "@/actions/profile/update-profile";

import { ProfileWithSubsystem } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, Wrench } from "lucide-react";

type Props = {
  profile: ProfileWithSubsystem;
};

export function ProfileForm({
  profile,
}: Props) {
  const router = useRouter();
  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    formData: FormData
  ) {
    const result =
      await updateProfile(formData);

    setMessage(result.message);
    if (result.success) {
      router.refresh();
    }
  }

  return (
    <form
      action={handleSubmit}
      className="max-w-xl space-y-5"
    >
      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
          <User className="size-3" />
          Full Name
        </label>
        <Input
          name="full_name"
          defaultValue={profile.full_name}
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
          <Mail className="size-3" />
          Email
        </label>
        <Input
          disabled
          value={profile.email}
          className="opacity-50"
        />
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
          <Phone className="size-3" />
          Phone
        </label>
        <Input
          name="phone"
          defaultValue={profile.phone ?? ""}
        />
      </div>

      {/* Skills */}
      <div className="space-y-1.5">
        <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
          <Wrench className="size-3" />
          Skills
        </label>
        <Input
          name="skills"
          defaultValue={profile.skills?.join(", ") ?? ""}
        />
        <p className="text-[0.6rem] text-muted-foreground/70">
          Comma-separated
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" size="sm">
          Save Changes
        </Button>

        {message && (
          <p className="text-xs text-moto-green">
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
