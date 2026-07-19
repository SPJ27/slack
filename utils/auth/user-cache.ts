import { get_user_id, get_users_by_ids } from "@/utils/auth/get_user_id";

interface CachedUser {
  id: number;
  displayName: string;
  profilePicture: string;
}

const cache = new Map<number, CachedUser>();
const inFlight = new Map<number, Promise<void>>();

export function getCachedUser(uid: number): CachedUser | undefined {
  console.log("uid", uid);
  if (uid === -101) {
    return {
      id: -101,
      displayName: "Slack Info",
      profilePicture:
        "https://i.pinimg.com/736x/7d/d6/17/7dd61762f78848ecef51f5c2e58add0d.jpg",
    };
  }
  return cache.get(uid);
}

export async function loadUsers(uids: number[]): Promise<void> {
  const unique = [...new Set(uids)];
  const missing: number[] = unique.filter(
    (uid) => !cache.has(uid) && !inFlight.has(uid)
  );

  if (missing.length > 0) {
    const promise: Promise<void> = get_users_by_ids(missing).then((users) => {
      users?.forEach((u) => cache.set(u.id, u));
      missing.forEach((uid) => inFlight.delete(uid));
    });
    missing.forEach((uid) => inFlight.set(uid, promise));
  }

  const toAwait = unique.filter((uid) => inFlight.has(uid));
  await Promise.all(toAwait.map((uid) => inFlight.get(uid)));
}

export async function loadUser(uid: number): Promise<CachedUser | undefined> {
  if (cache.has(uid)) return cache.get(uid);

  if (inFlight.has(uid)) {
    await inFlight.get(uid);
    return cache.get(uid);
  }

  const promise: Promise<void> = get_user_id(uid).then((user) => {
    if (user) cache.set(uid, user);
    inFlight.delete(uid);
  });

  inFlight.set(uid, promise);
  await promise;
  return cache.get(uid);
}