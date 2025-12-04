// src/utils/simpleCache.js
const cache = new Map();

/**
 * Set key with TTL seconds
 * value can be any JSON-serializable object
 */
export const setToCache = (key, value, ttlSeconds = 8) => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  cache.set(key, { value, expiresAt });
};

/**
 * Get key if still valid
 */
export const getFromCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

/**
 * Delete cache key
 */
export const deleteCacheKey = (key) => {
  cache.delete(key);
};

/**
 * Clear all keys with prefix
 */
export const clearCachePrefix = (prefix) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
};
