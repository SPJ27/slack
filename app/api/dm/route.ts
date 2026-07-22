import { get_user } from "@/utils/auth/get_user";
import { get_user_id } from "@/utils/auth/get_user_id";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest):Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "'id' is required" }, { status: 400 });
  }

  const user = await get_user();
  if (!user) {
    return NextResponse.json({ message: "unauthenticated" }, { status: 401 });
  }
  const data = await get_user_id(parseInt(id))
  console.log(data)
  return NextResponse.json({ data }, { status: 200 });
}
