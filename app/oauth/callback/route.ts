import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { add_to_channel } from "@/utils/db/channel";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
      return Response.json(
        { error: "No authorization code received" },
        { status: 400 },
      );
    }

    const tokenRes = await fetch("https://auth.hackclub.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI,
        code,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return Response.json(
        {
          error: "Failed to exchange code for token",
          details: tokenData,
        },
        { status: 500 },
      );
    }

    const userRes = await fetch("https://auth.hackclub.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userRes.json();

    if (!userRes.ok) {
      return Response.json(
        {
          error: "Failed to fetch user info",
          details: userData,
        },
        { status: 500 },
      );
    }

    console.log("user", userData);
    const supabase = createClient(await cookies());
    const { primary_email, first_name, last_name } = userData.identity;

    const { data: userRow, error: upsertError } = await supabase
      .from("users")
      .upsert(
        {
          email: primary_email,
          displayName: first_name,
          name: `${first_name} ${last_name}`,
        },
        { onConflict: "email" },
      )
      .select()
      .single();

    if (upsertError) {
      return Response.json(
        {
          success: false,
          error: "unable to upsert userData into Supabase",
          details: upsertError,
        },
        { status: 500 },
      );
    }

    const session_id = randomUUID();
    const { error: sessionError } = await supabase.from("sessions").insert({
      session_id,
      user_id: userRow.id,
      auth_token: tokenData.access_token,
    });

    if (sessionError) {
      return Response.json(
        {
          success: false,
          error: "unable to create session",
          details: sessionError,
        },
        { status: 500 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("session_id", session_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: tokenData.expires_in ?? 60 * 60 * 24 * 7,
    });

    await add_to_channel(46, userRow.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/channels", request.url));
}