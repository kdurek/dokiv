import type { Stack } from "@/server/utils";
import { logger } from "@/server/utils/logger";

class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly limit: number;

  constructor(limit: number) {
    this.limit = limit;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.limit) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.delete(key);
    this.cache.set(key, value);
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
}

const stackCache = new LRUCache<string, CacheEntry>(50);
const CACHE_KEY = "stackList";

interface CacheEntry {
  data: Stack[];
  timestamp: number;
}

const CACHE_TTL = 1000 * 60; // 1 minute
const MAX_CACHE_SIZE = 1000; // Maximum number of stacks to cache

let cache: CacheEntry | null = null;

export const invalidateCache = () => {
  cache = null;
};

export const isCacheValid = (): boolean => {
  if (!cache) return false;

  const isExpired = Date.now() - cache.timestamp > CACHE_TTL;
  const isTooLarge = cache.data.length > MAX_CACHE_SIZE;

  if (isExpired || isTooLarge) {
    invalidateCache();
    return false;
  }

  return true;
};

export const getCachedStackList = (): Stack[] | null => {
  try {
    const cached = stackCache.get(CACHE_KEY);
    if (!cached || !isCacheValid()) {
      return null;
    }
    return cached.data;
  } catch (error) {
    logger.error("Cache access error:", error);
    return null;
  }
};

export const updateCachedStackList = (stackList: Stack[]) => {
  try {
    if (stackList.length > MAX_CACHE_SIZE) {
      logger.warn("Stack list exceeds maximum cache size");
      return;
    }

    stackCache.set(CACHE_KEY, {
      data: stackList,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("Failed to update cache:", error);
  }
};
