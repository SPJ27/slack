"use server";
import { get_user } from "@/utils/auth/get_user";
import { insert_activity } from "@/utils/db/activities";
import { add_message } from "@/utils/db/message";
import { in_channel } from "@/utils/db/user_data";

async function uploadFile(attachment: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", attachment);

  const response = await fetch("https://cdn.hackclub.com/api/v4/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.CDN_API_KEY}` },
    body: formData,
  });

  const { url } = await response.json();
  return url;
}

export async function send_message(body: FormData): Promise<void> {
  const to = body.get("to");
  const message = body.get("message");
  const attachments = body.getAll("attachments").filter(
    (a): a is File => a instanceof File
  );
  const reply_to = body.get("reply_to");
  const type = body.get("type");

  if (
    typeof to !== "string" ||
    typeof message !== "string" ||
    typeof type !== "string"
  ) {
    throw new Error("Missing or invalid required fields");
  }

  const [user, files] = await Promise.all([
    get_user(),
    Promise.all(attachments.map(uploadFile)),
  ]);

  if (!user) {
    throw new Error("unauthenticated");
  }

  if (type === "CHANNEL") {
    const userInChannel = await in_channel(Number(to), user.id);
    if (!userInChannel) {
      throw new Error("not in channel");
    }
  }
  
  const { data, error } = await add_message({
    from: user.id,
    to: Number(to),
    message,
    attachments: files,
    reply_to: typeof reply_to === "string" ? Number(reply_to) : null,
    type,
  });
if (type=='DM'){
    await insert_activity(user.id, 'DM', message.slice(0, 50), data?.id) 
  }
  if (error) {
    throw new Error("Unable to add message");
  }
}