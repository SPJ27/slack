import { cookies } from "next/headers";
import { createClient } from "../supabase/server";
import { ChannelData } from "@/types/ChannelData";
import { PostgrestError } from "@supabase/supabase-js";
import { MembersData } from "@/types/MembersData";

interface SupabaseChannelFormat {
  data: ChannelData | null;
  error: PostgrestError | null;
}

export async function get_channel_data(
  channel_id: number,
): Promise<SupabaseChannelFormat> {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from("channels")
    .select()
    .eq("id", channel_id)
    .single();
  return { data, error };
}

export async function insert_channel_data(
  name: string,
  description: string,
  isPublic: boolean,
  created_by: number,
): Promise<SupabaseChannelFormat> {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from("channels")
    .insert({
      name: name.trim(),
      description: description ?? null,
      isPublic: isPublic ?? true,
      created_by: created_by,
    })
    .select()
    .single();
  return { data, error };
}

export async function get_channel_members(
  channel_id: number,
): Promise<MembersData[] | null> {
  const supabase = createClient(await cookies());

  const { data } = await supabase
    .from("channel_members")
    .select()
    .eq("channel_id", channel_id);

  return data ?? null;
}

export async function add_to_channel(
  channel_id: number,
  user_id: number,
): Promise<PostgrestError | null> {
  const supabase = await createClient(await cookies());
  const { error: insertError } = await supabase
    .from("channel_members")
    .insert({ channel_id, user_id });
  return insertError;
}

export async function search_channels(search: string): Promise<{
  data: { id: number; name: string }[] | null;
  error: PostgrestError | null;
}> {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from("channels")
    .select("id, name")
    .eq("isPublic", true)
    .ilike("name", `%${search}%`)
    .limit(20);
  return { data, error };
}

export async function remove_channel(
  channel_id: number,
): Promise<{ data: ChannelData | null; error: PostgrestError | null }> {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from("channels")
    .delete()
    .eq("id", channel_id);
  return { data, error };
}
