"use client";
import { useState, useEffect } from "react";
import { LucideIcon } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";

interface UserDM {
  displayName: string;
  profilePicture: string;
  id: number;
  message: string;
}

const TopItem = ({
  Icon,
  label,
  trailing,
}: {
  Icon: LucideIcon;
  label: string;
  trailing?: string;
}) => (
  <span className="flex mt-1.5 pl-2 font-normal text-sm font-sans items-center gap-1.5 text-[#f9edffcc]">
    <Icon className="size-4" /> {label}
    {trailing && <span className="ml-auto pr-2 text-xs">{trailing}</span>}
  </span>
);

const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center gap-1.5 px-2 py-[6px] mt-3 text-[15px] font-semibold text-white cursor-pointer">
    {label}
  </div>
);

const UserItem = ({ displayName, profilePicture, id, message }: UserDM) => {
  const params = useParams();
  const isActive = String(params?.id) === String(id);

  return (
    <Link href={`/channels/${id}`}>
      <div
        className={`flex items-center py-2.5 px-2 gap-2 rounded-md mx-1 transition-colors ${
          isActive ? "bg-[#3f0f3f]" : "hover:bg-[#5a2a5c]"
        }`}
      >
        <Image
          src={profilePicture}
          alt={displayName}
          height={40}
          width={40}
          className="size-10 rounded-md shrink-0 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p
            className={`text-md font-medium truncate ${
              isActive ? "text-white" : "text-[#f9edffcc]"
            }`}
          >
            {displayName}
          </p>
          <p className="text-xs text-neutral-300 truncate">{message}</p>
        </div>
      </div>
    </Link>
  );
};

const DMSidebar = () => {
  const [users, setUsers] = useState<UserDM[] | null>([
    {
      id: 3,
      displayName: "sage",
      profilePicture:
        "https://ca.slack-edge.com/E09V59WQY1E-U097VQ3MX35-7b4684820acd-72",
      message: "whats up gng",
    },
    {
      id: 4,
      displayName: "lazyllama",
      profilePicture:
        "https://ca.slack-edge.com/E09V59WQY1E-U07F2QA059B-6e0960f84c3c-48",
      message: "hello world",
    },
    {
      id: 5,
      displayName: "fsh",
      profilePicture:
        "https://ca.slack-edge.com/E09V59WQY1E-U07EB2Y76DP-1c477eecf17d-48",
      message: "faah",
    },
    {
      id: 6,
      displayName: "coolcream",
      profilePicture:
        "https://ca.slack-edge.com/E09V59WQY1E-U096RMRG03G-06efc3e5ce5b-48",
      message: "okay",
    },
    {
      id: 7,
      displayName: "keyboard1000",
      profilePicture:
        "https://ca.slack-edge.com/E09V59WQY1E-U092X590XUG-baec610ae81a-48",
      message: "goog...",
    },
  ]);
  const params = useParams();

  // useEffect(() => {
  //   const fetchChannels = async () => {
  //     try {
  //       const res = await fetch("/api/user");
  //       const body = await res.json();

  //       if (!res.ok) {
  //         setChannelsError(body?.error || "Unable to load channels");
  //         return;
  //       }

  //       setChannels(body.data ?? []);
  //     } catch {
  //       setChannelsError("Unable to load channels");
  //     }
  //   };

  //   fetchChannels();
  // }, []);

  return (
    <div className="w-70 pb-10 shrink-0 bg-[#5E2C5f] text-white flex flex-col font-sans select-none relative overflow-x-hidden">
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <SectionHeader label="Direct Messages" />
        <div className="flex flex-col gap-[2px]">
          {users?.map((user) => (
            <UserItem
              key={user.id}
              id={user.id}
              displayName={user.displayName}
              profilePicture={user.profilePicture}
              message={user.message}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DMSidebar;
