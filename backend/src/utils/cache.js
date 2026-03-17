import { getRedisClient } from "../config/redis.js";

const DEFAULT_DASHBOARD_TTL_SECONDS = Number(process.env.REDIS_DASHBOARD_CACHE_TTL || 300);

export const dashboardCacheKey = (userId) => `cache:dashboard:${userId}`;

export const getCachedJson = async (key) => {
  const redis = await getRedisClient();
  if (!redis) {
    return null;
  }

  const raw = await redis.get(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Redis JSON parse error:", error.message);
    return null;
  }
};

export const setCachedJson = async (key, value, ttlSeconds = DEFAULT_DASHBOARD_TTL_SECONDS) => {
  const redis = await getRedisClient();
  if (!redis) {
    return false;
  }

  await redis.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
  });

  return true;
};

export const invalidateDashboardCache = async (userId) => {
  if (!userId) {
    return;
  }

  const redis = await getRedisClient();
  if (!redis) {
    return;
  }

  await redis.del(dashboardCacheKey(String(userId)));
};
