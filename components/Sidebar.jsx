"use client";
import React, { useEffect, useState } from "react";
import { Home, Bell, Laptop, Plus, Moon, MessagesSquare } from "lucide-react";
import SidebarBtn from "./SidebarBtn";
import { get_user } from "@/utils/auth/get_user";

const navItems = [
  { key: "home", label: "Home", icon: Home },
  { key: "dms", label: "DMs", icon: MessagesSquare },
  { key: "activity", label: "Activity", icon: Bell },
  { key: "dev", label: "Dev", icon: Laptop },
];

const Sidebar = () => {
  const [active, setActive] = useState("home");
  const [user, setUser] = useState(null)
  useEffect(() => {
    get_user().then((u) => {
      setUser(u)
    });
  }, [])
  return (
    <div className="w-17.5 h-screen bg-[#481349] flex flex-col gap-y-4 items-center pt-9 pb-4 text-white font-medium">
  
        <img
          className="size-9 rounded-md"
          src="https://assets.hackclub.com/icon-square.svg"
          alt="logo"
        />

        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <SidebarBtn key={key} label={label} Icon={Icon}/>
          );
        })}

      <div className="flex-1" />
      <div className="flex flex-col items-center gap-4 pb-1">
       
        <button className="w-10 h-10 rounded-md overflow-hidden ring-1 bg-white ring-white/10">
          <img
            src={user?.profilePicture}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
