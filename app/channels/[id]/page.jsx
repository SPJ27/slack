"use client";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
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

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { get_user_id } from "@/utils/auth/get_user_id";
import { getCachedUser, loadUsers, loadUser } from "@/utils/auth/user-cache";

const ChannelHeader = ({ data, members }) => (
  <div className="h-14 shrink-0 border-b border-black/10 flex items-center px-4 justify-between">
    <div className="flex items-center gap-2 min-w-0">
      <Star className="size-4 text-[#8a8a8a] shrink-0" />
      <span className="font-bold text-[17px] flex items-center gap-1 shrink-0">
        {data.isPublic ? (
          <Hash className="size-4" />
        ) : (
          <Lock className="size-4" />
        )}{" "}
        {data?.name}
      </span>
      <span className="text-neutral-500  text-[14px] ">{data.description}</span>
    </div>
    <div className="flex items-center gap-4 shrink-0">
      <div className="flex items-center -space-x-2">
        <div className="size-6 rounded-md bg-amber-700 border-2 border-[#1a1d21]" />
        <div className="size-6 rounded-md bg-emerald-700 border-2 border-[#1a1d21]" />
      </div>
      <span className="text-[13px] text-[#8a8a8a]">{members.length}</span>
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

const Avatar = ({ color }) => (
  <div className={`size-9 mt-1 rounded-md ${color} shrink-0`} />
);

const SimpleMessage = ({ name, time, text, color, badge }) => (
  <div className="flex gap-2 px-4 py-1  hover:bg-black/[0.03]">
    <Avatar color={color} />
    <div className="min-w-0">
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-[15px]">{name}</span>
        <span className="text-[12px] text-[#8a8a8a]">{time}</span>
      </div>
      < div
      dangerouslySetInnerHTML={{ __html: text }}
      className="text-[15px] font-normal leading-[1.45] tracking-[0.01em] text-[#1d1c1d] antialiased"/>
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

const QuillToolbar = ({ onFormat, activeFormats }) => {
  const btn = (active) =>
    `flex items-center rounded p-0.5 ${active ? "text-[#1264A3] bg-[#1264A3]/10" : ""}`;

  return (
    <div className="flex items-center gap-3 px-2.5 py-1.5 border-b border-black/10 text-[#5a5a5a] shrink-0">
      <button
        type="button"
        className={btn(activeFormats.bold)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat("bold", !activeFormats.bold)}
      >
        <Bold className="size-4" />
      </button>
      <button
        type="button"
        className={btn(activeFormats.italic)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat("italic", !activeFormats.italic)}
      >
        <Italic className="size-4" />
      </button>
      <button
        type="button"
        className={btn(activeFormats.underline)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat("underline", !activeFormats.underline)}
      >
        <Underline className="size-4" />
      </button>
      <button
        type="button"
        className={btn(activeFormats.strike)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat("strike", !activeFormats.strike)}
      >
        <Strikethrough className="size-4" />
      </button>
      <button
        type="button"
        className={btn(activeFormats.link)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const url = window.prompt("Enter a URL");
          if (url) onFormat("link", url);
        }}
      >
        <LinkIcon className="size-4" />
      </button>
      <button
        type="button"
        className={btn(activeFormats.list === "bullet")}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          onFormat("list", activeFormats.list === "bullet" ? false : "bullet")
        }
      >
        <List className="size-4" />
      </button>
      <button
        type="button"
        className={btn(activeFormats.list === "ordered")}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          onFormat("list", activeFormats.list === "ordered" ? false : "ordered")
        }
      >
        <ListOrdered className="size-4" />
      </button>
      <button
        type="button"
        className={btn(activeFormats["code-block"])}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat("code-block", !activeFormats["code-block"])}
      >
        <Code className="size-4" />
      </button>
      <div className="w-px h-4 bg-black/10" />
    </div>
  );
};

const quillModules = { toolbar: false };

