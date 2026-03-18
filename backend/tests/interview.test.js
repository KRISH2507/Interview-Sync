import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import bcrypt from "bcrypt";

import User from "../src/models/User.js";
import Resume from "../src/models/Resume.js";
import InterviewRoom from "../src/models/InterviewRoom.js";
import {
  mockAiQueue,
  mockEmailService,
  mockInterviewAiService,
  mockRedis,
  resetMockRedis,
} from "./mocks/externalMocks.js";

jest.unstable_mockModule("../src/config/redis.js", () => ({
  isRedisConfigured: () => true,
  getRedisClient: async () => mockRedis,
}));

jest.unstable_mockModule("../src/services/emailService.js", () => ({
  sendOtpEmail: mockEmailService.sendOtpEmail,
}));

jest.unstable_mockModule("../src/queues/aiQueue.js", () => ({
  enqueueAiJob: mockAiQueue.enqueueAiJob,
  getAiJobStatus: mockAiQueue.getAiJobStatus,
  getAiQueueStats: jest.fn().mockResolvedValue({ waiting: 0, active: 0, failed: 0 }),
}));

jest.unstable_mockModule("../src/services/interviewAIService.js", () => ({
  generateInterviewQuestions: mockInterviewAiService.generateInterviewQuestions,
}));

const { default: app } = await import("../src/app.js");

const getCsrfToken = async (agent) => {
  const response = await agent.get("/api/auth/csrf-token");
  return response.body?.data?.csrfToken || response.body?.csrfToken;
};

const loginAsCandidate = async (agent, email = "candidate@test.com") => {
  const hashedPassword = await bcrypt.hash("secret123", 10);
  const user = await User.create({
    name: "Candidate",
    email,
    password: hashedPassword,
    role: "candidate",
    provider: "local",
  });

  const csrfToken = await getCsrfToken(agent);
  const loginResponse = await agent
    .post("/api/auth/login")
    .set("X-CSRF-Token", csrfToken)
    .send({ email, password: "secret123" });

  expect(loginResponse.status).toBe(200);
  return { user, csrfToken };
};

describe("Interview routes", () => {
  beforeEach(() => {
    resetMockRedis();
    jest.clearAllMocks();
  });

  it("blocks unauthenticated access to protected interview routes", async () => {
    const response = await request(app).get("/api/interview/rooms");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Not authorized");
  });

  it("returns interview rooms for authenticated user with standardized response", async () => {
    const agent = request.agent(app);
    const { user } = await loginAsCandidate(agent);

    await InterviewRoom.create({
      roomId: "room_test_123",
      candidateId: user._id,
      interviewerId: user._id,
      status: "scheduled",
    });

    const response = await agent.get("/api/interview/rooms");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Interview rooms fetched");
    expect(Array.isArray(response.body.data?.rooms)).toBe(true);
    expect(response.body.data?.pagination).toBeDefined();
  });

  it("queues async interview generation without real queue calls", async () => {
    const agent = request.agent(app);
    const { user, csrfToken } = await loginAsCandidate(agent, "queue@test.com");

    await Resume.create({
      user: user._id,
      rawText: "Experienced MERN developer with Node.js and React background.",
      score: 80,
      analysis: { skills: ["Node.js", "React"], experienceYears: 3, projects: [], strengths: [] },
    });

    const response = await agent
      .post("/api/interview/start-async")
      .set("X-CSRF-Token", csrfToken)
      .send({});

    expect(response.status).toBe(202);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Interview generation job queued");
    expect(response.body.data?.jobId).toBeTruthy();
    expect(mockAiQueue.enqueueAiJob).toHaveBeenCalledTimes(1);
  });
});
