import pinoHttp from "pino-http";

import { getRedisClient } from "../config/redis.js";
import logger from "../utils/logger.js";

const SLOW_REQUEST_MS = Number(process.env.SLOW_REQUEST_THRESHOLD_MS || 500);
export const REQUEST_METRICS_KEY = "metrics:http:global";

const metricsKey = () => {
  const minute = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  return `metrics:http:${minute}`;
};

export const httpLogger = pinoHttp({
  logger,
  autoLogging: false,
  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} -> ${res.statusCode}`;
  },
  customErrorMessage(req, res, error) {
    return `${req.method} ${req.url} failed: ${error.message} (${res.statusCode})`;
  },
});

export const requestMetrics = async (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", async () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    const roundedDuration = Math.round(durationMs * 100) / 100;

    req.log.info(
      {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: roundedDuration,
      },
      "request.completed"
    );

    if (durationMs >= SLOW_REQUEST_MS) {
      req.log.warn(
        {
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: roundedDuration,
          thresholdMs: SLOW_REQUEST_MS,
        },
        "request.slow"
      );
    }

    const redis = await getRedisClient();
    if (!redis) {
      return;
    }

    const key = metricsKey();
    const pipeline = redis.multi();
    pipeline.hIncrBy(REQUEST_METRICS_KEY, "total", 1);
    if (durationMs >= SLOW_REQUEST_MS) {
      pipeline.hIncrBy(REQUEST_METRICS_KEY, "slow", 1);
    }
    pipeline.hIncrBy(key, "count", 1);
    pipeline.hIncrBy(key, `status:${res.statusCode}`, 1);
    pipeline.hIncrByFloat(key, "durationMsTotal", roundedDuration);
    pipeline.expire(key, 24 * 60 * 60);
    await pipeline.exec();
  });

  return next();
};