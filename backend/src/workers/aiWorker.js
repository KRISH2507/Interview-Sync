import { Worker } from "bullmq";

import { getQueueConnection } from "../config/queue.js";
import { AI_QUEUE_NAME } from "../queues/aiQueue.js";
import { generateInterviewQuestions } from "../services/interviewAIService.js";
import logger from "../utils/logger.js";

let aiWorker;

export const startAiWorker = () => {
  const connection = getQueueConnection();
  if (!connection) {
    return null;
  }

  if (aiWorker) {
    return aiWorker;
  }

  aiWorker = new Worker(
    AI_QUEUE_NAME,
    async (job) => {
      if (job.name === "generate-interview-questions") {
        const questions = await generateInterviewQuestions(job.data.resumeText);
        return {
          questions,
          generatedAt: new Date().toISOString(),
        };
      }

      throw new Error(`Unsupported AI job: ${job.name}`);
    },
    {
      connection,
      concurrency: Number(process.env.AI_WORKER_CONCURRENCY || 4),
    }
  );

  aiWorker.on("completed", (job) => {
    logger.info({ jobId: job.id, name: job.name }, "ai_job.completed");
  });

  aiWorker.on("failed", (job, error) => {
    logger.error(
      { jobId: job?.id, name: job?.name, message: error.message },
      "ai_job.failed"
    );
  });

  return aiWorker;
};