import { search_channels } from "@/utils/db/channel";
import { search_users } from "@/utils/db/user_data";
import { NextRequest, NextResponse } from "next/server";

interface SearchResult {
  id: number;
  type: "channel" | "user";
  name?: string;
  displayName?: string;
  email?: string;
  desc?: string;
  profilePicture?: string;
}

function getScore(item: SearchResult, query: string): number {
  const q = query.toLowerCase().trim();

  const fields = [item.name, item.displayName, item.email, item.desc]
    .filter((field): field is string => Boolean(field))
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

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";

  if (!query) {
    return NextResponse.json([]);
  }

  const [{ data: channelData, error: channelError }, { data: userData, error: userError }] =
    await Promise.all([search_channels(query), search_users(query)]);

  const channels = channelData ?? [];
  const users = userData ?? [];

  const results: SearchResult[] = [
    ...channels.map((channel) => ({
      ...channel,
      type: "channel" as const,
    })),
    ...users.map((user) => ({
      ...user,
      type: "user" as const,
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