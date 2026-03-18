import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import bcrypt from "bcrypt";

import User from "../src/models/User.js";
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

describe("Dashboard routes", () => {
  beforeEach(() => {
    resetMockRedis();
    jest.clearAllMocks();
  });

  it("denies dashboard access without authentication", async () => {
    const response = await request(app).get("/api/dashboard");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Not authorized");
  });

  it("returns standardized dashboard response for authenticated user", async () => {
    const password = await bcrypt.hash("secret123", 10);
    const user = await User.create({
      name: "Dash User",
      email: "dash@test.com",
      password,
      role: "candidate",
      provider: "local",
    });

    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);

    const loginResponse = await agent
      .post("/api/auth/login")
      .set("X-CSRF-Token", csrfToken)
      .send({ email: "dash@test.com", password: "secret123" });

    expect(loginResponse.status).toBe(200);

    const response = await agent.get("/api/dashboard");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Dashboard fetched");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.user?.email).toBe(user.email);
    expect(response.body.data).toHaveProperty("interviewHistory");
    expect(response.body.data).toHaveProperty("codingHistory");
  });
});
