import { get_user } from "@/utils/auth/get_user";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const supabase = await createClient(await cookies());
 
  const user = await get_user();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to view channels" },
      { status: 401 },
    );
  }
 
  const { data: memberships, error: membershipError } = await supabase
    .from("channel_members")
    .select("channel_id")
    .eq("user_id", user.id);
 
  if (membershipError) {
    console.error("Failed to fetch channel memberships:", membershipError);
    return NextResponse.json(
      { error: "Unable to fetch channels" },
      { status: 500 },
    );
  }
 
  const channelIds = (memberships ?? []).map((m) => m.channel_id);
 
  if (channelIds.length === 0) {
    return NextResponse.json({ message: "success", data: [] }, { status: 200 });
  }
 
  const { data: channels, error: channelsError } = await supabase
    .from("channels")
    .select("*")
    .in("id", channelIds);
 
  if (channelsError) {
    console.error("Failed to fetch channel info:", channelsError);
    return NextResponse.json(
      { error: "Unable to fetch channels" },
      { status: 500 },
    );
  }
 
  return NextResponse.json({ message: "success", data: channels }, { status: 200 });
}