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

const ChannelHeader = ({ data, members, id }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inviteMenuOpen, setInviteMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [inviteQuery, setInviteQuery] = useState("");
  const [inviteResults, setInviteResults] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviting, setInviting] = useState(null);
  const inviteCache = useRef(new Map());

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!menuOpen || !inviteMenuOpen) {
      setInviteQuery("");
      setInviteResults([]);
      setInviteLoading(false);
    }
  }, [menuOpen, inviteMenuOpen]);

  useEffect(() => {
    if (!inviteMenuOpen) return;

    if (!inviteQuery.trim()) {
      setInviteResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      if (inviteCache.current.has(inviteQuery)) {
        setInviteResults(inviteCache.current.get(inviteQuery));
        return;
      }

      setInviteLoading(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/search/users?query=${encodeURIComponent(inviteQuery)}`,
        );

        const data = await res.json();

        inviteCache.current.set(inviteQuery, data);
        setInviteResults(data);
      } catch (err) {
        setInviteResults([]);
      } finally {
        setInviteLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [inviteQuery, inviteMenuOpen]);

  const handleInvite = async (user) => {
    setInviting(user.id);

    try {
      const res = await add(id, user.id)

      setInviteResults((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setInviting(null);
    }
  };

  return (
    <div className="h-14 shrink-0 border-b border-black/10 flex items-center px-4 justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <Star className="size-4 text-[#8a8a8a] shrink-0" />

        <span className="font-bold text-[17px] flex items-center gap-1 shrink-0">
          {data.isPublic ? (
            <Hash className="size-4" />
          ) : (
            <Lock className="size-4" />
          )}
          {data?.name}
        </span>

        <span className="text-neutral-500 text-[14px]">{data.description}</span>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center -space-x-2">
          {members[0] && (
            <Image
              alt="pfp"
              src={members[0].profilePicture}
              width={9}
              height={9}
              className="size-6 rounded-md border-2 border-[#1a1d21]"
            />
          )}

          {members[1] && (
            <Image
              alt="pfp"
              src={members[1].profilePicture}
              width={9}
              height={9}
              className="size-6 rounded-md border-2 border-[#1a1d21]"
            />
          )}
        </div>

        <span className="text-[13px] text-[#8a8a8a]">{members.length}</span>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-md p-1 hover:bg-black/5 transition"
          >
            <MoreVertical className="size-4 text-[#8a8a8a]" />
          </button>
          {menuOpen &&
            (!inviteMenuOpen ? (
              <div className="absolute py-1 right-0 top-full mt-2 w-56 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-xl z-50">
                <button
                  onClick={() => setInviteMenuOpen(true)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100"
                >
                  <UserPlus className="size-4" />
                  Invite people
                </button>

                <button className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100">
                  <Settings className="size-4" />
                  Channel settings
                </button>

                <button className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100">
                  <LinkIcon className="size-4" />
                  Copy channel link
                </button>

                <div className="border-t" />

                <button
                  onClick={async () => {
                    if (
                      !confirm("Are you sure you want to leave this channel?")
                    )
                      return;

                    try {
                      const res = await leave(id)
                      window.location.href = "/channels";
                    } catch (err) {
                      alert("Something went wrong");
                    }
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="size-4" />
                  Leave channel
                </button>

                <button
                  onClick={async () => {
                    if (
                      !confirm("Are you sure you want to delete this channel?")
                    )
                      return;

                    try {
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/channel`,
                        {
                          method: "DELETE",
                          headers: { channel_id: id },
                        },
                      );

                      if (!res.ok) {
                        const body = await res.json().catch(() => ({}));
                        alert(body.message || "Failed to delete channel");
                        return;
                      }

                      window.location.href = "/channels";
                    } catch (err) {
                      alert("Something went wrong");
                    }
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="size-4" />
                  Delete channel
                </button>
              </div>
            ) : (
              <div className="absolute py-2 right-0 top-full mt-2 w-72 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-xl z-50">
                <div className="flex items-center gap-1 px-2 pb-2">
                  <button
                    onClick={() => setInviteMenuOpen(false)}
                    className="rounded p-1 hover:bg-gray-100 shrink-0"
                  >
                    <ChevronLeft className="size-4 text-neutral-500" />
                  </button>

                  <div className="flex items-center flex-1 min-w-0">
                    <Search className="size-4 text-neutral-500 ml-1 shrink-0" />
                    <input
                      autoFocus
                      value={inviteQuery}
                      onChange={(e) => setInviteQuery(e.target.value)}
                      placeholder="Search people"
                      className="ml-2 flex-1 min-w-0 text-sm outline-none border-b border-neutral-200 py-1"
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {inviteLoading ? (
                    <div className="px-4 py-2 text-sm text-gray-400">
                      Searching...
                    </div>
                  ) : inviteQuery.trim() && inviteResults.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-400">
                      No people found
                    </div>
                  ) : (
                    inviteResults.slice(0, 7).map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleInvite(user)}
                        disabled={inviting === user.id}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Image
                          src={user.profilePicture}
                          alt={user.displayName}
                          width={28}
                          height={28}
                          className="size-7 rounded-sm object-cover shrink-0"
                        />
                        <span className="truncate flex-1 text-left">
                          {user.displayName}
                        </span>
                        {inviting === user.id && (
                          <span className="text-xs text-gray-400 shrink-0">
                            Inviting...
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const Avatar = ({
  pfp = "https://images.seeklogo.com/logo-png/49/2/slack-logo-png_seeklogo-496177.png",
}) => (
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
  special,
  isSame,
  user,
  attachments,
  app,
}) => (
  <div className="flex gap-2 px-4 py-1 hover:bg-black/[0.03]">
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
          {!special ? (
            <UserHoverCard user={user}>
              <span className="font-semibold text-[15px] cursor-pointer hover:underline items-center flex">
                {name}{" "}
              </span>
            </UserHoverCard>
          ) : (
            <span className="font-semibold text-[15px]  items-center flex">
              {name}{" "}
              {app ? (
                <span className="text-[11px] px-1 py bg-neutral-500 rounded-xs ml-1.5  text-white">
                  APP
                </span>
              ) : (
                ""
              )}
            </span>
          )}

          <span className="text-[12px] text-[#8a8a8a]">{time}</span>
        </div>
      )}

      {special ? (
        <div className="text-neutral-500 text-sm">{text}</div>
      ) : (
        <div
          dangerouslySetInnerHTML={{ __html: text }}
          className="text-[15px] font-normal leading-[1.45] tracking-[0.01em] text-[#1d1c1d] antialiased"
        />
      )}

      {attachments?.length > 0 && (
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
                    {decodeURIComponent(url.split("/").pop())}
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

const NotInChannel = ({ channelId, onJoined }) => {
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    console.log(channelId);
    try {
      const res = await join(channelId)

      onJoined?.();
    } catch (err) {
      setError("Failed to join channel");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="px-6 py-3 mb-13 border text-lg border-gray-400 max-w-xl mx-auto rounded-md">
      You need to join this channel to reply :)
      <button
        className="block text-sm mx-auto bg-green-700 px-3 py-1 mt-1 text-white disabled:opacity-50"
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
    <p className="text-[15px] font-semibold">This channel does not exists</p>
    
  </div>
);
const Loading = () => (
  <div className="flex-1 min-w-0 h-screen bg-white text-black flex flex-col items-center justify-center gap-2">
    <p className="text-[15px] font-semibold">Loading...</p>
  </div>
);

const MainChannel = ({ data, members, id, messages, inChannel, onJoined }) => (
  <div className="flex-1 min-w-0 h-screen bg-white text-black flex flex-col min-h-0">
    <ChannelHeader data={data} members={members} id={id} />
    <div className="flex-1 min-h-0 overflow-y-auto py-2">
      <NewDivider />
      {messages.map((m, i) => {
        const cachedUser = getCachedUser(m.from);
        const prev = messages[i > 1 ? i - 1 : 0];
        const prevUser = getCachedUser(prev.from);
        const fiveMinutesEarlier = new Date(
          new Date(m.created_at).getTime() - 2 * 60 * 1000,
        );
        const prevTime = new Date(new Date(prev.created_at).getTime());
        console.log(i);
        console.log(fiveMinutesEarlier);
        console.log(prevTime);
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
    {inChannel ? (
      <Composer channel_id={id} channel_name={data.name} />
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
  const [inChannel, setInChannel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, forceRerender] = useState(0);
  const [doesExist, setDoesExist] = useState(false)
  useEffect(() => {
    let cancelled = false;
    let channel = null;
    const supabase = createClient();

    const fetchData = async () => {
      setLoading(true);
      setMessages([]);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/channel?id=${params.id}`,
      );

      if (cancelled) return;

      
      if (res.status === 404 && res.status === 403) {
        setLoading(false)
        setDoesExist(false);
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
      setDoesExist(true)
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
    <>
      {!loading ? (
        !loading && !doesExist ? (
          <PrivateChannelNotice/>
        ) : (
          <MainChannel
            inChannel={inChannel}
            data={data ?? {}}
            members={members}
            id={params.id}
            messages={messages}
            onJoined={() => setInChannel(true)}
          />
        )
      ) : (
        <Loading />
      )}
    </>
  );
};
export default Page;
