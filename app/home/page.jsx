'use client'
import { useState } from "react";
import {
  ChevronDown,
  Settings,
  SquarePen,
  MessageCircleMore,
  Headphones,
  Send,
  BookOpen,
  Star,
  Hash,
  Lock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  HelpCircle,
  Minus,
  Square,
  X,
  Mic,
  Video,
  Bell,
  MoreVertical,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
  Code,
  Plus,
  Smile,
  AtSign,
  Paperclip,
  ArrowUp,
} from "lucide-react";

const TopItem = ({ Icon, label, trailing }) => (
  <span className="flex mt-1.5 pl-2 font-normal text-sm font-sans items-center gap-1.5 text-[#f9edffcc]">
    <Icon className="size-4" /> {label}
    {trailing && <span className="ml-auto pr-2 text-xs">{trailing}</span>}
  </span>
);

const SectionHeader = ({ label }) => (
  <div className="flex items-center gap-1.5 px-2 py-[6px] mt-3 text-[15px] font-semibold text-white cursor-pointer">
    {label}
  </div>
);

const Channel = ({ label, locked = false, unread = false, active = false }) => (
  <div
    className={`flex items-center gap-2 pl-6 pr-2 py-0.5 rounded-md cursor-pointer text-[15px] ${
      active
        ? "bg-[#1164A3] text-white font-semibold"
        : unread
        ? "font-bold text-white hover:bg-white/10"
        : "font-normal text-[#c2b7c4] hover:bg-white/10"
    }`}
  >
    {locked ? (
      <Lock className="size-[13px] shrink-0" strokeWidth={2} />
    ) : (
      <Hash className="size-[15px] shrink-0" strokeWidth={2} />
    )}
    <span className="truncate">{label}</span>
  </div>
);

const Sidebar = () => (
  <div className="w-[280px] shrink-0 bg-[#5E2C5f] text-white flex flex-col font-sans select-none relative overflow-hidden">
    <div className="flex items-center justify-between px-4 pt-3 pb-3">
      <button className="flex items-center gap-1 text-[18px] font-semibold text-white">
        Hack Club
        <ChevronDown className="size-4" />
      </button>
      <div className="flex items-center gap-3 text-[#d1c8d3]">
        <Settings className="size-[18px] cursor-pointer" strokeWidth={1.75} />
        <SquarePen className="size-[18px] cursor-pointer" strokeWidth={1.75} />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto px-2 pb-4">
      <div className="flex flex-col gap-[1px]">
        <TopItem Icon={MessageCircleMore} label="Threads" />
        <TopItem Icon={Headphones} label="Huddles" />
        <TopItem Icon={Send} label="Drafts & sent" trailing="29" />
        <TopItem Icon={BookOpen} label="Directories" />
      </div>

      <div className="h-px bg-white/15 my-3 mx-2" />
      <SectionHeader label="stardance" />
      <div className="flex flex-col gap-[2px]">
        <Channel label="stardance" unread />
        <Channel label="stardance-bulletin" />
        <Channel label="stardance-construction" />
        <Channel label="stardance-help" unread />
        <Channel label="stardance-monitor" />
        <Channel label="stardance-support-scouts" locked />
        <Channel label="stardance-tickets" locked unread />
        <Channel label="c-reem-cheese" active />
        <Channel label="stardance-tracker" />
        <Channel label="stardance-watcher" unread />
        <Channel label="support-scouts-lounge" locked />
      </div>

      <SectionHeader label="flavortown" />
      <div className="flex flex-col gap-[2px]">
        <Channel label="flavortown" unread />
        <Channel label="flavortown-kitchen" />
      </div>
    </div>
  </div>
);


const ChannelHeader = () => (
  <div className="h-14 shrink-0 border-b border-black/10 flex items-center px-4 justify-between">
    <div className="flex items-center gap-2 min-w-0">
      <Star className="size-4 text-[#8a8a8a] shrink-0" />
      <span className="font-bold text-[15px] flex items-center gap-1 shrink-0">
        <Hash className="size-4" /> c-reem-cheese
      </span>
      <span className="text-[#8a8a8a] text-[14px] truncate">my digital journal 🌱</span>
    </div>
    <div className="flex items-center gap-4 shrink-0">
      <div className="flex items-center -space-x-2">
        <div className="size-6 rounded-md bg-amber-700 border-2 border-[#1a1d21]" />
        <div className="size-6 rounded-md bg-emerald-700 border-2 border-[#1a1d21]" />
      </div>
      <span className="text-[13px] text-[#8a8a8a]">210</span>
      <div className="flex items-center gap-1 text-[#8a8a8a]">
        <Headphones className="size-4" />
        <ChevronDown className="size-3.5" />
      </div>
      <Bell className="size-4 text-[#8a8a8a]" />
      <Search className="size-4 text-[#8a8a8a]" />
      <MoreVertical className="size-4 text-[#8a8a8a]" />
    </div>
  </div>
);

