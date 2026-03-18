import { Queue } from "bullmq";

import { getQueueConnection } from "../config/queue.js";

const AI_QUEUE_NAME = "ai-processing";

let aiQueue;

const getAiQueue = () => {
  const connection = getQueueConnection();
  if (!connection) {
    return null;
  }

  if (!aiQueue) {
    aiQueue = new Queue(AI_QUEUE_NAME, { connection });
  }

  return aiQueue;
};

export const getAiQueueStats = async () => {
  const queue = getAiQueue();
  if (!queue) {
    return {
      waiting: 0,
      active: 0,
      failed: 0,
    };
  }

  const [waiting, active, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getFailedCount(),
  ]);

  return { waiting, active, failed };
};

export const enqueueAiJob = async ({ name, payload }) => {
  const queue = getAiQueue();
  if (!queue) {
    return null;
  }

  return queue.add(name, payload, {
    attempts: Number(process.env.AI_JOB_RETRIES || 3),
    backoff: {
      type: "exponential",
      delay: Number(process.env.AI_JOB_RETRY_DELAY_MS || 2000),
    },
    removeOnComplete: {
      age: 60 * 60,
      count: 1000,
    },
    removeOnFail: {
      age: 24 * 60 * 60,
      count: 1000,
    },
  });
};

export const getAiJobStatus = async (jobId) => {
  const queue = getAiQueue();
  if (!queue) {
    return null;
  }

  const job = await queue.getJob(jobId);
  if (!job) {
    return null;
  }

  const state = await job.getState();

  return {
    id: job.id,
    name: job.name,
    state,
    attemptsMade: job.attemptsMade,
    progress: job.progress,
    returnvalue: job.returnvalue || null,
    failedReason: job.failedReason || null,
  };
};

export { AI_QUEUE_NAME };