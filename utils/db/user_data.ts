import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { PostgrestError } from "@supabase/supabase-js";
import { UserDM } from "@/types/DM";

type UserSearch = {
  id: number;
  displayName: string;
  profilePicture: string;
};

export async function search_users(
  search: string,
): Promise<{ data: UserSearch[] | null; error: PostgrestError | null }> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("users")
    .select("id, displayName, profilePicture")
    .ilike("displayName", `%${search}%`)
    .limit(20);
  return { data, error };
}

type ChannelMembers = {
  channel_id: number;
  joined_on: Date;
  user_id: number;
};

export async function remove_from_channel(
  channel_id: number,
  user_id: number,
): Promise<{ data: ChannelMembers | null; error: PostgrestError | null }> {
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
    .eq("user_id", user_id)
    .single();
  return data !== null ? true : false;
}

type Message = {
  message: string;
  to: number;
  from: number;
  created_at: string;
};

export async function all_direct_messages(user_id: number): Promise<UserDM[]> {
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from("messages")
    .select("message, to, from, created_at")
    .or(`from.eq.${user_id},to.eq.${user_id}`)
    .eq('type', 'DM')
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const latestByPartner = new Map<number, Message>();
  for (const msg of data as Message[]) {
    const partnerId = msg.from === user_id ? msg.to : msg.from;
    if (!latestByPartner.has(partnerId)) {
      latestByPartner.set(partnerId, msg);
    }
  }

  const partnerIds = Array.from(latestByPartner.keys());
  if (partnerIds.length === 0) return [];

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, displayName, profilePicture")
    .in("id", partnerIds);

  if (usersError) throw new Error(usersError.message);
  const userById = new Map(users.map((u) => [u.id, u]));

  const conversations: UserDM[] = partnerIds.map((partnerId) => {
    const msg = latestByPartner.get(partnerId)!;
    const user = userById.get(partnerId);

    return {
      id: partnerId,
      displayName: user?.displayName ?? "Unknown",
      profilePicture: user?.profilePicture ?? "",
      message: msg.message,
      date: msg.created_at
    };
  });

  return conversations;
}