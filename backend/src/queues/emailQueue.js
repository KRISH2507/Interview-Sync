import { Queue } from "bullmq";

import { getQueueConnection } from "../config/queue.js";

const EMAIL_QUEUE_NAME = "email-processing";

let emailQueue;

const getEmailQueue = () => {
  const connection = getQueueConnection();
  if (!connection) {
    return null;
  }

  if (!emailQueue) {
    emailQueue = new Queue(EMAIL_QUEUE_NAME, { connection });
  }

  return emailQueue;
};

export const getEmailQueueStats = async () => {
  const queue = getEmailQueue();
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

export const enqueueOtpEmailJob = async ({ name, email, otp }) => {
  const queue = getEmailQueue();
  if (!queue) {
    return null;
  }

  return queue.add(
    "send-otp-email",
    { name, email, otp },
    {
      attempts: Number(process.env.EMAIL_JOB_RETRIES || 3),
      backoff: {
        type: "exponential",
        delay: Number(process.env.EMAIL_JOB_RETRY_DELAY_MS || 2000),
      },
      removeOnComplete: {
        age: 60 * 60,
        count: 1000,
      },
      removeOnFail: {
        age: 24 * 60 * 60,
        count: 1000,
      },
    }
  );
};

export { EMAIL_QUEUE_NAME };