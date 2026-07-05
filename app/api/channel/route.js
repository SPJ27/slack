import { get_user } from "@/utils/auth/get_user";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { name, description, isPublic } = body;

  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "'name' is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  const user = await get_user();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to create a channel" },
      { status: 401 },
    );
  }

  const supabase = await createClient(await cookies());

  const { data, error } = await supabase
    .from("channels")
    .insert({
      name: name.trim(),
      description: description ?? null,
      isPublic: isPublic ?? true,
      created_by: user.id,
    })
    .select()
    .single();
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

  const { error: memberError } = await supabase
    .from("channel_members")
    .insert({
      channel_id: data.id,
      user_id: user.id,
    });

  if (memberError) {
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

  return NextResponse.json({ message: "success", data }, { status: 201 });
}
