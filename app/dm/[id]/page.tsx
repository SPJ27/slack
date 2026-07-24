"use client";
import { useState, useEffect, useRef } from "react";
import UserHoverCard from "@/components/UserHoverCard";
import {
  ChevronDown,
  ChevronLeft,
  Star,
  Hash,
  Lock,
  MoreVertical,
  Link as LinkIcon,
  Settings,
  UserPlus,
  Trash2,
  LogOut,
  File,
  Search,
} from "lucide-react";
import Composer from "@/components/Composer";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getCachedUser, loadUsers, loadUser } from "@/utils/auth/user-cache";
import Image from "next/image";
import { add, deleteChannel, join, leave } from "@/actions/channel";
import { ChannelData } from "@/types/ChannelData";
import { UserData } from "@/types/UserData";
import { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import { Message, SimpleMessageInterface } from "@/types/Message";
import { get_user } from "@/utils/auth/get_user";

interface InviteUser {
  id: number;
  displayName: string;
  profilePicture: string;
}

interface ChannelHeaderProps {
  data: UserData;
}

const ChannelHeader = ({ data }: ChannelHeaderProps) => {
  return (
    <div className="h-14 shrink-0 border-b border-black/10 flex items-center px-4 justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <Star className="size-4 text-[#8a8a8a] shrink-0" />

        <span className="font-semibold text-[17px] flex items-center gap-2 shrink-0">
          {data.profilePicture && (
            <Image
              alt=""
              src={data.profilePicture}
              height={9}
              width={9}
              className="size-8 rounded-md"
            />
          )}
          {data?.name}
        </span>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center -space-x-2"></div>
      </div>
    </div>
  );
};

interface AvatarProps {
  pfp?: string;
}

const Avatar = ({
  pfp = "https://images.seeklogo.com/logo-png/49/2/slack-logo-png_seeklogo-496177.png",
}: AvatarProps) => (
  <Image
    alt="pfp"
    src={pfp}
    className="size-8 mt-1 rounded-md"
    width={9}
    height={9}
  />
);

const SimpleMessage = ({
  name,
  time,
  text,
  pfp,
  isSame,
  user,
  attachments,
  app,
}: SimpleMessageInterface) => (
  <div className="flex gap-2 px-4 py-1 hover:bg-black/3">
    {!isSame ? (
      <UserHoverCard user={user}>
        <div>
          <Avatar pfp={pfp} />
        </div>
      </UserHoverCard>
    ) : (
      <div className="ml-8" />
    )}

    <div className="min-w-0">
      {!isSame && (
        <div className="flex items-baseline gap-2">
          <UserHoverCard user={user}>
            <span className="font-semibold text-[15px] cursor-pointer hover:underline items-center flex">
              {name}{" "}
            </span>
          </UserHoverCard>

          <span className="text-[12px] text-[#8a8a8a]">{time}</span>
        </div>
      )}

      <div
        dangerouslySetInnerHTML={{ __html: text }}
        className="text-[15px] font-normal leading-[1.45] tracking-[0.01em] text-[#1d1c1d] antialiased"
      />

      {attachments && attachments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {attachments.map((url, index) => {
            const isImage = /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(url);

            return isImage ? (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={url}
                  alt=""
                  className="max-w-xs rounded-sm hover:opacity-99"
                />
              </a>
            ) : (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-3 py-1.5 w-64 hover:bg-neutral-50"
              >
                <File className="size-6 text-gray-400 shrink-0" />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {decodeURIComponent(url.split("/").pop() ?? "")}
                  </p>
                  <p className="text-xs text-gray-400">Open attachment</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
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

const Loading = () => (
  <div className="flex-1 min-w-0 h-screen bg-white text-black flex flex-col items-center justify-center gap-2">
    <p className="text-[15px] font-semibold">Loading...</p>
  </div>
);

interface MainChannelProps {
  data: UserData;
  id: number;
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}
const MainChannel = ({
  data,
  id,
  messages,
  messagesEndRef,
}: MainChannelProps) => (
  <div className="flex-1 min-w-0 h-screen bg-white text-black flex flex-col min-h-0">
    <ChannelHeader data={data} />
    <div ref={messagesEndRef} className="flex-1 min-h-0 overflow-y-auto py-2">
      <NewDivider />
      {messages.map((m, i) => {
        const cachedUser = getCachedUser(m.from);
        const prev = messages[i > 1 ? i - 1 : 0];
        const prevUser = getCachedUser(prev.from);
        const fiveMinutesEarlier = new Date(
          new Date(m.created_at).getTime() - 2 * 60 * 1000,
        );
        const prevTime = new Date(new Date(prev.created_at).getTime());

        return (
          <SimpleMessage
            key={m.id}
            user={cachedUser}
            name={cachedUser?.displayName ?? "..."}
            time={new Date(m.created_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
            text={m.message}
            pfp={cachedUser?.profilePicture}
            special={m.from === -101}
            attachments={m.attachments}
            app={m.app}
            isSame={
              cachedUser?.id == prevUser?.id &&
              fiveMinutesEarlier < prevTime &&
              i !== 0
            }
          />
        );
      })}
    </div>
    <Composer id={id} name={data.name} type="DM" />
  </div>
);

const Page = () => {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [, forceRerender] = useState(0);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null =
      null;
    const supabase = createClient();

    const fetchData = async () => {
      setLoading(true);
      setMessages([]);
      const user = await get_user();
      console.log(user);
      setUser(user);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dm?id=${params.id}`,
      );

      if (cancelled) return;

      if (res.status === 404 || res.status === 403) {
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setData(null);
        setLoading(false);
        return;
      }

      const body = await res.json();
      if (cancelled) return;
      setData(body.data);
      setLoading(false);
      console.log(user?.id, params?.id);
      const { data: history } = await supabase
        .from("messages")
        .select("*")
        .eq("type", "DM")
        .or(
          `and(to.eq.${user?.id},from.eq.${params.id}),and(from.eq.${user?.id},to.eq.${params.id})`,
        )
        .order("created_at", { ascending: true });

      if (cancelled) return;
      setMessages((history ?? []) as Message[]);

      await loadUsers((history ?? []).map((m: Message) => m.from));
      if (!cancelled) forceRerender((n) => n + 1);

      channel = supabase
        .channel(`messages:${params.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload: RealtimePostgresInsertPayload<Message>) => {
            const newMessage = payload.new as Message;
            console.log("new message", newMessage);
            if (newMessage.type !== "DM") return;
            if (
              (newMessage.from == user?.id &&
                newMessage.to == Number(params?.id)) ||
              (newMessage.to == user?.id &&
                newMessage.from == Number(params?.id))
            ) {
              setMessages((prev) => [...prev, newMessage]);

              if (!getCachedUser(newMessage.from)) {
                loadUser(newMessage.from).then(() => {
                  if (!cancelled) forceRerender((n) => n + 1);
                });
              }
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const el = messagesEndRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <MainChannel
        data={data ?? ({} as UserData)}
        id={Number(params.id)}
        messages={messages}
        messagesEndRef={messagesEndRef}
      />
    </>
  );
};
export default Page;
