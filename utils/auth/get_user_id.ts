"use server";
import { UserJson } from "../../types/user";
import { createClient } from "../supabase/server";
import { cookies } from "next/headers";

export async function get_user_id(id: number):Promise<UserJson>|null {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data: user, error: userError } = await supabase
    .from("users")
    .select()
    .eq("id", id)
    .single();

  if (userError || !user) return null;
  return user;
}

export async function get_users_by_ids(ids:number[]):Promise<UserJson[]> {
  if (!ids || ids.length === 0) return [];

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data: users, error } = await supabase
    .from("users")
    .select()
    .in("id", ids);

  if (error || !users) return [];
  return users;
}