import { redirect } from "next/navigation";
import { getProfile } from "./get-profile";

export async function requireAdmin() {
  const profile = await getProfile();

  if (!profile || profile.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return profile;
}