const Composer = ({ channel_id }) => {
  const [value, setValue] = useState("");
  const [activeFormats, setActiveFormats] = useState({});
  const quillRef = useRef(null);

  const getEditor = () => quillRef.current?.getEditor?.() ?? null;

  const refreshActiveFormats = () => {
    const editor = getEditor();
    if (!editor) return;
    const range = editor.getSelection();
    if (!range) return;
    setActiveFormats(editor.getFormat(range));
  };

  const handleFormat = (name, value) => {
    const editor = getEditor();
    if (!editor) return;
    const range = editor.getSelection() || {
      index: editor.getLength(),
      length: 0,
    };
    editor.focus();
    editor.setSelection(range);
    editor.format(name, value);
    refreshActiveFormats();
  };

  const handleSend = async () => {
    const text = value.replace(/<(.|\n)*?>/g, "").trim();
    if (!text) return;
    console.log("send:", value);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: channel_id,
        message: value,
        type: "CHANNEL",
      }),
    });

    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mx-4 mb-10 border border-black/20 rounded-lg overflow-hidden shrink-0 flex flex-col">
      <QuillToolbar onFormat={handleFormat} activeFormats={activeFormats} />
      <div onKeyDown={handleKeyDown}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={setValue}
          onChangeSelection={refreshActiveFormats}
          modules={quillModules}
          placeholder="Message #stardance-help"
          className="composer-quill"
        />
      </div>
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
        <button
          onClick={handleSend}
          className="size-6 rounded bg-[#0a5a2a] flex items-center justify-center shrink-0"
        >
          <ArrowUp className="size-4 text-white" />
        </button>
      </div>
      <style jsx global>{`
        .composer-quill .ql-container {
          border: none !important;
          font-family: inherit;
        }
        .composer-quill .ql-editor {
          padding: 10px 12px;
          min-height: 24px;
          max-height: 220px;
          font-size: 15px;
          line-height: 1.45;
        }
        .composer-quill .ql-editor.ql-blank::before {
          color: #8a8a8a;
          font-style: normal;
          left: 12px;
        }
      `}</style>
    </div>
  );
};
const NotInChannel = () => {
  return (
    <div className="px-3 py-2 mb-10 border border-gray-300 max-w-xl mx-auto rounded-md">
      You need to join this channel to reply
    </div>
  );
};

const PrivateChannelNotice = () => (
  <div className="flex-1 min-w-0 h-screen bg-white text-black flex flex-col items-center justify-center gap-2">
    <Lock className="size-6 text-[#8a8a8a]" />
    <p className="text-[15px] font-semibold">This channel is private</p>
    <p className="text-[13px] text-[#8a8a8a]">
      You must be a member to view its content
    </p>
  </div>
);

const MainChannel = ({ data, members, id, messages, inChannel }) => (
  <div className="flex-1 min-w-0 h-screen bg-white text-black flex flex-col min-h-0">
    <ChannelHeader data={data} members={members} />
    <div className="flex-1 min-h-0 overflow-y-auto py-2">
      <NewDivider />
      {messages.map((m) => (
        <SimpleMessage
          key={m.id}
          name={getCachedUser(m.from)?.displayName ?? "..."}
          time={new Date(m.created_at).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
          text={m.message}
          color="bg-sky-300"
        />
      ))}
    </div>
    {inChannel ? <Composer channel_id={id} /> : <NotInChannel />}
  </div>
);

const Page = () => {
  const params = useParams();
  const [data, setData] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [inChannel, setInChannel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, forceRerender] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let channel = null;
    const supabase = createClient();

    const fetchData = async () => {
      setLoading(true);
      setIsPrivate(false);
      setMessages([]);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/channel?id=${params.id}`,
      );

      if (cancelled) return;

      if (res.status === 403) {
        setData(null);
        setMembers([]);
        setIsPrivate(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setData(null);
        setMembers([]);
        setLoading(false);
        return;
      }

      const body = await res.json();
      if (cancelled) return;
      setInChannel(body.inChannel);
      setData(body.data);
      setMembers(body.members ?? []);
      setLoading(false);

      const { data: history } = await supabase
        .from("messages")
        .select("*")
        .eq("type", "CHANNEL")
        .eq("to", params.id)
        .order("created_at", { ascending: true });

      if (cancelled) return;
      setMessages(history ?? []);

      await loadUsers((history ?? []).map((m) => m.from));
      if (!cancelled) forceRerender((n) => n + 1);

      channel = supabase
        .channel(`messages:${params.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `to=eq.${params.id}`,
          },
          (payload) => {
            if (payload.new.type !== "CHANNEL") return;
            setMessages((prev) => [...prev, payload.new]);

            if (!getCachedUser(payload.new.from)) {
              loadUser(payload.new.from).then(() => {
                if (!cancelled) forceRerender((n) => n + 1);
              });
            }
          },
        )
        .subscribe();
    };

    fetchData();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [params.id]);

  return (
    <div className="w-full flex flex-col font-sans overflow-hidden">
      <div className="flex-1 flex min-h-0">
        <ChannelsSidebar />
        {!loading && isPrivate ? (
          <PrivateChannelNotice />
        ) : (
          <MainChannel
            inChannel={inChannel}
            data={data ?? {}}
            members={members}
            id={params.id}
            messages={messages}
          />
        )}
      </div>
    </div>
  );
};
export default Page;
