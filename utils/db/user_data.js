import { cookies } from "next/headers";
import { createClient } from "../supabase/server";

export async function search_users(search) {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("users")
    .select("id, displayName, profilePicture")
    .ilike("displayName", `%${search}%`)
    .limit(20);
  return { data, error };
}

export async function remove_from_channel(channel_id, user_id) {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("channel_members")
    .delete()
    .eq("channel_id", channel_id)
    .eq("user_id", user_id);
  return { data, error };
}


export async function in_channel(channel_id, user_id) {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from("channel_members")
    .select()
    .eq("channel_id", channel_id)
    .eq("user_id", user_id);
  return data ? true : false
}
