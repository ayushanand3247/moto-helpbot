import { redirect } from "next/navigation";
import { getProfile } from "./get-profile";

export async function requireBoard() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  const allowed =
    profile.role === "ADMIN" ||
    profile.role === "BOARD";

  if (!allowed) {
    redirect("/dashboard");
  }

  return profile;
}