"use server";
import { get_user } from "@/utils/auth/get_user";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
export async function get_user_info() {
  const user = await get_user();
  return user;
}

export async function edit_user(formData) {
  const user = await get_user();
  const data = JSON.parse(formData.get("data"));
  const supabase = createClient(await cookies());
  const { error } = await supabase.from("users").update(data).eq("id", user.id);

  if (error) {
    throw new Error("Error fetching data");
  }
}
