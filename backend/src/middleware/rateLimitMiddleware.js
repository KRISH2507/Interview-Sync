import { getRedisClient } from "../config/redis.js";

const getRequestIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.connection?.remoteAddress || "unknown";
};

export const createRedisRateLimiter = ({ prefix, windowSeconds, maxRequests, keyBuilder, message }) => {
  return async (req, res, next) => {
    try {
      const redis = await getRedisClient();
      if (!redis) {
        return next();
      }

      const identifier = keyBuilder ? keyBuilder(req) : getRequestIp(req);
      if (!identifier) {
        return next();
      }

      const key = `rate-limit:${prefix}:${identifier}`;
      const total = await redis.incr(key);

      if (total === 1) {
        await redis.expire(key, windowSeconds);
      }

      const ttl = await redis.ttl(key);
      res.setHeader("X-RateLimit-Limit", String(maxRequests));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(maxRequests - total, 0)));
      if (ttl > 0) {
        res.setHeader("X-RateLimit-Reset", String(ttl));
      }

      if (total > maxRequests) {
        return res.status(429).json({
          message,
        });
      }

      return next();
    } catch (error) {
      console.error("Redis rate limit error:", error.message);
      return next();
    }
  };
};
