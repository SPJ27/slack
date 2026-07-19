"use server";
import { get_user } from "@/utils/auth/get_user";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { UserJson } from "@/types/user";

export async function get_user_info():Promise<UserJson> {
  const user = await get_user();
  return user;
}

export async function edit_user(formData: FormData): Promise<void> {
  const user:UserJson = await get_user();
  const rawData = formData.get("data")
  if (typeof rawData !== "string") throw new Error('rawData must be a string')
  const data:Record<string, unknown> = JSON.parse(rawData);
  const supabase = createClient(await cookies());
  const { error } = await supabase.from("users").update(data).eq("id", user.id);

  if (error) {
    throw new Error("Error fetching data");
  }
}