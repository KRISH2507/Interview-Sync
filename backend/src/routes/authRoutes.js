import express from "express";
import {
  sendRegistrationOtp,
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  revokeSession,
  getMySessions,
  getMe,
  startGoogleOAuth,
  googleOAuthCallback,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { createRedisRateLimiter } from "../middleware/rateLimitMiddleware.js";
import { issueCsrfToken } from "../middleware/csrfMiddleware.js";
import { sendSuccess } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const otpIpLimiter = createRedisRateLimiter({
  prefix: "auth-send-otp-ip",
  windowSeconds: 60,
  maxRequests: 100,
  message: "Too many OTP requests from this IP. Please try again later.",
});

const otpEmailLimiter = createRedisRateLimiter({
  prefix: "auth-send-otp-email",
  windowSeconds: 60,
  maxRequests: 100,
  keyBuilder: (req) => normalizeEmail(req.body?.email),
  message: "Too many OTP requests for this email. Please try again later.",
});

const loginIpLimiter = createRedisRateLimiter({
  prefix: "auth-login-ip",
  windowSeconds: 15 * 60,
  maxRequests: 20,
  message: "Too many login attempts from this IP. Please try again later.",
});

const loginEmailLimiter = createRedisRateLimiter({
  prefix: "auth-login-email",
  windowSeconds: 15 * 60,
  maxRequests: 10,
  keyBuilder: (req) => normalizeEmail(req.body?.email),
  message: "Too many login attempts for this email. Please try again later.",
});

const verifyIpLimiter = createRedisRateLimiter({
  prefix: "auth-register-ip",
  windowSeconds: 15 * 60,
  maxRequests: 20,
  message: "Too many OTP verification attempts from this IP. Please try again later.",
});

const verifyEmailLimiter = createRedisRateLimiter({
  prefix: "auth-register-email",
  windowSeconds: 10 * 60,
  maxRequests: 10,
  keyBuilder: (req) => normalizeEmail(req.body?.email),
  message: "Too many OTP verification attempts for this email. Please try again later.",
});

router.post("/send-otp", otpIpLimiter, otpEmailLimiter, asyncHandler(sendRegistrationOtp));
router.post("/register", verifyIpLimiter, verifyEmailLimiter, asyncHandler(register));
router.post("/login", loginIpLimiter, loginEmailLimiter, asyncHandler(login));
router.get("/csrf-token", (req, res) => {
  const token = issueCsrfToken(req, res);
  return sendSuccess(res, 200, "CSRF token generated", { csrfToken: token }, { csrfToken: token });
});
router.post("/refresh-token", asyncHandler(refreshToken));
router.get("/google", asyncHandler(startGoogleOAuth));
router.get("/google/callback", asyncHandler(googleOAuthCallback));
router.post("/logout", protect, asyncHandler(logout));
router.post("/logout-all", protect, asyncHandler(logoutAll));
router.post("/revoke-session/:sessionId", protect, asyncHandler(revokeSession));
router.get("/sessions", protect, asyncHandler(getMySessions));
router.get("/me", protect, asyncHandler(getMe));

export default router;
