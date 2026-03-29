// Request Deduplication Layer
// Prevents the same API call from firing multiple times simultaneously.
// Critical for App.tsx where multiple useEffects can trigger the same call.

const inflight = new Map<string, Promise<unknown>>();
const cache = new Map<string, { data: unknown; timestamp: number }>();
const DEFAULT_CACHE_TTL_MS = 30000;

interface DedupOptions {
  ttlMs?: number;
  force?: boolean;
}

export async function dedupedRequest<T>(
  key: string,
  fn: () => Promise<T>,
  options: DedupOptions = {}
): Promise<T> {
  const { ttlMs = DEFAULT_CACHE_TTL_MS, force = false } = options;

  if (!force) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return cached.data as T;
    }
  }

  if (inflight.has(key)) {
    return inflight.get(key)! as Promise<T>;
  }

  const promise = fn()
    .then((result) => {
      cache.set(key, { data: result, timestamp: Date.now() });
      return result;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
    inflight.delete(key);
  } else {
    cache.clear();
    inflight.clear();
  }
}

export function getCacheStats(): { size: number; keys: string[] } {
  return { size: cache.size, keys: Array.from(cache.keys()) };
}
