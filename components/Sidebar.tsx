"use client";
import React, { useEffect, useState } from "react";
import { Home, Bell, Laptop, MessagesSquare, LucideIcon } from "lucide-react";
import SidebarBtn from "./SidebarBtn";
import { get_user } from "@/utils/auth/get_user";
import { UserData } from "@/types/UserData";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

const navItems: NavItem[] = [
  { key: "home", label: "Home", icon: Home, href: "/channels" },
  { key: "dms", label: "DMs", icon: MessagesSquare, href: "/dm" },
  { key: "activity", label: "Activity", icon: Bell, href: "" },
  { key: "dev", label: "Dev", icon: Laptop, href: "" },
];

const Sidebar = () => {
  const [active, setActive] = useState("home");
  const [user, setUser] = useState<UserData | null>(null);
  const url = usePathname()
  if (url == '/' || url == '') return <></>
  useEffect(() => {
    get_user().then((u) => {
      setUser(u);
    });
  }, []);

  return (
    <div className="w-17.5 h-screen bg-[#481349] flex flex-col gap-y-4 items-center pt-9 pb-4 text-white font-medium">
      <img
        className="size-9 rounded-md"
        src="https://assets.hackclub.com/icon-square.svg"
        alt="logo"
      />
      {navItems.map(({ key, label, icon: Icon, href }) => {
        const isActive = active === key;
        return (
          <SidebarBtn
            key={key}
            label={label}
            Icon={Icon}
            href={href}
            // active={isActive}
            // onClick={() => setActive(key)}
          />
        );
      })}
      <div className="flex-1" />
      <div className="flex flex-col items-center gap-4 pb-1">
        <Link
          href="/me"
          className="w-10 h-10 rounded-md overflow-hidden ring-1 bg-white ring-white/10"
        >
          <img
            src={user?.profilePicture || "/default-avatar.png"}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;