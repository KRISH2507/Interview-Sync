import crypto from "crypto";

import jwt from "jsonwebtoken";

import AuthSession from "../models/AuthSession.js";

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || "7d";
const ACCESS_COOKIE_NAME = process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken";
const REFRESH_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";
const ACCESS_COOKIE_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const COOKIE_DOMAIN = String(process.env.AUTH_COOKIE_DOMAIN || "").trim() || undefined;
const SHOULD_USE_SECURE_COOKIES =
  String(process.env.AUTH_COOKIE_SECURE || "true").trim().toLowerCase() === "true";
const COOKIE_SAME_SITE = SHOULD_USE_SECURE_COOKIES ? "none" : "lax";

const getJwtSecret = () => {
  const secret = String(process.env.JWT_SECRET || "").trim();
  if (!secret) {
    throw new Error("JWT secret is missing");
  }
  return secret;
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token || "")).digest("hex");

const normalizeUserRole = (role) => {
  const normalized = String(role || "candidate").trim().toLowerCase();
  return normalized === "recruiter" ? "recruiter" : "candidate";
};

const getRequestIp = (req) =>
  String(req.headers["x-forwarded-for"] || req.ip || "")
    .split(",")[0]
    .trim();

const getRequestUserAgent = (req) => String(req.headers["user-agent"] || "").trim();

const isExpiredSession = (session) => {
  if (!session?.expiresAt) {
    return true;
  }
  return new Date(session.expiresAt).getTime() <= Date.now();
};

const signAccessToken = ({ userId, role, sessionId }) =>
  jwt.sign(
    {
      id: String(userId),
      role: normalizeUserRole(role),
      sid: String(sessionId),
      type: "access",
    },
    getJwtSecret(),
    { expiresIn: ACCESS_TOKEN_TTL }
  );

const signRefreshToken = ({ userId, role, sessionId }) =>
  jwt.sign(
    {
      id: String(userId),
      role: normalizeUserRole(role),
      sid: String(sessionId),
      type: "refresh",
    },
    getJwtSecret(),
    { expiresIn: REFRESH_TOKEN_TTL }
  );

const verifyTypedToken = (token, expectedType) => {
  const decoded = jwt.verify(String(token || ""), getJwtSecret());
  if (decoded?.type !== expectedType) {
    throw new Error(`Invalid ${expectedType} token`);
  }
  return decoded;
};

const getAccessCookieOptions = () => ({
  httpOnly: true,
  secure: SHOULD_USE_SECURE_COOKIES,
  sameSite: COOKIE_SAME_SITE,
  path: "/",
  maxAge: ACCESS_COOKIE_MAX_AGE_MS,
  domain: COOKIE_DOMAIN,
});

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: SHOULD_USE_SECURE_COOKIES,
  sameSite: COOKIE_SAME_SITE,
  path: "/",
  maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  domain: COOKIE_DOMAIN,
});

export const getTokenCookiesConfig = () => ({
  accessCookieName: ACCESS_COOKIE_NAME,
  refreshCookieName: REFRESH_COOKIE_NAME,
});

export const setAuthCookies = (req, res, { accessToken, refreshToken }) => {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, getAccessCookieOptions());
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
};

export const clearAuthCookies = (req, res) => {
  const accessOptions = getAccessCookieOptions();
  const refreshOptions = getRefreshCookieOptions();

  res.clearCookie(ACCESS_COOKIE_NAME, {
    httpOnly: accessOptions.httpOnly,
    secure: accessOptions.secure,
    sameSite: accessOptions.sameSite,
    path: accessOptions.path,
  });

  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: refreshOptions.httpOnly,
    secure: refreshOptions.secure,
    sameSite: refreshOptions.sameSite,
    path: refreshOptions.path,
  });
};

export const readAccessToken = (req) => {
  const cookieToken = req.cookies?.[ACCESS_COOKIE_NAME];
  if (cookieToken) {
    return String(cookieToken);
  }

  if (req.headers.authorization?.startsWith("Bearer ")) {
    return String(req.headers.authorization.split(" ")[1]);
  }

  return "";
};

