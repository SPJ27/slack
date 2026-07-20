"use client";
import { edit_user, get_user_info } from "@/actions/user";
import { UserData } from "@/types/UserData";
import Image from "next/image";
import { useEffect, useState } from "react";

const page = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [current, setCurrent] = useState<UserData | null>();
  const handleSave = async () => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(user));
    const res = await edit_user(formData)
    setCurrent(user ? { ...user } : user);
    
  };
  useEffect(() => {
    const func = async () => {
      const body = await get_user_info()
      setCurrent(body);
      setUser(body);
    };
    func();
  }, []);
  return (
    <div className="border border-gray-200 rounded-lg max-w-2xl mx-auto mt-7 p-6 bg-white">
      <div className="flex  gap-4">
        <Image
          src={
            user?.profilePicture ||
            "https://cdn.hackclub.com/019f6efe-5439-758f-852b-5df3f9e8af85/images.jpg"
          }
          alt="Profile picture"
          width={80}
          height={80}
          className="size-20 mr-3 rounded-sm border object-cover"
        />

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-800">
              Display Name
            </label>

            <p className="mt-0.5 text-xs text-neutral-500">
              This is the name shown to other members across chats, channels,
              and mentions.
            </p>

            <input
              type="text"
              value={user?.displayName || ""}
              onChange={(e) =>
                setUser((prev) => (prev ? {
                  ...prev,
                  displayName: e.target.value,
                }: prev))
              }
              placeholder="Enter your display name"
              className="mt-3 w-full rounded-md border border-gray-300 px-3 py-1 text-md font-medium outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name..."
              value={user?.name || ""}
              onChange={(e) =>
                setUser((prev) => (prev ? {
                  ...prev,
                  name: e.target.value,
                } : prev))
              }
              className="mt-3 w-full rounded-md border border-gray-300 px-3 py-1 text-md font-medium outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800">
              Description
            </label>

            <p className="mt-0.5 text-xs text-neutral-500">
              Tell people about you!
            </p>

            <textarea
              value={user?.desc || ""}
              onChange={(e) =>
                setUser((prev) => (prev ? {
                  ...prev,
                  desc: e.target.value,
                }: prev))
              }
              placeholder=""
              className="mt-3 w-full rounded-md border border-gray-300 px-3 py-1 text-md font-medium outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800">
              Joined On
            </label>
            <input
              type="text"
              title="hola"
              value={
                user?.created_at
                  ? new Intl.DateTimeFormat("en-US", {
                      dateStyle: "long",
                      timeZone: "UTC",
                    }).format(new Date(user.created_at))
                  : ""
              }
              disabled
              className="mt-3 w-full bg-neutral-100 text-neutral-700 rounded-md border border-gray-300 px-3 py-1 text-md font-medium outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800">
              Email
            </label>

            <input
              type="text"
              value={user?.email || ""}
              disabled
              className="mt-3 w-full bg-neutral-100 text-neutral-700 rounded-md border border-gray-300 px-3 py-1 text-md font-medium outline-none"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-green-800 disabled:bg-neutral-500 transition-colors disabled:cursor-not-allowed hover:bg-green-900 px-4 py-1.5 text-white font-semibold rounded-xs cursor-pointer"
            disabled={JSON.stringify(current) == JSON.stringify(user)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default page;