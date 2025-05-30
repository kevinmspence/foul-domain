const caches = {};

// Basic TTL-aware getter
export function getCached(key, ttlMs = 1000 * 60 * 10) {
  const entry = caches[key];
  const now = Date.now();
  if (entry && now - entry.timestamp < ttlMs) {
    return entry.data;
  }
  return null;
}

// Basic setter
export function setCached(key, data) {
  caches[key] = {
    data,
    timestamp: Date.now(),
  };
}

// Cache forever: fetch if not cached
export async function getOrCacheForever(key, fetchFn) {
  const cached = getCached(key, Infinity);
  if (cached) return cached;

  const data = await fetchFn();
  setCached(key, data);
  return data;
}

// Optional: clear one or all cache keys
export function clearCached(key) {
  if (key) {
    delete caches[key];
  } else {
    Object.keys(caches).forEach((k) => delete caches[k]);
  }
}
