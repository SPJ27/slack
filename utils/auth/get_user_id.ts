"use server";
import { UserData } from "@/types/UserData";
import { createClient } from "../supabase/server";
import { cookies } from "next/headers";

export async function get_user_id(id: number):Promise<UserData | null> {
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

export async function get_users_by_ids(ids:number[]):Promise<UserData[] | null> {
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