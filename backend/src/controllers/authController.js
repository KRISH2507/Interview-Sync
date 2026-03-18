import axios from "axios";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import { getRedisClient } from "../config/redis.js";
import { sendOtpEmail } from "../services/emailService.js";
import {
  clearAuthCookies,
  createSessionTokens,
  listActiveSessions,
  readRefreshToken,
  revokeAllUserSessions,
  revokeRefreshSessionByToken,
  revokeSessionById,
  setAuthCookies,
  rotateRefreshToken,
} from "../services/tokenService.js";
import { sendError, sendSuccess } from "../utils/response.js";

const OTP_TTL_SECONDS = 10 * 60;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 10;

const OTP_KEY_PREFIX = "auth:otp:register";
const OTP_ATTEMPT_PREFIX = "auth:otp:attempts";
const OTP_COOLDOWN_PREFIX = "auth:otp:cooldown";

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

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: normalizeUserRole(user.role),
});

const sendAuthPayload = async (req, res, user, message, statusCode = 200) => {
  const tokens = await createSessionTokens({ user, req });
  const safeUser = serializeUser(user);
  setAuthCookies(req, res, tokens);

  return sendSuccess(res, statusCode, message, {
    user: safeUser,
    accessToken: tokens.accessToken,
    sessionId: tokens.sessionId,
  }, {
    token: tokens.accessToken,
    user: safeUser,
  });
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
    const normalizedRole = normalizeUserRole(role);

    const validationMessage = validateRegistrationPayload({ name, email, password });
    if (validationMessage) {
      return sendError(res, 400, validationMessage);
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      return sendError(res, 400, "User already exists");
    }

    const redis = await getRedisClient();
    if (!redis) {
      return sendError(res, 503, "OTP service is temporarily unavailable");
    }

    const cooldownKey = buildOtpCooldownKey(normalizedEmail);
    const cooldownSet = await redis.set(cooldownKey, "1", {
      EX: OTP_RESEND_COOLDOWN_SECONDS,
      NX: true,
    });

    if (!cooldownSet) {
      const retryAfter = await redis.ttl(cooldownKey);
      return sendError(
        res,
        429,
        `Please wait ${Math.max(retryAfter, 1)} seconds before requesting another OTP`
      );
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
      await redis.del(buildOtpKey(normalizedEmail));
      await redis.del(cooldownKey);

      const rawErrorMessage = String(error?.message || "");
      const isEmailJsSecurityBlock =
        rawErrorMessage.includes("API access from non-browser environments") ||
        rawErrorMessage.includes("non-browser environments is currently disabled");

      return sendError(
        res,
        502,
        isEmailJsSecurityBlock
          ? "EmailJS is blocking server API access. Enable it in EmailJS dashboard > Account > Security."
          : "Failed to send OTP email",
        {
          error: error.response?.data || error.message,
          hint: isEmailJsSecurityBlock
            ? "Enable API access from non-browser environments and allow localhost/deployed frontend origins in EmailJS security settings."
            : undefined,
        }
      );
    }

    return sendSuccess(
      res,
      200,
      "OTP sent successfully",
      {
        expiresIn: OTP_TTL_SECONDS,
        resendAfter: OTP_RESEND_COOLDOWN_SECONDS,
      },
      {
        expiresIn: OTP_TTL_SECONDS,
        resendAfter: OTP_RESEND_COOLDOWN_SECONDS,
      }
    );
  } catch (error) {
    return sendError(res, 500, "Failed to send OTP");
  }
};

export const register = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return sendError(res, 400, "Email is required");
    }

    if (!otp || String(otp).trim().length !== 6) {
      return sendError(res, 400, "A valid 6-digit OTP is required");
    }

    const redis = await getRedisClient();
    if (!redis) {
      return sendError(res, 503, "OTP service is temporarily unavailable");
    }

    const storedOtpPayload = await redis.get(buildOtpKey(normalizedEmail));
    if (!storedOtpPayload) {
      return sendError(res, 400, "OTP expired or not found. Please request a new OTP.");
    }

    const attemptKey = buildOtpAttemptKey(normalizedEmail);
    const attempts = await redis.incr(attemptKey);
    if (attempts === 1) {
      await redis.expire(attemptKey, OTP_TTL_SECONDS);
    }

    if (attempts > OTP_MAX_ATTEMPTS) {
      return sendError(res, 429, "Too many invalid OTP attempts. Please request a new OTP.");
    }

    const payload = JSON.parse(storedOtpPayload);
    if (String(payload.otp) !== String(otp).trim()) {
      return sendError(res, 400, "Invalid OTP");
    }

    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      await redis.del(buildOtpKey(normalizedEmail));
      await redis.del(attemptKey);
      return sendError(res, 400, "User already exists");
    }

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.passwordHash,
      role: normalizeUserRole(payload.role),
      provider: "local",
    });

    await redis.del(buildOtpKey(normalizedEmail));
    await redis.del(attemptKey);
    await redis.del(buildOtpCooldownKey(normalizedEmail));

    return sendAuthPayload(req, res, user, "Registration successful", 201);
  } catch {
    return sendError(res, 500, "Registration failed");
  }
};

