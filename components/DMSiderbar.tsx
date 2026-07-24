"use client";
import { useState, useEffect } from "react";
import { LucideIcon } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";
import { UserDM } from "@/types/DM";

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
  <div className="flex items-center gap-1.5 px-2 py-1.5 mt-3 text-[15px] font-semibold text-white cursor-pointer">
    {label}
  </div>
);

const UserItem = ({
  displayName,
  profilePicture,
  id,
  message,
  date,
}: UserDM) => {
  const params = useParams();
  const isActive = String(params?.id) === String(id);
  function truncateHtmlToText(html: string, maxLength: number): string {
    const plainText = html.replace(/<[^>]*>/g, "");

    const decoded = plainText
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    if (decoded.length <= maxLength) return decoded;
    return decoded.slice(0, maxLength).trimEnd() + "...";
  }
  return (
    <Link href={`/dm/${id}`}>
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
          <p className={`text-md font-normal text-neutral-300`}>
            {displayName}
          </p>
          <div className="text-[15px] font-light leading-[1.45] tracking-[0.01em] text-neutral-200 antialiased">
            {truncateHtmlToText(message, 15)}
          </div>
        </div>
      </div>
    </Link>
  );
};

const DMSidebar = () => {
  const [users, setUsers] = useState<UserDM[] | null>();
  const params = useParams();

  useEffect(() => {
    const fetchChannels = async () => {
      // try {
      const res = await fetch(`/api/dm/all`);
      
      const body = await res.json();
console.log(body)
      if (!res.ok) {
        // setChannelsError(body?.error || "Unable to load channels");
        return;
      }

      setUsers(body.data ?? []);
      // } catch {
      //   setChannelsError("Unable to load channels");
      // }
    };

    fetchChannels();
  }, []);

  return (
    <div className="w-70 pb-10 shrink-0 bg-[#5E2C5f] text-white flex flex-col font-sans select-none relative overflow-x-hidden">
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <SectionHeader label="Direct Messages" />
        <div className="flex flex-col gap-0.5">
          {users?.map((user) => (
            <UserItem
              key={user.id}
              id={user.id}
              displayName={user.displayName}
              profilePicture={user.profilePicture}
              message={user.message}
              date={user.date}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DMSidebar;
