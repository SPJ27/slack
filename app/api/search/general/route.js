import { search_channels } from "@/utils/db/channel";
import { search_users } from "@/utils/db/user_data";
import { NextResponse } from "next/server";

function getScore(item, query) {
  const q = query.toLowerCase().trim();

  const fields = [
    item.name,
    item.displayName,
    item.username,
    item.email,
    item.desc,
  ]
    .filter(Boolean)
    .map((field) => field.toLowerCase());

  let score = 0;

  for (const field of fields) {
    if (field === q) {
      score = Math.max(score, 100);
    } else if (field.startsWith(q)) {
      score = Math.max(score, 75);
    } else if (field.includes(q)) {
      score = Math.max(score, 50);
    }
  }

  return score;
}

export async function GET(request) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";

  if (!query) {
    return NextResponse.json([]);
  }

  const [{ data: channels = [] }, { data: users = [] }] = await Promise.all([
    search_channels(query),
    search_users(query),
  ]);

  const results = [
    ...channels.map((channel) => ({
      ...channel,
      type: "channel",
    })),
    ...users.map((user) => ({
      ...user,
      type: "user",
    })),
  ];

  results.sort((a, b) => {
    const scoreDiff = getScore(b, query) - getScore(a, query);

    if (scoreDiff !== 0) return scoreDiff;

    const aName = (a.name || a.displayName || "").toLowerCase();
    const bName = (b.name || b.displayName || "").toLowerCase();

    return aName.localeCompare(bName);
  });

  return NextResponse.json(results);
}