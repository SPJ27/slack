import { search_channels } from "@/utils/db/channel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest):Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
    if (!query) return NextResponse.json({status: 400})
  const { data } = await search_channels(query);
  console.log(data)
  return NextResponse.json(data);
}