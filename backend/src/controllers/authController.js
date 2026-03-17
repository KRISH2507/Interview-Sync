import crypto from "crypto";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import { getRedisClient } from "../config/redis.js";
import { sendOtpEmail } from "../services/emailService.js";

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const OTP_TTL_SECONDS = 10 * 60;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

const OTP_KEY_PREFIX = "auth:otp:register";
const OTP_ATTEMPT_PREFIX = "auth:otp:attempts";
const OTP_COOLDOWN_PREFIX = "auth:otp:cooldown";
const SESSION_PREFIX = "auth:session";
const TOKEN_BLACKLIST_PREFIX = "auth:blacklist";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizeUserRole = (role) => {
  const normalized = String(role || "candidate").trim().toLowerCase();
  return normalized === "recruiter" ? "recruiter" : "candidate";
};

const buildOtpKey = (email) => `${OTP_KEY_PREFIX}:${email}`;
const buildOtpAttemptKey = (email) => `${OTP_ATTEMPT_PREFIX}:${email}`;
const buildOtpCooldownKey = (email) => `${OTP_COOLDOWN_PREFIX}:${email}`;
const buildSessionKey = (jti) => `${SESSION_PREFIX}:${jti}`;
const buildTokenBlacklistKey = (jti) => `${TOKEN_BLACKLIST_PREFIX}:${jti}`;

const getTokenLifetimeSeconds = (decodedToken) => {
  if (!decodedToken?.exp) {
    return TOKEN_TTL_SECONDS;
  }

  return Math.max(decodedToken.exp - Math.floor(Date.now() / 1000), 1);
};

const issueToken = (id, role = "candidate") => {
  const safeRole = normalizeUserRole(role);
  const jti = crypto.randomUUID();
  const token = jwt.sign({ id, role: safeRole, jti }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { token, jti };
};

const persistActiveSession = async (jti, user) => {
  const redis = await getRedisClient();
  if (!redis || !jti) {
    return;
  }

  await redis.set(
    buildSessionKey(jti),
    JSON.stringify({
      userId: String(user._id),
      role: user.role,
    }),
    { EX: TOKEN_TTL_SECONDS }
  );
};

const sendAuthResponse = async (res, user, statusCode = 200) => {
  const safeRole = normalizeUserRole(user.role);
  user.role = safeRole;
  const { token, jti } = issueToken(user._id, safeRole);
  await persistActiveSession(jti, user);

  return res.status(statusCode).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const getBearerToken = (req) => {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }

  return "";
};

const validateRegistrationPayload = ({ name, email, password }) => {
  if (!name || !String(name).trim()) {
    return "Name is required";
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return "Email is required";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return "A valid email is required";
  }

  if (!password || String(password).length < 6) {
    return "Password must be at least 6 characters";
  }

  return "";
};

export const sendRegistrationOtp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const requestId = crypto.randomUUID();
    const requestIp = req.headers["x-forwarded-for"] || req.ip || "unknown";
    const normalizedRole = normalizeUserRole(role);

    console.log("[auth/send-otp] request", {
      requestId,
      email: normalizeEmail(email),
      role: normalizedRole,
      ip: requestIp,
    });

    const validationMessage = validateRegistrationPayload({ name, email, password });
    if (validationMessage) {
      console.warn("[auth/send-otp] validation failed", {
        requestId,
        message: validationMessage,
      });
      return res.status(400).json({ message: validationMessage });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const redis = await getRedisClient();
    if (!redis) {
      return res.status(503).json({ message: "OTP service is temporarily unavailable" });
    }

    const cooldownKey = buildOtpCooldownKey(normalizedEmail);
    const cooldownSet = await redis.set(cooldownKey, "1", {
      EX: OTP_RESEND_COOLDOWN_SECONDS,
      NX: true,
    });

    if (!cooldownSet) {
      const retryAfter = await redis.ttl(cooldownKey);
      return res.status(429).json({
        message: `Please wait ${Math.max(retryAfter, 1)} seconds before requesting another OTP`,
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const passwordHash = await bcrypt.hash(String(password), 10);
    const otpPayload = {
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
      otp,
    };

    await redis.set(buildOtpKey(normalizedEmail), JSON.stringify(otpPayload), {
      EX: OTP_TTL_SECONDS,
    });
    await redis.del(buildOtpAttemptKey(normalizedEmail));

    try {
      await sendOtpEmail({
        name: otpPayload.name,
        email: normalizedEmail,
        otp,
      });
    } catch (error) {
      console.error("[auth/send-otp] email send failed", {
        requestId,
        email: normalizedEmail,
        error: error.response?.data || error.message || String(error),
      });
      await redis.del(buildOtpKey(normalizedEmail));
      await redis.del(cooldownKey);
      return res.status(500).json({
        message: "Failed to send OTP email",
        error: error.response?.data || error.message,
      });
    }

    console.log("[auth/send-otp] OTP sent", {
      requestId,
      email: normalizedEmail,
    });

    return res.json({
      message: "OTP sent successfully",
      expiresIn: OTP_TTL_SECONDS,
      resendAfter: OTP_RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    console.error("[auth/send-otp] unexpected error", {
      error: error?.message || String(error),
      stack: error?.stack,
    });
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const register = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!otp || String(otp).trim().length !== 6) {
      return res.status(400).json({ message: "A valid 6-digit OTP is required" });
    }

    const redis = await getRedisClient();
    if (!redis) {
      return res.status(503).json({ message: "OTP service is temporarily unavailable" });
    }

    const storedOtpPayload = await redis.get(buildOtpKey(normalizedEmail));
    if (!storedOtpPayload) {
      return res.status(400).json({ message: "OTP expired or not found. Please request a new OTP." });
    }

    const attemptKey = buildOtpAttemptKey(normalizedEmail);
    const attempts = await redis.incr(attemptKey);
    if (attempts === 1) {
      await redis.expire(attemptKey, OTP_TTL_SECONDS);
    }

    if (attempts > OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ message: "Too many invalid OTP attempts. Please request a new OTP." });
    }

    const payload = JSON.parse(storedOtpPayload);
    if (String(payload.otp) !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      await redis.del(buildOtpKey(normalizedEmail));
      await redis.del(attemptKey);
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.passwordHash,
      role: payload.role,
      provider: "local",
    });

    await redis.del(buildOtpKey(normalizedEmail));
    await redis.del(attemptKey);
    await redis.del(buildOtpCooldownKey(normalizedEmail));

    return sendAuthResponse(res, user, 201);
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.provider !== "local") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    return sendAuthResponse(res, user);
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

export const logout = async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.json({ message: "Logged out" });
    }

    const decodedToken = jwt.decode(token);
    const redis = await getRedisClient();
    if (redis && decodedToken?.jti) {
      const ttl = getTokenLifetimeSeconds(decodedToken);
      await redis.set(buildTokenBlacklistKey(decodedToken.jti), "1", { EX: ttl });
      await redis.del(buildSessionKey(decodedToken.jti));
    }

    return res.json({ message: "Logged out" });
  } catch (error) {
    console.error("logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.json(user);
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const googleLogin = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();
    const normalizedEmail = normalizeEmail(email);

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name,
        email: normalizedEmail,
        provider: "google",
        role: "candidate",
      });
    }

    return sendAuthResponse(res, user);
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(401).json({ message: "Google authentication failed" });
  }
};
