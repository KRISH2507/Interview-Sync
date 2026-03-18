import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import bcrypt from "bcrypt";

import User from "../src/models/User.js";
import {
  getRedisOtpByEmail,
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
  const token = response.body?.data?.csrfToken || response.body?.csrfToken;
  return token;
};

describe("Auth routes (cookie + csrf)", () => {
  beforeEach(() => {
    resetMockRedis();
    jest.clearAllMocks();
  });

  it("registers user via OTP and returns standardized response", async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);

    const payload = {
      name: "Krish",
      email: "krish@test.com",
      password: "secret123",
      role: "candidate",
    };

    const otpResponse = await agent
      .post("/api/auth/send-otp")
      .set("X-CSRF-Token", csrfToken)
      .send(payload);

    expect(otpResponse.status).toBe(200);
    expect(otpResponse.body).toMatchObject({
      success: true,
      message: "OTP sent successfully",
    });
    expect(mockEmailService.sendOtpEmail).toHaveBeenCalledTimes(1);

    const otpRecord = await getRedisOtpByEmail(payload.email);
    expect(otpRecord?.otp).toBeTruthy();

    const registerResponse = await agent
      .post("/api/auth/register")
      .set("X-CSRF-Token", csrfToken)
      .send({ email: payload.email, otp: otpRecord.otp });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.message).toBe("Registration successful");
    expect(registerResponse.body.data?.user?.email).toBe(payload.email);
    expect(registerResponse.body.data?.accessToken).toBeTruthy();

    const meResponse = await agent.get("/api/auth/me");
    expect(meResponse.status).toBe(200);
    expect(meResponse.body.success).toBe(true);
    expect(meResponse.body.data?.user?.email).toBe(payload.email);
  });

  it("logs in, refreshes token, and logs out with cookie persistence", async () => {
    const hashedPassword = await bcrypt.hash("secret123", 10);
    await User.create({
      name: "Login User",
      email: "login@test.com",
      password: hashedPassword,
      role: "candidate",
      provider: "local",
    });

    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);

    const loginResponse = await agent
      .post("/api/auth/login")
      .set("X-CSRF-Token", csrfToken)
      .send({ email: "login@test.com", password: "secret123" });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toMatchObject({
      success: true,
      message: "Login successful",
    });

    const refreshResponse = await agent
      .post("/api/auth/refresh-token")
      .set("X-CSRF-Token", csrfToken)
      .send({});

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.success).toBe(true);
    expect(refreshResponse.body.message).toBe("Access token refreshed");
    expect(refreshResponse.body.data?.accessToken).toBeTruthy();

    const logoutResponse = await agent
      .post("/api/auth/logout")
      .set("X-CSRF-Token", csrfToken)
      .send({});

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.success).toBe(true);

    const meAfterLogout = await agent.get("/api/auth/me");
    expect(meAfterLogout.status).toBe(401);
    expect(meAfterLogout.body.success).toBe(false);
  });

  it("blocks mutating auth route when CSRF token is missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "missing@csrf.com", password: "secret123" });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid CSRF token");
    expect(response.body.errors?.code).toBe("EBADCSRFTOKEN");
  });
});
