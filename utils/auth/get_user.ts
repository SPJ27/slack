"use server";
import { UserData } from "@/types/UserData";
import { createClient } from "../supabase/server";
import { cookies } from "next/headers";

export async function get_user(): Promise<UserData | null> {
  const cookieStore = await cookies();
  const session_id = cookieStore.get("session_id")?.value;
  if (!session_id) return null;

  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("sessions")
    .select("users(*)")
    .eq("session_id", session_id)
    .maybeSingle();

  if (error || !data || !data.users) return null;

  return data.users as unknown as UserData;
}