import { getRedisClient } from "../config/redis.js";
import { getAiQueueStats } from "../queues/aiQueue.js";
import { getEmailQueueStats } from "../queues/emailQueue.js";
import { REQUEST_METRICS_KEY } from "../middleware/requestMetricsMiddleware.js";
import { CACHE_METRICS_KEY } from "../utils/cache.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

const toNumber = (value) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseRedisMemoryInfo = (infoText) => {
  const lines = String(infoText || "").split("\n");
  const map = new Map();

  for (const line of lines) {
    if (!line || line.startsWith("#") || !line.includes(":")) {
      continue;
    }

    const [key, value] = line.trim().split(":", 2);
    map.set(key, value);
  }

  return {
    usedMemoryBytes: toNumber(map.get("used_memory")),
    usedMemoryHuman: String(map.get("used_memory_human") || "n/a"),
    usedMemoryPeakHuman: String(map.get("used_memory_peak_human") || "n/a"),
  };
};

export const getAdminMetrics = async (_req, res) => {
  try {
    const redis = await getRedisClient();

    let cacheHit = 0;
    let cacheMiss = 0;
    let totalRequests = 0;
    let slowRequests = 0;
    let redisMemory = {
      usedMemoryBytes: 0,
      usedMemoryHuman: "n/a",
      usedMemoryPeakHuman: "n/a",
    };

    if (redis) {
      const [cacheMetrics, requestMetrics, memoryInfo, aiQueueStats, emailQueueStats] = await Promise.all([
        redis.hGetAll(CACHE_METRICS_KEY),
        redis.hGetAll(REQUEST_METRICS_KEY),
        redis.info("memory"),
        getAiQueueStats(),
        getEmailQueueStats(),
      ]);

      cacheHit = toNumber(cacheMetrics.hit);
      cacheMiss = toNumber(cacheMetrics.miss);
      totalRequests = toNumber(requestMetrics.total);
      slowRequests = toNumber(requestMetrics.slow);
      redisMemory = parseRedisMemoryInfo(memoryInfo);

      const cacheTotal = cacheHit + cacheMiss;
      const cacheHitRatio = cacheTotal > 0 ? Number((cacheHit / cacheTotal).toFixed(4)) : 0;

      return successResponse(res, {
        cache: {
          hit: cacheHit,
          miss: cacheMiss,
          hitRatio: cacheHitRatio,
        },
        redis: {
          memory: redisMemory,
        },
        queues: {
          ai: aiQueueStats,
          email: emailQueueStats,
          totals: {
            waiting: aiQueueStats.waiting + emailQueueStats.waiting,
            active: aiQueueStats.active + emailQueueStats.active,
            failed: aiQueueStats.failed + emailQueueStats.failed,
          },
        },
        requests: {
          total: totalRequests,
          slowOver500ms: slowRequests,
        },
      }, "Admin metrics fetched", 200);
    }

    const [aiQueueStats, emailQueueStats] = await Promise.all([
      getAiQueueStats(),
      getEmailQueueStats(),
    ]);

    return successResponse(res, {
      cache: {
        hit: cacheHit,
        miss: cacheMiss,
        hitRatio: 0,
      },
      redis: {
        memory: redisMemory,
      },
      queues: {
        ai: aiQueueStats,
        email: emailQueueStats,
        totals: {
          waiting: aiQueueStats.waiting + emailQueueStats.waiting,
          active: aiQueueStats.active + emailQueueStats.active,
          failed: aiQueueStats.failed + emailQueueStats.failed,
        },
      },
      requests: {
        total: totalRequests,
        slowOver500ms: slowRequests,
      },
    }, "Admin metrics fetched", 200);
  } catch (error) {
    return errorResponse(res, "Failed to fetch admin metrics", 500, {
      error: error.message,
    });
  }
};
