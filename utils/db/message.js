import { cookies } from "next/headers";
import { createClient } from "../supabase/server";

export async function add_message({from, to, message, attachments=null, reply_to=null, type='CHANNEL', app=false}) {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase.from("messages").insert({
    from,
    to,
    message,
    attachments,
    reply_to,
    type,
    app
  });
  return { data, error };
}
