// One refresh per warm runtime, shared by page and image requests. No DB writes.
export function createSnapshotCache(
  load,
  { ttl = 60000, staleTtl = 600000, now = Date.now } = {},
) {
  let current,
    previous,
    pending,
    retryAfter = 0;
  return {
    async get({ allowStale = false } = {}) {
      if (current && current.expires > now()) return current.data;
      try {
        if (retryAfter > now())
          throw new Error("Snapshot refresh is cooling down");
        pending ??= Promise.resolve()
          .then(load)
          .then((data) => {
            previous = current;
            current = { data, expires: now() + ttl, savedAt: now() };
            retryAfter = 0;
            return data;
          })
          .catch((error) => {
            retryAfter = now() + ttl;
            throw error;
          })
          .finally(() => {
            pending = undefined;
          });
        return await pending;
      } catch (error) {
        if (allowStale && current && now() - current.savedAt < staleTtl)
          return current.data;
        throw error;
      }
    },
    previous() {
      return previous && now() - previous.savedAt < staleTtl
        ? previous.data
        : undefined;
    },
  };
}
