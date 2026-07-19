"use server";
import { get_user } from "@/utils/auth/get_user";
import {
  add_to_channel,
  get_channel_data,
  insert_channel_data,
  remove_channel,
} from "@/utils/db/channel";
import { add_message } from "@/utils/db/message";
import { remove_from_channel, in_channel } from "@/utils/db/user_data";
import { get_user_id } from "@/utils/auth/get_user_id";

export async function createChannel(name: string, description: string, isPublic: boolean) {
  if (name.trim().length === 0) {
    throw new Error("'channel name' cannot be empty");
  }
  const user = await get_user();
  if (!user) {
    throw new Error("unauthenticated");
  }
  const { data, error } = await insert_channel_data(
    name,
    description,
    isPublic,
    user.id,
  );
  console.log(error);
  if (error) {
    if (error.code === "23505") {
      throw new Error("a channel with this name already exists");
    }

    throw new Error("Failed to create channel");
  }

  const memberError = await add_to_channel(data.id, user.id);

  const { data: insertDefault, error: insertDefaultError } = await add_message({
    from: -101,
    to: data.id,
    message: `This channel was created by ${user.displayName}`,
    type: "CHANNEL",
    app: true,
  });

  if (memberError || insertDefaultError) {
    throw new Error("error adding user to the channel");
  }
  return data;
}

export async function deleteChannel(channel_id: number) {
  const user = await get_user();

  if (!user) {
    throw new Error("unauthenticated");
  }

  const { data, error } = await get_channel_data(channel_id);

  if (data.isPublic == false && parseInt(data.created_by) !== user.id) {
    throw new Error("you dont have the perms to delete this channel");
  }

  const { error: deleteError } = await remove_channel(channel_id);
}

export async function leave(channel_id: number) {
  const user = await get_user();
  if (!user) throw new Error("Unauthenticated");

  const { error: deleteError } = await remove_from_channel(channel_id, user.id);

  if (deleteError) {
    throw new Error("Unable to delete");
  }

  const { data: insertDefault, error: insertDefaultError } = await add_message({
    from: -101,
    to: channel_id,
    message: `${user.displayName} left this channel`,
    type: "CHANNEL",
    app: true,
  });
}

export async function join(channel_id: number) {
  const user = await get_user();
  if (!user) {
    throw new Error("unauthenticated");
  }

  const { data: channel, error: channelError } =
    await get_channel_data(channel_id);
  if (channelError || !channel) {
    throw new Error("channel not found");
  }

  if (!channel.isPublic) {
    throw new Error("cannot join private channels");
  }

  const insertError = await add_to_channel(channel_id, user.id);

  if (insertError) {
    throw new Error("failed to join this channel");
  }

  const { data: insertDefault, error: insertDefaultError } = await add_message({
    from: -101,
    to: channel_id,
    message: `${user.displayName} joined this channel`,
    type: "CHANNEL",
    app: true,
  });
}

export async function add(channel_id: number, member_id: number) {
  const user = await get_user()
  const { data: channel, error: channelError } =
    await get_channel_data(channel_id);

  if (channelError || !channel) {
    throw new Error("channel not found");
  }

  if (!channel.isPublic && user.id != parseInt(channel.created_by)) {
    throw new Error(
      "only the creator of this channel can add new people to private channels",
    );
  }
  const inChannel = await in_channel(channel_id, member_id);

  if (inChannel) throw new Error("already in channel");

  const insertError = await add_to_channel(channel_id, member_id);
  const member = await get_user_id(member_id);

  const { data: insertDefault, error: insertDefaultError } = await add_message({
    from: -101,
    to: channel_id,
    message: `${member.displayName} was added to this channel`,
    type: "CHANNEL",
    app: true,
  });
}