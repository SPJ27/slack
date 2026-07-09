import { get_user_id, get_users_by_ids } from "@/utils/auth/get_user_id";

const cache = new Map();
const inFlight = new Map();

export function getCachedUser(uid) {
  console.log('uid', uid)
  if (uid === -101){
    return {displayName: 'Slack Info'}
  }
  console.log('cache', cache.get(uid))
  return cache.get(uid);
}

export async function loadUsers(uids) {
  const unique = [...new Set(uids)];
  const missing = unique.filter((uid) => !cache.has(uid) && !inFlight.has(uid));

  if (missing.length > 0) {
    const promise = get_users_by_ids(missing).then((users) => {
      users.forEach((u) => cache.set(u.id, u));
      missing.forEach((uid) => inFlight.delete(uid));
    });
    missing.forEach((uid) => inFlight.set(uid, promise));
  }

  const toAwait = unique.filter((uid) => inFlight.has(uid));
  await Promise.all(toAwait.map((uid) => inFlight.get(uid)));
}

export async function loadUser(uid) {
  if (cache.has(uid)) return cache.get(uid);
  if (inFlight.has(uid)) return inFlight.get(uid);

  const promise = get_user_id(uid).then((user) => {
    if (user) cache.set(uid, user);
    inFlight.delete(uid);
    return user;
  });

  inFlight.set(uid, promise);
  return promise;
}