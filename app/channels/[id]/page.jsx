"use client";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  Headphones,
  Star,
  Hash,
  Lock,
  Search,
  Bell,
  MoreVertical,
  Link as LinkIcon,
} from "lucide-react";
import ChannelsSidebar from "@/components/ChannelsSidebar";
import Composer from "@/components/Composer";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getCachedUser, loadUsers, loadUser } from "@/utils/auth/user-cache";
import Image from "next/image";

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

const Avatar = ({ pfp = 'https://images.seeklogo.com/logo-png/49/2/slack-logo-png_seeklogo-496177.png' }) => (
  <Image alt='pfp' src={pfp} className="size-8 mt-1 rounded-lg" width={9} height={9} />
);

const SimpleMessage = ({ name, time, text, pfp, special, isSame }) => (
  <div className="flex gap-2 px-4 py-1  hover:bg-black/[0.03]">
    {!isSame ? <Avatar pfp={pfp} /> : <div className="ml-8" />}
    <div className="min-w-0">
      {!isSame && <div className="flex items-baseline gap-2">
        <span className="font-semibold text-[15px]">{name}</span>
        <span className="text-[12px] text-[#8a8a8a]">{time}</span>
      </div>}
      {!special ? <div
        dangerouslySetInnerHTML={{ __html: text }}
        className="text-[15px] font-normal leading-[1.45] tracking-[0.01em] text-[#1d1c1d] antialiased"
      /> :
        <div className="text-neutral-500 text-sm">
          {text}
        </div>}
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

const NotInChannel = ({ channelId, onJoined }) => {
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    console.log(channelId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/channel/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel_id: channelId }),
        },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || "Failed to join channel");
        setJoining(false);
        return;
      }

      onJoined?.();
    } catch (err) {
      setError("Failed to join channel");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="px-3 py-2 mb-10 border border-gray-300 max-w-xl mx-auto rounded-md">
      You need to join this channel to reply
      <button
        className="block mx-auto bg-green-400 px-3 py-2 text-white disabled:opacity-50"
        onClick={handleJoin}
        disabled={joining}
      >
        {joining ? "Joining..." : "Join the channel"}
      </button>
      {error && (
        <p className="text-center text-[13px] text-red-500 mt-1">{error}</p>
      )}
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

const MainChannel = ({ data, members, id, messages, inChannel, onJoined }) => (
  <div className="flex-1 min-w-0 h-screen bg-white text-black flex flex-col min-h-0">
    <ChannelHeader data={data} members={members} />
    <div className="flex-1 min-h-0 overflow-y-auto py-2">
      <NewDivider />
      {messages.map((m, i) => {
        const cachedUser = getCachedUser(m.from)
        const prev = messages[i > 1 ? i - 1 : 0]
        const prevUser = getCachedUser(prev.from)
        const fiveMinutesEarlier = new Date(
          new Date(m.created_at).getTime() - 2 * 60 * 1000
        );
        const prevTime = new Date(
          new Date(prev.created_at).getTime()
        );
        console.log(i)
        console.log(fiveMinutesEarlier)
        console.log(prevTime)
        return (
          <SimpleMessage
            key={m.id}
            name={cachedUser?.displayName ?? "..."}
            time={new Date(m.created_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
            text={m.message}
            pfp={cachedUser?.profilePicture}
            special={m.from === -101}
            isSame={cachedUser?.id == prevUser?.id && fiveMinutesEarlier < prevTime && i!==0}
          />
        )
      })}
    </div>
    {inChannel ? (
      <Composer channel_id={id} />
    ) : (
      <NotInChannel channelId={id} onJoined={onJoined} />
    )}
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
  const router = useRouter();

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
    <div className="w-full h-screen flex flex-col font-sans overflow-hidden">
      {" "}
      <div className="flex-1 flex min-h-0">
        <ChannelsSidebar router={router} />
        {!loading && isPrivate ? (
          <PrivateChannelNotice />
        ) : (
          <MainChannel
            inChannel={inChannel}
            data={data ?? {}}
            members={members}
            id={params.id}
            messages={messages}
            onJoined={() => setInChannel(true)}
          />
        )}
      </div>
    </div>
  );
};
export default Page;
