import { get_user } from "@/utils/auth/get_user";
import { add_message } from "@/utils/db/message";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  let body;
  try {
    body = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const to = body.get("to");
  const message = body.get("message");
  const attachments = body.getAll("attachments");
  const reply_to = body.get("reply_to");
  const type = body.get("type");
  const user = await get_user();
  const files = []
  for (const attachment of attachments) {
    const formData = new FormData();
    formData.append("file", attachment);
    console.log(attachment)
    const response = await fetch("https://cdn.hackclub.com/api/v4/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.CDN_API_KEY}` },
      body: formData,
    });

    const { url } = await response.json();
    files.push(url)
  }

  const supabase = await createClient(await cookies());
  if (type == "CHANNEL") {
    const { data: userInChannel, error: userInChannelError } = await supabase
      .from("channel_members")
      .select()
      .eq("user_id", user.id)
      .eq("channel_id", to)
      .single();
    if (userInChannel.length == 0) {
      return NextResponse.json({ message: "Not in channel" }, { status: 403 });
    }
  }
  const { error } = await add_message({
    from: user.id,
    to,
    message,
    attachments: files,
    reply_to,
    type,
  });
  console.log(error);
  if (error) {
    return NextResponse.json(
      { message: "Unable to send message" },
      { status: 500 },
    );
  }
  return NextResponse.json({ message: "successful" }, { status: 200 });
}
