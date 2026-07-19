"use client";
import { useState, useRef, useEffect, useDebugValue } from "react";
import {
  Settings,
  SquarePen,
  MessageCircleMore,
  Send,
  BookOpen,
  ChevronDown,
  Headphones,
  Hash,
  Lock,
  X,
  Globe,
  Loader2,
  CircleCheck,
  CircleAlert,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createChannel } from "@/actions/channel";

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

const Channel = ({
  label,
  locked = false,
  unread = false,
  active = false,
  id,
}) => (
  <Link
    href={`/channels/${id}`}
    className={`flex items-center gap-2 pl-6 pr-2 py-0.5 rounded-md cursor-pointer text-[15px] ${
      active
        ? "bg-[#481349] text-white font-semibold"
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
  </Link>
);

const CreateChannelModal = ({ onClose, router }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const nameRef = useRef(null);
  const descriptionRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const cleanedName = name.trim().toLowerCase().replace(/\s+/g, "-");
  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const canCreate = cleanedName.length > 0 && !isLoading && !isSuccess;

  const handleCreate = async () => {
    if (!canCreate) return;

    setStatus("loading");
    setErrorMessage("");
    const res = await createChannel(name, description, visibility === "public");

   
    setStatus("success");
    router.push(`/channels/${res.id}`);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 font-sans"
      onMouseDown={isLoading ? undefined : onClose}
    >
      <div
        className="w-[480px] max-w-[90vw] rounded-md bg-white shadow-2xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-black/10">
          <h2 className="text-[20px] font-sans font-bold tracking-tight text-[#1D1C1D]">
            Create a channel
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#616061] hover:bg-black/5 rounded-full p-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          {errorMessage && (
            <div className="flex items-start gap-2 mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
              <CircleAlert className="size-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2.5 text-[13px] text-green-700">
              <CircleCheck className="size-4 shrink-0" />
              <span>Channel created! Closing this window&hellip;</span>
            </div>
          )}

          <label className="block text-[13px] font-bold text-[#1D1C1D] mb-1.5">
            Name
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616061]">
              <Hash className="size-4" />
            </span>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. plan-budget"
              maxLength={80}
              disabled={isLoading || isSuccess}
              className="w-full rounded-sm border border-neutral-300 pl-9 pr-3 py-2.5 text-[15px] text-[#1D1C1D] placeholder:text-[#9c9c9c] outline-none disabled:bg-black/5 disabled:text-[#9c9c9c]"
            />
          </div>
          <p className="mt-1.5 text-[12px] text-[#616061]">
            Names must be lowercase, without spaces or periods.
          </p>
          <label className="block mt-3 text-[13px] font-bold text-[#1D1C1D] mb-1.5">
            Description
          </label>
          <div className="relative">
            <input
              ref={descriptionRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. it has"
              maxLength={80}
              disabled={isLoading || isSuccess}
              className="w-full rounded-sm border border-neutral-300 pl-3 pr-3 py-2.5 text-[15px] text-[#1D1C1D] placeholder:text-[#9c9c9c] outline-none disabled:bg-black/5 disabled:text-[#9c9c9c]"
            />
          </div>

          <div className="h-px bg-black/10 my-3" />

          <span className="block text-[13px] font-bold text-[#1D1C1D] mb-2">
            Visibility
          </span>

          <button
            onClick={() => setVisibility("public")}
            disabled={isLoading || isSuccess}
            className={`w-full flex items-center gap-3 rounded-md border px-3 py-2 mb-2 text-left transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              visibility === "public"
                ? "border-[#5E2C5f] ring-1 ring-[#5E2C5f] bg-[#f0f8ff]"
                : "border-[#d1d1d1] hover:bg-black/[0.03]"
            }`}
          >
            <Globe className="size-4 mt-0.5 shrink-0 text-[#1D1C1D]" />
            <span>
              <span className="block  text-[14px] font-semibold text-[#1D1C1D]">
                Public
              </span>
              <span className="block text-[13px] text-[#616061]">
                Anyone in Hack Club can view and join
              </span>
            </span>
          </button>

          <button
            onClick={() => setVisibility("private")}
            disabled={isLoading || isSuccess}
            className={`w-full flex items-center gap-3 rounded-md border px-3 py-2 mb-2 text-left transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              visibility === "private"
                ? "border-[#5E2C5f] ring-1 ring-[#5E2C5f] bg-[#f0f8ff]"
                : "border-[#d1d1d1] hover:bg-black/[0.03]"
            }`}
          >
            <Lock className="size-4 mt-0.5 shrink-0 text-[#1D1C1D]" />
            <span>
              <span className="block text-[14px] font-semibold text-[#1D1C1D]">
                Private
              </span>
              <span className="block text-[13px] text-[#616061]">
                Only invited members can view and join
              </span>
            </span>
          </button>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-black/10">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-md text-[15px] font-semibold text-[#191919] hover:bg-[#1164A3]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-[15px] font-semibold text-white transition-colors min-w-[92px] ${
              canCreate
                ? "bg-[#5E2C5f] hover:bg-[#5E2C5f]"
                : "bg-[#5E2C5f]/40 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isSuccess ? (
              <CircleCheck className="size-4" />
            ) : (
              "Create"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ChannelsSidebar = () => {
  const [showModal, setShowModal] = useState(false);
  const [channels, setChannels] = useState([]);
  const params = useParams();
  const router = useRouter();
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch("/api/user");
        const body = await res.json();
        console.log(res);
        if (!res.ok) {
          setChannelsError(body?.error || "Unable to load channels");
          return;
        }

        setChannels(body.data ?? []);
      } catch {}
    };

    fetchChannels();
  }, []);
  return (
    <div className="w-70 pb-10 shrink-0 bg-[#5E2C5f] text-white flex flex-col font-sans select-none relative overflow-x-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-3">
        <button className="flex items-center gap-1 text-[18px] font-semibold text-white">
          Hack Club
          <ChevronDown className="size-4" />
        </button>
        <div className="flex items-center gap-3 text-[#d1c8d3]">
          <Settings className="size-4.5 cursor-pointer" strokeWidth={1.75} />
          <SquarePen
            className="size-[18px] cursor-pointer"
            strokeWidth={1.75}
            onClick={() => setShowModal(true)}
          />
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
        <SectionHeader label="channels" />
        <div className="flex flex-col gap-[2px]">
          {channels?.map((channel) => (
            <Channel
              key={channel.id}
              label={channel.name}
              locked={!channel.isPublic}
              active={channel.id == params?.id}
              id={channel.id}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <CreateChannelModal
          onClose={() => setShowModal(false)}
          router={router}
        />
      )}
    </div>
  );
};

export default ChannelsSidebar;
