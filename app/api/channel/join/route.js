import { get_user } from "@/utils/auth/get_user";
import { add_to_channel, get_channel_data } from "@/utils/db/channel";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const user = await get_user();
    if (!user) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "invalid JSON body" }, { status: 400 });
    }

    const { channel_id } = body;
    if (!channel_id) {
      return NextResponse.json({ message: "channel_id is required" }, { status: 400 });
    }

    const supabase = await createClient(await cookies());

    const { data: channel, error: channelError } = await get_channel_data()
    if (channelError || !channel) {
      return NextResponse.json({ message: "channel not found" }, { status: 404 });
    }

    if (!channel.isPublic) {
      return NextResponse.json(
        { message: "cannot join a private channel" },
        { status: 403 },
      );
    }
    
    const {insertError} = await add_to_channel(channel_id, user.id)
    
    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ message: "success" }, { status: 200 });
      }
      console.error("Failed to join channel:", insertError);
      return NextResponse.json({ message: "failed to join channel" }, { status: 500 });
    }

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error in join-channel route:", err);
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}