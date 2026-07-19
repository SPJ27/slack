"use client";
import { Hash } from "lucide-react";

const Home = () => (
  <div className="flex-1 min-w-0 h-screen bg-white text-black flex flex-col items-center justify-center gap-2">
    <Hash className="size-6 text-[#8a8a8a]" />
    <p className="text-[15px] font-semibold">
      You have no channel opened up right now!
    </p>
    <p className="text-[13px] text-[#8a8a8a]">
      Open a channel from the sidebar to view its contents
    </p>
  </div>
);

const Page = () => {
  return (
        <Home />
   
  );
};
export default Page;