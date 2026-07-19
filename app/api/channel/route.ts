import { get_user } from "@/utils/auth/get_user";
import {
  get_channel_data,
  get_channel_members,
  remove_channel,
} from "@/utils/db/channel";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
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
  const { data, error } = await get_channel_data(parseInt(id));

  if (error || !data) {
    return NextResponse.json(
      { message: error?.message ?? "Channel not found" },
      { status: 404 },
    );
  }
  const memberships = await get_channel_members(parseInt(id));

  const memberIds = (memberships ?? []).map((m) => m.user_id);
  const inChannel = memberIds.includes(user.id);

  if (!data.isPublic && !inChannel) {
    return NextResponse.json({ message: "private channel" }, { status: 403 });
  }

  if (memberIds.length === 0) {
    return NextResponse.json({ data, members: [], inChannel }, { status: 200 });
  }
  const supabase = await createClient(await cookies());
  const { data: members, error: membersError } = await supabase
    .from("users")
    .select("*")
    .in("id", memberIds);

  if (membersError) {
    return NextResponse.json(
      { error: "Unable to fetch members" },
      { status: 500 },
    );
  }

  return NextResponse.json({ data, members, inChannel }, { status: 200 });
}
