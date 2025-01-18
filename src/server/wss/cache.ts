import type { Stack } from "@/server/api/utils";
import { logger } from "@/server/utils/logger";

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
    if (!isCacheValid()) {
      return null;
    }
    return cache?.data ?? null;
  } catch (error) {
    logger.error("Cache access error:", error);
    invalidateCache();
    return null;
  }
};

export const updateCachedStackList = (stackList: Stack[]) => {
  try {
    if (stackList.length > MAX_CACHE_SIZE) {
      logger.warn("Stack list exceeds maximum cache size");
      return;
    }

    cache = {
      data: stackList,
      timestamp: Date.now(),
    };
  } catch (error) {
    logger.error("Failed to update cache:", error);
    invalidateCache();
  }
};
