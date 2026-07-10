import { cookies } from "next/headers";
import { createClient } from "../supabase/server";

export async function search_users(search) {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from("users")
    .select("id, displayName, profilePicture")
    .ilike("displayName", `%${search}%`)
    .limit(20);
  return { data, error };
}