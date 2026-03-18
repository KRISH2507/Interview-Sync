import crypto from "crypto";

import { getRedisClient } from "../config/redis.js";

const CACHE_PREFIX = "cache:v1";
export const CACHE_METRICS_KEY = "metrics:cache:global";

export const CACHE_TTL = {
  dashboard: Number(process.env.REDIS_DASHBOARD_CACHE_TTL || 300),
  interviewQuestions: Number(process.env.REDIS_INTERVIEW_QUESTION_CACHE_TTL || 900),
  aiResponse: Number(process.env.REDIS_AI_RESPONSE_CACHE_TTL || 1800),
};

const cacheKey = (...parts) => `${CACHE_PREFIX}:${parts.map((part) => String(part)).join(":")}`;

export const cacheKeys = {
  dashboard: (userId, page = 1, limit = 20) =>
    cacheKey("dashboard", String(userId), `page:${page}`, `limit:${limit}`),
  interviewQuestions: (resumeHash) => cacheKey("interview-questions", resumeHash),
  aiResponse: (scope, contentHash) => cacheKey("ai", scope, contentHash),
};

export const hashCacheInput = (value) =>
  crypto.createHash("sha256").update(String(value || "")).digest("hex");

export const getCachedJson = async (key) => {
  const redis = await getRedisClient();
  if (!redis) {
    return null;
  }

  const raw = await redis.get(key);
  if (!raw) {
    await redis.hIncrBy(CACHE_METRICS_KEY, "miss", 1);
    return null;
  }

  await redis.hIncrBy(CACHE_METRICS_KEY, "hit", 1);

  try {
    return JSON.parse(raw);
  } catch {
    await redis.del(key);
    return null;
  }
};

export const setCachedJson = async (key, value, ttlSeconds) => {
  const redis = await getRedisClient();
  if (!redis) {
    return false;
  }

  await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  return true;
};

export const readThroughCache = async ({
  key,
  ttlSeconds,
  fetcher,
}) => {
  const cached = await getCachedJson(key);
  if (cached !== null) {
    return { data: cached, hit: true };
  }

  const freshData = await fetcher();
  await setCachedJson(key, freshData, ttlSeconds);
  return { data: freshData, hit: false };
};

const invalidateByPrefix = async (prefix) => {
  const redis = await getRedisClient();
  if (!redis) {
    return 0;
  }

  const pattern = `${prefix}*`;
  let cursor = 0;
  let deletedCount = 0;

  do {
    const result = await redis.scan(cursor, {
      MATCH: pattern,
      COUNT: 100,
    });

    cursor = Number(result.cursor || 0);
    const keys = result.keys || [];

    if (keys.length > 0) {
      deletedCount += await redis.del(keys);
    }
  } while (cursor !== 0);

  return deletedCount;
};

export const invalidateDashboardCache = async (userId) => {
  if (!userId) {
    return 0;
  }

  const prefix = cacheKey("dashboard", String(userId), "");
  return invalidateByPrefix(prefix);
};

export const invalidateAiResponseCache = async (scope) => {
  const prefix = cacheKey("ai", scope, "");
  return invalidateByPrefix(prefix);
};