export const login = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!normalizedEmail || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.provider !== "local") {
      return sendError(res, 400, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 400, "Invalid credentials");
    }

    return sendAuthPayload(req, res, user, "Login successful");
  } catch {
    return sendError(res, 500, "Login failed");
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refresh = readRefreshToken(req);
    if (!refresh) {
      return sendError(res, 401, "Refresh token is required");
    }

    const rotated = await rotateRefreshToken({ refreshToken: refresh, req });
    setAuthCookies(req, res, rotated);

    return sendSuccess(
      res,
      200,
      "Access token refreshed",
      {
        accessToken: rotated.accessToken,
        sessionId: rotated.sessionId,
      },
      {
        token: rotated.accessToken,
      }
    );
  } catch {
    return sendError(res, 401, "Invalid or expired refresh token");
  }
};

export const logout = async (req, res) => {
  try {
    const refresh = readRefreshToken(req);
    if (refresh) {
      await revokeRefreshSessionByToken(refresh, "logout");
    }

    clearAuthCookies(req, res);
    return sendSuccess(res, 200, "Logged out");
  } catch {
    return sendError(res, 500, "Logout failed");
  }
};

export const logoutAll = async (req, res) => {
  try {
    await revokeAllUserSessions(req.user.id, "logout_all");
    clearAuthCookies(req, res);
    return sendSuccess(res, 200, "Logged out from all sessions");
  } catch {
    return sendError(res, 500, "Logout all failed");
  }
};

export const revokeSession = async (req, res) => {
  try {
    const sessionId = String(req.params.sessionId || "").trim();
    if (!sessionId) {
      return sendError(res, 400, "sessionId is required");
    }

    const revoked = await revokeSessionById({
      userId: req.user.id,
      sessionId,
      reason: "manual_revoke",
    });

    if (!revoked) {
      return sendError(res, 404, "Session not found");
    }

    return sendSuccess(res, 200, "Session revoked", { sessionId });
  } catch {
    return sendError(res, 500, "Failed to revoke session");
  }
};

export const getMySessions = async (req, res) => {
  try {
    const sessions = await listActiveSessions(req.user.id);
    return sendSuccess(res, 200, "Active sessions fetched", { sessions });
  } catch {
    return sendError(res, 500, "Failed to fetch sessions");
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "Profile fetched", { user: serializeUser(user) });
  } catch {
    return sendError(res, 500, "Failed to fetch user");
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

    return sendAuthPayload(req, res, user, "Google login successful");
  } catch {
    return sendError(res, 401, "Google authentication failed");
  }
};

export const startGoogleOAuth = async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return sendError(res, 500, "Google OAuth server configuration is incomplete");
    }

    const preferredFrontendOrigin = String(req.query.frontend_origin || "").trim();
    const redirectUri = resolveGoogleRedirectUri(req, String(req.query.redirect_uri || "").trim());

    if (!redirectUri) {
      return sendError(res, 500, "Unable to resolve Google redirect URI");
    }

    const oauthClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const statePayload = Buffer.from(
      JSON.stringify({ frontendOrigin: preferredFrontendOrigin, redirectUri }),
      "utf8"
    ).toString("base64url");

    const authUrl = oauthClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: GOOGLE_OAUTH_SCOPES,
      state: statePayload,
    });

    return res.redirect(authUrl);
  } catch {
    return sendError(res, 500, "Failed to start Google OAuth");
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
    const errorRedirect = buildFrontendAuthRedirect(
      req,
      { google_error: message || "Google authentication failed" },
      statePayload.frontendOrigin
    );

    if (errorRedirect) {
      return res.redirect(errorRedirect);
    }

    return sendError(res, 401, message || "Google authentication failed");
  };

  try {
    const code = String(req.query.code || "").trim();
    if (!code) {
      return redirectWithError("Google callback did not return code");
    }

    const redirectUri = resolveGoogleRedirectUri(req, statePayload.redirectUri);
    if (!redirectUri) {
      return redirectWithError("Unable to resolve Google callback URI");
    }

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

    const tokensPayload = await createSessionTokens({ user, req });
    const safeRole = normalizeUserRole(user.role);
    setAuthCookies(req, res, tokensPayload);

    const successRedirectUrl = buildFrontendAuthRedirect(
      req,
      {
        token: tokensPayload.accessToken,
        userId: String(user._id),
        role: safeRole,
      },
      statePayload.frontendOrigin
    );

    if (successRedirectUrl) {
      return res.redirect(successRedirectUrl);
    }

    const safeUser = serializeUser(user);
    return sendSuccess(
      res,
      200,
      "Google login successful",
      {
        user: safeUser,
        accessToken: tokensPayload.accessToken,
        sessionId: tokensPayload.sessionId,
      },
      {
        token: tokensPayload.accessToken,
        user: safeUser,
      }
    );
  } catch {
    return redirectWithError("Google authentication failed");
  }
};
