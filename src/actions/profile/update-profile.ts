"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const updateProfileSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().optional(),
  skills: z.string().optional(),
});

export async function updateProfile(
  formData: FormData
) {
  const parsed = updateProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    skills: formData.get("skills"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid form data",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
      skills: parsed.data.skills
        ? parsed.data.skills
            .split(",")
            .map((s) => s.trim())
        : [],
    })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Profile updated",
  };
}