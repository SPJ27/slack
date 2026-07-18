import { search_users } from "@/utils/db/user_data";
import { NextResponse } from "next/server";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  const { data } = await search_users(query);
  console.log(data)
  return NextResponse.json(data);
}
