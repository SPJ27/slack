"use client";
import { UserData } from "@/types/UserData";
import { get_user } from "@/utils/auth/get_user";
import Image from "next/image";
import { useEffect, useState } from "react";

const features = [
  {
    title: "Channels",
    description: "Organize conversations by team, project, or topic.",
  },
  {
    title: "Direct Messages",
    description: "Quick 1:1 or group chats without the clutter.",
  },
  {
    title: "Hack Club Auth",
    description: "Sign in instantly with your Hack Club identity.",
  },
];

const Page = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    get_user()
      .then((u) => {
        if (u) {
          setLoggedIn(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = () => {
    if (loggedIn) {
      window.location.href = "/channels";
      return;
    }

    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;
    if (!redirectUri) {
      console.error("NEXT_PUBLIC_REDIRECT_URI is not set");
      return;
    }

    const scope = encodeURIComponent(
      "openid profile email name slack_id verification_status",
    );
    const url = `https://auth.hackclub.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;

    window.location.href = url;
  };

  const ctaLabel = loading
    ? "Loading..."
    : loggedIn
      ? "Go to your channels"
      : "Login with Hack Club";

  return (
    <div className="min-h-screen flex flex-col">
  
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Image alt="Logo" src="/image.png" height={28} width={28} />
          <span className="font-bold text-[#442b28]">Slack Clone</span>
        </div>
        <button
          className="text-sm font-medium text-[#481349] hover:text-[hsl(356,54%,44%)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLogin}
          disabled={loading}
        >
          {ctaLabel}
        </button>
      </nav>

      <section className="flex flex-col items-center justify-center gap-4 text-center px-4 py-24 flex-1">
        <div className="text-xs font-semibold tracking-widest uppercase text-[#b18782]">
          Hack Club
        </div>

        <Image alt="Logo" src="/image.png" height={56} width={56} />

        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#442b28] max-w-2xl">
          Slack Clone
        </h1>

        <p className="text-[#b18782] max-w-md">
          A full clone of slack - with messages, huddles, notifications, creating apps and bots, just like actual slack
        </p>

        <button
          className="mt-2 bg-[#0a5a2a] text-white rounded-sm px-5 py-1.5 hover:bg-[#134b29] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLogin}
          disabled={loading}
        >
          {ctaLabel}
        </button>

        <div className="text-xs text-[#b18782] mt-1">
          Uses Hack Club Auth
        </div>
      </section>
    </div>
  );
};

export default Page;