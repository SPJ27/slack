import { get_user } from "@/utils/auth/get_user";
import { edit_user_data } from "@/utils/db/user_data";
import { NextResponse } from "next/server";

export async function GET(request){
    const user = await get_user()
    return NextResponse.json({data: user}, {status: 200})
}
export async function POST(request) {
  const formData = await request.formData();
  const user = await get_user();
  const data = JSON.parse(formData.get("data"));
  console.log(data)
  const { error } = await edit_user_data(user.id, data);
  if (error) {
    return NextResponse.json({ status: 500 });
  }
  return NextResponse.json({ status: 200 });
}