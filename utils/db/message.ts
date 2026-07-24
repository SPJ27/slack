import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

interface AddMessageParams {
  from: number;
  to: number;   
  message: string;
  attachments?: string[] | null;
  reply_to?: number | null;
  type?: string;
  app?: boolean;
}

export async function add_message({
  from,
  to,
  message,
  attachments = null,
  reply_to = null,
  type = "CHANNEL",
  app = false,
}: AddMessageParams) {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase.from("messages").insert({
    from,
    to,
    message,
    attachments,
    reply_to,
    type,
    app,
  }).select().single()
  return { data, error };
}