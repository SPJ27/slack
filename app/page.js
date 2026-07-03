"use client";
import { get_user } from "@/utils/auth/get_user";
import Image from "next/image";
import { useEffect, useState } from "react";

const Page = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    get_user().then((u) => {
      console.log(u)
    });
  }, []);
  const handleLogin = () => {
    if (loggedIn) {
      window.location.href = "/kitchen";
      return;
    }
    const scope = encodeURIComponent("openid profile email name slack_id verification_status");
    const url = `https://auth.hackclub.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI)}&response_type=code&scope=${scope}`;
  console.log(url);
  window.location.href = url;
  }
  return (
    <div>
      <div className="flex flex-col items-center gap-2 justify-center h-screen">
        {/* <Image src="/image.png" alt="ft_logo" width={200} height={200} /> */}
        <h1 className="text-2xl font-medium text-center text-[#442b28]">
          Cook personal projects. (NOT) Win cool prizes.
        </h1>
        <button
          className="bg-[hsl(356,49%,43%)] text-white rounded-xl px-4 py-1 hover:bg-[hsl(356,54%,44%)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : loggedIn
              ? "Go to the kitchen!"
              : "Login with Hack Club"}
        </button>
        <div className="text-sm text-center text-[#b18782] mt-1">
          *Not the real website, just a clone, so no landing page:)
        </div>
      </div>
    </div>
  );
};

export default Page;

// https://auth.hackclub.com/oauth/authorize?client_id=client_id&redirect_uri=redirect_uri&response_type=code&scope=email