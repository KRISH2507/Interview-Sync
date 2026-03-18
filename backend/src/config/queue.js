import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL;

let queueConnection;

export const getQueueConnection = () => {
  if (!redisUrl) {
    return null;
  }

  if (!queueConnection) {
    queueConnection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  return queueConnection;
};