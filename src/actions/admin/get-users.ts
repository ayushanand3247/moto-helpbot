"use server";

import { getUsers as getUsersQuery } from "@/lib/admin/queries";

export async function getUsers() {
  return await getUsersQuery();
}
