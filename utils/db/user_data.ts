import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { PostgrestError } from "@supabase/supabase-js";

type UserSearch = {
  id: number,
  displayName: string,
  profilePicture: string
}

export async function search_users(search: string): Promise<{data: UserSearch[] | null, error: PostgrestError | null}> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("users")
    .select("id, displayName, profilePicture")
    .ilike("displayName", `%${search}%`)
    .limit(20);
  return { data, error };
}

type ChannelMembers = {
  channel_id: number,
  joined_on: Date,
  user_id: number
}

export async function remove_from_channel(channel_id: number, user_id: number):Promise<{data: ChannelMembers | null, error: PostgrestError | null}> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("channel_members")
    .delete()
    .eq("channel_id", channel_id)
    .eq("user_id", user_id);
  return { data, error };
}


export async function in_channel(channel_id: number, user_id: number) {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from("channel_members")
    .select()
    .eq("channel_id", channel_id)
    .eq("user_id", user_id);
  return data ? true : false
}

export async function all_direct_messages(user_id: number){
  const supabase = createClient(await cookies())
  
}