export const readRefreshToken = (req) => String(req.cookies?.[REFRESH_COOKIE_NAME] || "");

export const verifyAccessToken = (token) => verifyTypedToken(token, "access");

export const revokeAllUserSessions = async (userId, reason = "logout_all") => {
  await AuthSession.updateMany(
    { user: String(userId), revokedAt: null },
    {
      $set: {
        revokedAt: new Date(),
        revokedReason: reason,
      },
    }
  );
};

export const createSessionTokens = async ({ user, req }) => {
  const sessionId = crypto.randomUUID();
  const role = normalizeUserRole(user.role);
  const refreshToken = signRefreshToken({
    userId: user._id,
    role,
    sessionId,
  });
  const accessToken = signAccessToken({
    userId: user._id,
    role,
    sessionId,
  });

  const decodedRefresh = jwt.decode(refreshToken);

  await AuthSession.create({
    user: user._id,
    sessionId,
    refreshTokenHash: hashToken(refreshToken),
    userAgent: getRequestUserAgent(req),
    ipAddress: getRequestIp(req),
    lastUsedAt: new Date(),
    expiresAt: new Date(decodedRefresh.exp * 1000),
  });

  return {
    accessToken,
    refreshToken,
    sessionId,
    role,
  };
};

export const rotateRefreshToken = async ({ refreshToken, req }) => {
  const decoded = verifyTypedToken(refreshToken, "refresh");

  const session = await AuthSession.findOne({
    sessionId: String(decoded.sid),
    user: String(decoded.id),
  });

  if (!session || session.revokedAt || isExpiredSession(session)) {
    throw new Error("Invalid refresh session");
  }

  const incomingHash = hashToken(refreshToken);
  if (incomingHash !== session.refreshTokenHash) {
    await revokeAllUserSessions(decoded.id, "refresh_reuse_detected");
    throw new Error("Refresh token reuse detected");
  }

  const role = normalizeUserRole(decoded.role);
  const newRefreshToken = signRefreshToken({
    userId: decoded.id,
    role,
    sessionId: decoded.sid,
  });
  const newAccessToken = signAccessToken({
    userId: decoded.id,
    role,
    sessionId: decoded.sid,
  });
  const nextDecodedRefresh = jwt.decode(newRefreshToken);
  session.refreshTokenHash = hashToken(newRefreshToken);
  session.lastUsedAt = new Date();
  session.userAgent = getRequestUserAgent(req);
  session.ipAddress = getRequestIp(req);
  session.expiresAt = new Date(nextDecodedRefresh.exp * 1000);
  await session.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    userId: String(decoded.id),
    role,
    sessionId: String(decoded.sid),
  };
};

export const revokeRefreshSessionByToken = async (refreshToken, reason = "logout") => {
  try {
    const decoded = verifyTypedToken(refreshToken, "refresh");
    const session = await AuthSession.findOne({
      sessionId: String(decoded.sid),
      user: String(decoded.id),
    });

    if (!session || session.revokedAt) {
      return;
    }

    const incomingHash = hashToken(refreshToken);
    if (incomingHash !== session.refreshTokenHash) {
      await revokeAllUserSessions(decoded.id, "refresh_reuse_detected");
      return;
    }

    session.revokedAt = new Date();
    session.revokedReason = reason;
    await session.save();
  } catch {
    return;
  }
};

export const revokeSessionById = async ({ userId, sessionId, reason = "session_revoked" }) => {
  const session = await AuthSession.findOne({
    sessionId: String(sessionId || ""),
    user: String(userId),
    revokedAt: null,
  });

  if (!session) {
    return false;
  }

  session.revokedAt = new Date();
  session.revokedReason = reason;
  await session.save();

  return true;
};

export const listActiveSessions = async (userId) =>
  AuthSession.find({
    user: String(userId),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .select("sessionId userAgent ipAddress lastUsedAt expiresAt createdAt")
    .sort({ lastUsedAt: -1 })
    .lean();