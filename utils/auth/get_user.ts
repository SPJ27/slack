"use server";
import { UserJson } from "../../types/user";
import { createClient } from "../supabase/server";
import { cookies } from "next/headers";

export async function get_user():Promise<UserJson> {
  const cookieStore = await cookies();
  const session_id = cookieStore.get("session_id")?.value;
  if (!session_id) return null;

  const supabase = createClient(cookieStore);
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("user_id")
    .eq("session_id", session_id)
    .maybeSingle();
  console.log('sessionError', sessionError)
  if (sessionError || !session) return null;

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user_id)
    .maybeSingle();
  console.log('userError', userError)
  if (userError) return null;
  return user;
}