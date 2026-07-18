import { get_user } from "@/utils/auth/get_user";
import { get_user_id } from "@/utils/auth/get_user_id";
import { add_to_channel, get_channel_data } from "@/utils/db/channel";
import { NextResponse } from "next/server";
import { add_message } from "@/utils/db/message";
import { in_channel } from "@/utils/db/user_data";
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
      return NextResponse.json(
        { message: "invalid JSON body" },
        { status: 400 },
      );
    }

    const { channel_id, member_id } = body;
    if (!channel_id || !member_id) {
      return NextResponse.json(
        { message: "channel_id/member_id is required" },
        { status: 400 },
      );
    }

    const { data: channel, error: channelError } =
      await get_channel_data(channel_id);

    if (channelError || !channel) {
      return NextResponse.json(
        { message: "channel not found" },
        { status: 404 },
      );
    }
    if (!channel.isPublic && user.id != parseInt(channel.created_by)) {
      return NextResponse.json(
        { message: "only the creator can add to private channels" },
        { status: 403 },
      );
    }
    const inChannel = await in_channel(channel_id, member_id
    )
    if (inChannel) return NextResponse.json({message: 'already in channel'}, {status: 409})
    const insertError  = await add_to_channel(channel_id, member_id);
    const member = await get_user_id(member_id);

    if (!member) {
      return NextResponse.json(
        { message: "member not found" },
        { status: 404 },
      );
    }
    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ message: "success" }, { status: 200 });
      }
      console.error("Failed to join channel:", insertError);
      return NextResponse.json(
        { message: "failed to join channel" },
        { status: 500 },
      );
    }
    const { data: insertDefault, error: insertDefaultError } =
      await add_message({
        from: -101,
        to: channel_id,
        message: `${member.displayName} was added to this channel`,
        type: "CHANNEL",
      });

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error in add-channel route:", err);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 },
    );
  }
}
