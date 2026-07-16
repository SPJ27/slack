import { get_user } from "@/utils/auth/get_user";
import { add_message } from "@/utils/db/message";
import { remove_from_channel } from "@/utils/db/user_data";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  const user = await get_user();

  if (!user)
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const headers = request.headers;

  const channel_id = headers.get("channel_id");

  const { error: deleteError } = await remove_from_channel(channel_id, user.id);

  if (deleteError) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
  const { data: insertDefault, error: insertDefaultError } =
        await add_message({
          from: -101,
          to: channel_id,
          message: `${user.displayName} left this channel`,
          type: "CHANNEL",
        });
      
  return NextResponse.json({ message: "success" }, { status: 200 });
}
