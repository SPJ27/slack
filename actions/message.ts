'use server'
import { get_user } from "@/utils/auth/get_user";
import { add_message } from "@/utils/db/message";
import { in_channel } from "@/utils/db/user_data";

export async function send_message(body: FormData): Promise<void> {
  const to = body.get("to");
  const message = body.get("message");
  const attachments = body.getAll("attachments");
  const reply_to = body.get("reply_to");
  const type = body.get("type");
  const user = await get_user();
  const files = []
  for (const attachment of attachments) {
    const formData = new FormData();
    formData.append("file", attachment);
    console.log(attachment)
    const response = await fetch("https://cdn.hackclub.com/api/v4/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.CDN_API_KEY}` },
      body: formData,
    });
    const { url } = await response.json();
    files.push(url)
  }
  if (type == "CHANNEL") {
    const userInChannel = await in_channel(to, user.id)
    if (!userInChannel) {
      throw new Error('not in channel')
    }
  }
  const { error } = await add_message({
    from: user.id,
    to,
    message,
    attachments: files,
    reply_to,
    type,
  });

  if (error) {
    throw new Error('Unable to add message')
  }
}
