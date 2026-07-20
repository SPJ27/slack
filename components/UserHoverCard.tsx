import Image from "next/image";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { UserData } from "@/types/UserData";

export default function UserHoverCard({ user, children }:{user: UserData | undefined, children: React.ReactNode}) {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>

      <HoverCardContent className="w-80 rounded-md p-4">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <Image
              src={user?.profilePicture || ''}
              alt={user?.displayName || ''}
              width={56}
              height={56}
              className="size-14 rounded-xl object-cover"
            />

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold leading-tight truncate">
                {user?.name}
              </h3>


              {user?.desc && (
                <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
                  {user.desc}
                </p>
              )}
            </div>
          </div>

          <div className="border-t" />

          <div className="space-y-2 text-sm">
            {user?.email && (
              <div>
                <span className="text-neutral-500">Email</span>
                <p className="font-medium break-all">{user.email}</p>
              </div>
            )}
          </div>

          <button className="w-full rounded-md bg-[#007a5a] py-2 text-sm font-medium text-white hover:bg-[#00694d]">
            Message
          </button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}