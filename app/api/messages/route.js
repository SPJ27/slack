import { get_user } from "@/utils/auth/get_user";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }
  const {to, message, attachments, reply_to, type} = body;
  const user = await get_user()
  const supabase = await createClient(await cookies())
  const {data, error} = await supabase
    .from('messages')
    .insert({
      from: user.id,
      to,
      message,
      attachments,
      reply_to,
      type
    })
    if (error) {
      return NextResponse.json({message: 'Unable to send message'}, {status: 500})
    }
    return NextResponse.json({message: 'successful'}, {status: 200})
// when in a channel, search by 'to', and if a thread is open, search by reply to thread ida
}
