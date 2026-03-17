import express from "express";
import {
  sendRegistrationOtp,
  register,
  login,
  logout,
  getMe,
  googleLogin,
  startGoogleOAuth,
  googleOAuthCallback,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { createRedisRateLimiter } from "../middleware/rateLimitMiddleware.js";

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

router.post("/send-otp", otpIpLimiter, otpEmailLimiter, sendRegistrationOtp);
router.post("/register", verifyIpLimiter, verifyEmailLimiter, register);
router.post("/login", loginIpLimiter, loginEmailLimiter, login);
router.get("/google", startGoogleOAuth);
router.get("/google/callback", googleOAuthCallback);
router.post("/google", googleLogin);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
