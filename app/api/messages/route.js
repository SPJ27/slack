import { get_user } from "@/utils/auth/get_user";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { to, message, attachments, reply_to, type } = body;
  const user = await get_user();
  const supabase = await createClient(await cookies());
  if (type == "CHANNEL") {
    const { data: userInChannel, error: userInChannelError } = await supabase
      .from("channel_members")
      .select()
      .eq("user_id", user.id)
      .eq("channel_id", to)
      .single()
    // console.log()
    if (userInChannel.length == 0) {
      return NextResponse.json({message: 'Not in channel'}, {status: 403})
    }
  }
  const { data, error } = await supabase.from("messages").insert({
    from: user.id,
    to,
    message,
    attachments,
    reply_to,
    type,
  });
  if (error) {
    return NextResponse.json(
      { message: "Unable to send message" },
      { status: 500 },
    );
  }
  return NextResponse.json({ message: "successful" }, { status: 200 });
}