const Tabs = () => {
  const tabs = ["Messages", "Files & links", "to do", "Pins", "Workflows"];
  const [active, setActive] = useState("Messages");
  return (
    <div className="h-10 shrink-0 border-b border-black/10 flex items-center px-4 gap-6 text-[14px] text-[#8a8a8a]">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setActive(t)}
          className={`h-full flex items-center border-b-2 ${
            active === t
              ? "border-[#1264A3] text-black font-semibold"
              : "border-transparent hover:text-black"
          }`}
        >
          {t}
        </button>
      ))}
      <button className="text-[#8a8a8a] hover:text-black">
        <Plus className="size-4" />
      </button>
    </div>
  );
};

const Avatar = ({ color }) => (
  <div className={`size-9 rounded-md ${color} shrink-0`} />
);


const SimpleMessage = ({ name, time, text, color, badge }) => (
  <div className="flex gap-2 px-4 py-1 hover:bg-black/[0.03]">
    <Avatar color={color} />
    <div className="min-w-0">
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-[15px]">{name}</span>
        {badge}
        <span className="text-[12px] text-[#8a8a8a]">{time}</span>
      </div>
      <p className="text-[15px] leading-snug">{text}</p>
    </div>
  </div>
);

const NewDivider = () => (
  <div className="flex items-center px-4 my-1">
    <div className="border-t border-[#e0522f] flex-1" />
    <button className="mx-2 text-[13px] font-semibold text-[#8a8a8a] flex items-center gap-1 border border-black/10 rounded-full px-2 py-0.5">
      Today <ChevronDown className="size-3.5" />
    </button>
    <div className="border-t border-[#e0522f] flex-1" />
    <span className="ml-2 text-[12px] font-bold text-[#e0522f]">New</span>
  </div>
);

const Composer = () => (
  <div className="mx-4 mb-4 border border-black/20 rounded-lg overflow-hidden shrink-0">
    <div className="flex items-center gap-3 px-2.5 py-1.5 border-b border-black/10 text-[#5a5a5a]">
      <Bold className="size-4" />
      <Italic className="size-4" />
      <Underline className="size-4" />
      <Strikethrough className="size-4" />
      <LinkIcon className="size-4" />
      <List className="size-4" />
      <ListOrdered className="size-4" />
      <Code className="size-4" />
      <div className="w-px h-4 bg-black/10" />
    </div>
    <textarea  className="px-3 py-2.5 text-[15px]  min-h-[44px] w-full">
    </textarea>
    <div className="flex items-center justify-between px-2.5 py-1.5">
      <div className="flex items-center gap-3 text-[#5a5a5a]">
        <Plus className="size-4" />
        <span className="text-[15px] italic font-semibold">Aa</span>
        <Smile className="size-4" />
        <AtSign className="size-4" />
        <Video className="size-4" />
        <Mic className="size-4" />
        <Paperclip className="size-4" />
      </div>
      <button className="size-6 rounded bg-[#0a5a2a] flex items-center justify-center">
        <ArrowUp className="size-4 text-white" />
      </button>
    </div>
  </div>
);

const MainChannel = () => (
  <div className="flex-1 min-w-0 bg-white text-black flex flex-col">
    <ChannelHeader />
    <Tabs />
    <div className="flex-1  py-2">
      <NewDivider />
      <SimpleMessage name="æra" time="11:31 AM" text="son beam" color="bg-sky-300" />
      <SimpleMessage
        name="Gerald R. Ford Jr."
        time="1:33 PM"
        text="son reem"
        color="bg-neutral-800"
        badge={<span>🌱</span>}
      />
    </div>
    <Composer />
  </div>
);

const Page = () => {
  return (
    <div className="w-full h-screen flex flex-col font-sans">
      
      <div className="flex-1 flex min-h-0">
        <Sidebar />
        <MainChannel />
      </div>
    </div>
  );
};

export default Page;