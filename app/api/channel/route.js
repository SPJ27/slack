import { get_user } from "@/utils/auth/get_user";
import {
  add_to_channel,
  get_channel_data,
  get_channel_members,
  insert_channel_data,
  remove_channel,
} from "@/utils/db/channel";
import { add_message } from "@/utils/db/message";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, description, isPublic } = body;

  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "'name' is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  const user = await get_user();
  console.log("user", user);
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to create a channel" },
      { status: 401 },
    );
  }
  const { data, error } = await insert_channel_data(
    name,
    description,
    isPublic,
    user.id,
  );
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: `A channel named "${name.trim()}" already exists` },
        { status: 409 },
      );
    }

    console.error("Failed to create channel:", error);
    return NextResponse.json(
      { error: "Unable to create channel" },
      { status: 500 },
    );
  }
  const supabase = await createClient(await cookies());
  const memberError = await add_to_channel(data.id, user.id);
  const { data: insertDefault, error: insertDefaultError } = await add_message({
    from: -101,
    to: data.id,
    message: `This channel was created by ${user.displayName}`,
    type: "CHANNEL",
  });
  console.log("data", insertDefault);
  console.log("error", insertDefaultError);
  if (memberError || insertDefaultError) {
    console.error("Failed to add creator as channel member:", memberError);

    return NextResponse.json(
      {
        message: "Channel created, but failed to add you as a member",
        data,
        error: "Unable to add you as a member",
      },
      { status: 207 },
    );
  }

  return NextResponse.json({ message: "success", data }, { status: 200 });
}

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "'id' is required" }, { status: 400 });
  }

  const user = await get_user();
  if (!user) {
    return NextResponse.json({ message: "unauthenticated" }, { status: 401 });
  }
  const { data, error } = await get_channel_data(id);

  if (error || !data) {
    return NextResponse.json(
      { message: error?.message ?? "Channel not found" },
      { status: 404 },
    );
  }
  const memberships = await get_channel_members(id);

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

export async function DELETE(request) {
  const user = await get_user();

  if (!user)
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const headers = request.headers;

  const channel_id = headers.get("channel_id");
  console.log('channel_id', channel_id)
  const { data, error } = await get_channel_data(channel_id);
  console.log(data)
  if (data.isPublic == false && parseInt(data.created_by) !== user.id) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const { error: deleteError } = await remove_channel(channel_id);

  if (deleteError) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
  return NextResponse.json({ message: "success" }, { status: 200 });
}
