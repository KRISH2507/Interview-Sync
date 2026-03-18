import { Worker } from "bullmq";

import { getQueueConnection } from "../config/queue.js";
import { EMAIL_QUEUE_NAME } from "../queues/emailQueue.js";
import { sendOtpEmailNow } from "../services/emailService.js";
import logger from "../utils/logger.js";

let emailWorker;

export const startEmailWorker = () => {
  const connection = getQueueConnection();
  if (!connection) {
    return null;
  }

  if (emailWorker) {
    return emailWorker;
  }

  emailWorker = new Worker(
    EMAIL_QUEUE_NAME,
    async (job) => {
      if (job.name === "send-otp-email") {
        await sendOtpEmailNow(job.data);
        return { sent: true, sentAt: new Date().toISOString() };
      }

      throw new Error(`Unsupported email job: ${job.name}`);
    },
    {
      connection,
      concurrency: Number(process.env.EMAIL_WORKER_CONCURRENCY || 5),
    }
  );

  emailWorker.on("completed", (job) => {
    logger.info({ jobId: job.id, name: job.name }, "email_job.completed");
  });

  emailWorker.on("failed", (job, error) => {
    logger.error(
      { jobId: job?.id, name: job?.name, message: error.message },
      "email_job.failed"
    );
  });

  return emailWorker;
};