import { cookies } from "next/headers";
import { createClient } from "../supabase/server";

export async function get_channel_data(channel_id) {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from("channels")
    .select()
    .eq("id", channel_id)
    .single();
  return { data, error };
}

export async function insert_channel_data(name, description, isPublic, created_by) {
    const supabase = await createClient(await cookies());
      const { data, error } = await supabase
        .from("channels")
        .insert({
          name: name.trim(),
          description: description ?? null,
          isPublic: isPublic ?? true,
          created_by: created_by
        })
        .select()
        .single();
      return {data, error}
}

export async function get_channel_members(channel_id) {
  const supabase = await createClient(await cookies());

  const { data } = await supabase
    .from("channel_members")
    .select()
    .eq("channel_id", channel_id);

  return data;
}
