"use client";
import { useState } from "react";
import {
  ChevronDown,
  Headphones,
 
  Star,
  Hash,
  Lock,
  Search,
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
import ChannelsSidebar from "@/components/ChannelsSidebar";

const ChannelHeader = () => (
  <div className="h-14 shrink-0 border-b border-black/10 flex items-center px-4 justify-between">
    <div className="flex items-center gap-2 min-w-0">
      <Star className="size-4 text-[#8a8a8a] shrink-0" />
      <span className="font-bold text-[15px] flex items-center gap-1 shrink-0">
        <Hash className="size-4" /> stardance-help
      </span>
      <span className="text-neutral-500  text-[14px] ">sample</span>
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

// const Tabs = () => {
//   const tabs = ["Messages", "Files & links", "to do", "Pins", "Workflows"];
//   const [active, setActive] = useState("Messages");
//   return (
//     <div className="h-10 shrink-0 border-b border-black/10 flex items-center px-4 gap-6 text-[14px] text-[#8a8a8a]">
//       {tabs.map((t) => (
//         <button
//           key={t}
//           onClick={() => setActive(t)}
//           className={`h-full flex items-center border-b-2 ${
//             active === t
//               ? "border-[#1264A3] text-black font-semibold"
//               : "border-transparent hover:text-black"
//           }`}
//         >
//           {t}
//         </button>
//       ))}
//       <button className="text-[#8a8a8a] hover:text-black">
//         <Plus className="size-4" />
//       </button>
//     </div>
//   );
// };

const Avatar = ({ color }) => (
  <div className={`size-9 rounded-md ${color} shrink-0`} />
);

const SimpleMessage = ({ name, time, text, color, badge }) => (
  <div className="flex gap-2 px-4 py-1 items-center hover:bg-black/[0.03]">
    <Avatar color={color} />
    <div className="min-w-0">
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-[15px]">{name}</span>
        <span className="text-[12px] text-[#8a8a8a]">{time}</span>
      </div>
      <p className="text-[15px] font-normal leading-[1.45] tracking-[0.01em] text-[#1d1c1d] antialiased">
        {text}
      </p>{" "}
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

const Composer = () => {
  const [value, setValue] = useState("");
  return (
    <div className="mx-4 mb-10 border border-black/20 rounded-lg overflow-hidden shrink-0 flex flex-col">
      <div className="flex items-center gap-3 px-2.5 py-1.5 border-b border-black/10 text-[#5a5a5a] shrink-0">
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
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Message #stardance-help"
        rows={1}
        className="px-3 py-2.5 text-[15px] w-full resize-none outline-none block max-h-[220px] overflow-y-auto placeholder:text-[#8a8a8a]"
      />
      <div className="flex items-center justify-between px-2.5 py-1.5 shrink-0">
        <div className="flex items-center gap-3 text-[#5a5a5a]">
          <Plus className="size-4" />
          <span className="text-[15px] italic font-semibold">Aa</span>
          <Smile className="size-4" />
          <AtSign className="size-4" />
          <Video className="size-4" />
          <Mic className="size-4" />
          <Paperclip className="size-4" />
        </div>
        <button className="size-6 rounded bg-[#0a5a2a] flex items-center justify-center shrink-0">
          <ArrowUp className="size-4 text-white" />
        </button>
      </div>
    </div>
  );
};

const MainChannel = () => (
  <div className="flex-1 min-w-0 h-screen bg-white text-black flex flex-col min-h-0">
    <ChannelHeader />
    {/* <Tabs /> */}
    <div className="flex-1 min-h-0 overflowpy-2">
      <NewDivider />
      <SimpleMessage
        name="spj"
        time="11:31 AM"
        text="sample"
        color="bg-sky-300"
      />
      <SimpleMessage
        name="test"
        time="1:33 PM"
        text="hello world"
        color="bg-neutral-800"
      />
    </div>
    <Composer />
  </div>
);

const Page = () => {
  return (
    <div className="w-full  flex flex-col font-sans overflow-hidden">
      <div className="flex-1 flex min-h-0">
        <ChannelsSidebar />
        <MainChannel />
      </div>
    </div>
  );
};

export default Page;
