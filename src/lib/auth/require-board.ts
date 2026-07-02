import { redirect } from "next/navigation";
import { getProfile } from "./get-profile";
import { isAdmin, isBoard } from "@/lib/roles";

export async function requireBoard() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!isAdmin(profile.role) && !isBoard(profile.role)) {
    redirect("/dashboard");
  }

  return profile;
}