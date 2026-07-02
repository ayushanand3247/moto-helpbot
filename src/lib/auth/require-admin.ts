import { redirect } from "next/navigation";
import { getProfile } from "./get-profile";
import { isAdmin } from "@/lib/roles";

export async function requireAdmin() {
  const profile = await getProfile();

  if (!profile || !isAdmin(profile.role)) {
    redirect("/dashboard");
  }

  return profile;
}