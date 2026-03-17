import crypto from "crypto";

import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import { getRedisClient } from "../config/redis.js";
import { sendOtpEmail } from "../services/emailService.js";

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const OTP_TTL_SECONDS = 10 * 60;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 10;

const OTP_KEY_PREFIX = "auth:otp:register";
const OTP_ATTEMPT_PREFIX = "auth:otp:attempts";
const OTP_COOLDOWN_PREFIX = "auth:otp:cooldown";
const SESSION_PREFIX = "auth:session";
const TOKEN_BLACKLIST_PREFIX = "auth:blacklist";

const GOOGLE_OAUTH_SCOPES = ["email", "profile"];

const googleTokenClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

const parseOrigin = (value) => {
  try {
    return new URL(String(value || "").trim()).origin;
  } catch {
    return "";
  }
};

const getRequestProtocol = (req) =>
  String(req.headers["x-forwarded-proto"] || req.protocol || "http")
    .split(",")[0]
    .trim()
    .replace(/:$/, "");

const getRequestHost = (req) =>
  String(req.headers["x-forwarded-host"] || req.get("host") || "")
    .split(",")[0]
    .trim();

const getRequestOrigin = (req) => {
  const host = getRequestHost(req);
  if (!host) {
    return "";
  }

  return `${getRequestProtocol(req)}://${host}`;
};

const getConfiguredFrontendOrigins = () => {
  const fromList = String(process.env.FRONTEND_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const singleOrigin = String(process.env.FRONTEND_URL || "").trim();
  if (singleOrigin) {
    fromList.push(singleOrigin);
  }

  return [...new Set(fromList)];
};

const resolveFrontendOrigin = (req, preferredOrigin) => {
  const configuredOrigins = getConfiguredFrontendOrigins();
  const normalizedPreferred = String(preferredOrigin || "").trim();
  const requestOrigin = String(req.headers.origin || "").trim();
  const refererOrigin = parseOrigin(req.headers.referer);
  const accepts = (origin) => {
    if (!origin) {
      return false;
    }

    if (configuredOrigins.length === 0) {
      return true;
    }

    return configuredOrigins.includes(origin);
  };

  if (accepts(normalizedPreferred)) {
    return normalizedPreferred;
  }

  if (accepts(requestOrigin)) {
    return requestOrigin;
  }

  if (accepts(refererOrigin)) {
    return refererOrigin;
  }

  if (configuredOrigins.length > 0) {
    return configuredOrigins[0];
  }

  return normalizedPreferred || requestOrigin || refererOrigin;
};

const resolveGoogleRedirectUri = (req, preferredRedirectUri) => {
  const fromEnv = String(process.env.GOOGLE_REDIRECT_URI || "").trim();
  if (fromEnv) {
    return fromEnv;
  }

  const normalizedPreferred = String(preferredRedirectUri || "").trim();
  if (normalizedPreferred) {
    return normalizedPreferred;
  }

  const requestOrigin = getRequestOrigin(req);
  if (!requestOrigin) {
    return "";
  }

  return `${requestOrigin}/api/auth/google/callback`;
};

const buildFrontendAuthRedirect = (req, queryParams = {}, preferredOrigin) => {
  const frontendOrigin = resolveFrontendOrigin(req, preferredOrigin);
  if (!frontendOrigin) {
    return "";
  }

  const redirectUrl = new URL("/auth", frontendOrigin);
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== "") {
      redirectUrl.searchParams.set(key, String(value));
    }
  });

  return redirectUrl.toString();
};

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

      const rawErrorMessage = String(error?.message || "");
      const isEmailJsSecurityBlock =
        rawErrorMessage.includes("API access from non-browser environments") ||
        rawErrorMessage.includes("non-browser environments is currently disabled");

      return res.status(502).json({
        message: isEmailJsSecurityBlock
          ? "EmailJS is blocking server API access. Enable it in EmailJS dashboard > Account > Security."
          : "Failed to send OTP email",
        error: error.response?.data || error.message,
        hint: isEmailJsSecurityBlock
          ? "Enable 'API access from non-browser environments' and allow both localhost and deployed frontend origins in EmailJS security settings."
          : undefined,
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
    const ticket = await googleTokenClient.verifyIdToken({
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

export const startGoogleOAuth = async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
      return res.status(500).json({ message: "Google OAuth server configuration is incomplete" });
    }

    const preferredFrontendOrigin = String(req.query.frontend_origin || "").trim();
    const frontendOrigin = preferredFrontendOrigin || String(process.env.FRONTEND_URL || "").trim();
    const redirectUri = String(process.env.GOOGLE_REDIRECT_URI || "").trim();

    console.log("[auth/google] start route hit", {
      preferredFrontendOrigin,
      resolvedFrontendOrigin: frontendOrigin,
      requestOrigin: req.headers.origin,
      requestHost: req.get("host"),
    });

    console.log("[auth/google] redirect URI", { redirectUri });

    const oauthClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const statePayload = Buffer.from(JSON.stringify({ frontendOrigin, redirectUri }), "utf8").toString("base64url");

    const authUrl = oauthClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: GOOGLE_OAUTH_SCOPES,
      state: statePayload,
    });

    return res.redirect(authUrl);
  } catch (error) {
    console.error("Google OAuth start error:", error);
    return res.status(500).json({ message: "Failed to start Google OAuth" });
  }
};

