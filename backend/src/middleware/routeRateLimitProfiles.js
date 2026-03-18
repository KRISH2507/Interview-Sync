import { createRedisRateLimiter } from "./rateLimitMiddleware.js";

export const publicRouteLimiter = createRedisRateLimiter({
  prefix: "public-routes",
  windowSeconds: 60,
  maxRequests: 300,
  message: "Too many requests. Please try again shortly.",
});

export const authRouteLimiter = createRedisRateLimiter({
  prefix: "auth-routes",
  windowSeconds: 60,
  maxRequests: 120,
  message: "Too many authentication requests. Please try again later.",
});

export const aiRouteLimiter = createRedisRateLimiter({
  prefix: "ai-routes",
  windowSeconds: 60,
  maxRequests: 30,
  message: "AI request limit exceeded. Please retry in a minute.",
});