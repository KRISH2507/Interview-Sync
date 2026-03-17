import { createClient } from "redis";

let redisClient;
let redisConnectPromise;

const redisUrl = process.env.REDIS_URL;

export const isRedisConfigured = () => Boolean(redisUrl);

export const getRedisClient = async () => {
  if (!redisUrl) {
    return null;
  }

  if (!redisClient) {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy(retries) {
          return Math.min(retries * 200, 2000);
        },
      },
    });

    redisClient.on("error", (error) => {
      console.error("Redis client error:", error.message);
    });

    redisConnectPromise = redisClient.connect().catch((error) => {
      console.error("Redis connection failed:", error.message);
      redisConnectPromise = null;
      redisClient = null;
      return null;
    });
  }

  if (redisConnectPromise) {
    await redisConnectPromise;
  }

  if (!redisClient?.isOpen) {
    return null;
  }

  return redisClient;
};