export const googleOAuthCallback = async (req, res) => {
  const getStatePayload = () => {
    try {
      const rawState = String(req.query.state || "");
      if (!rawState) {
        return { frontendOrigin: "", redirectUri: "" };
      }

      const parsed = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8"));
      return {
        frontendOrigin: String(parsed?.frontendOrigin || "").trim(),
        redirectUri: String(parsed?.redirectUri || "").trim(),
      };
    } catch {
      return { frontendOrigin: "", redirectUri: "" };
    }
  };

  const statePayload = getStatePayload();

  const redirectWithError = (message) => {
    const fallbackFrontendUrl = String(process.env.FRONTEND_URL || "").trim();
    const frontendOrigin = statePayload.frontendOrigin || fallbackFrontendUrl;
    const redirectUrl = frontendOrigin
      ? `${frontendOrigin.replace(/\/$/, "")}/auth?google_error=${encodeURIComponent(message || "Google authentication failed")}`
      : "";

    if (redirectUrl) {
      return res.redirect(redirectUrl);
    }

    return res.status(401).json({ message: message || "Google authentication failed" });
  };

  try {
    const code = String(req.query.code || "").trim();
    if (!code) {
      return redirectWithError("Google callback did not return code");
    }

    const redirectUri = String(process.env.GOOGLE_REDIRECT_URI || statePayload.redirectUri || "").trim();
    if (!redirectUri) {
      return redirectWithError("Unable to resolve Google callback URI");
    }

    console.log("[auth/google/callback] callback hit", {
      hasCode: Boolean(code),
      redirectUri,
      resolvedFrontendOrigin: statePayload.frontendOrigin,
    });

    const oauthClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { tokens } = await oauthClient.getToken({
      code,
      redirect_uri: redirectUri,
    });
    if (!tokens?.access_token) {
      return redirectWithError("Google OAuth token exchange failed");
    }

    const profileResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
      timeout: 10000,
    });

    const profile = profileResponse?.data || {};
    const normalizedEmail = normalizeEmail(profile.email);
    if (!normalizedEmail) {
      return redirectWithError("Google account email not available");
    }

    const userName = String(profile.name || normalizedEmail.split("@")[0] || "Google User").trim();

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        name: userName,
        email: normalizedEmail,
        provider: "google",
        role: "candidate",
      });
    }

    const safeRole = normalizeUserRole(user.role);
    user.role = safeRole;

    const { token, jti } = issueToken(user._id, safeRole);
    await persistActiveSession(jti, user);

    const fallbackFrontendUrl = String(process.env.FRONTEND_URL || "").trim();
    const frontendOrigin = statePayload.frontendOrigin || fallbackFrontendUrl;
    const successRedirectUrl = frontendOrigin
      ? `${frontendOrigin.replace(/\/$/, "")}/auth?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(String(user._id))}&role=${encodeURIComponent(safeRole)}`
      : "";

    if (successRedirectUrl) {
      return res.redirect(successRedirectUrl);
    }

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: safeRole,
      },
    });
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return redirectWithError("Google authentication failed");
  }
};
