import jwt from "jsonwebtoken";

import {
  readAccessToken,
  readRefreshToken,
  rotateRefreshToken,
  setAuthCookies,
  verifyAccessToken,
} from "../services/tokenService.js";
import { sendError } from "../utils/response.js";

const attachUser = (req, decoded) => {
  req.user = {
    id: String(decoded.id),
    role: String(decoded.role),
    sessionId: String(decoded.sid),
  };
};

export const protect = async (req, res, next) => {
  const accessToken = readAccessToken(req);

  if (accessToken) {
    try {
      const decoded = verifyAccessToken(accessToken);
      attachUser(req, decoded);
      return next();
    } catch (error) {
      if (!(error instanceof jwt.TokenExpiredError)) {
        return sendError(res, 401, "Not authorized");
      }
    }
  }

  const refreshToken = readRefreshToken(req);
  if (!refreshToken) {
    return sendError(res, 401, "Not authorized");
  }

  try {
    const rotated = await rotateRefreshToken({ refreshToken, req });
    setAuthCookies(req, res, rotated);

    const decodedAccess = verifyAccessToken(rotated.accessToken);
    attachUser(req, decodedAccess);

    return next();
  } catch {
    return sendError(res, 401, "Not authorized");
  }
};

export const requireAdmin = (req, res, next) => {
  const role = String(req.user?.role || "").toLowerCase();
  if (role === "admin" || role === "recruiter") {
    return next();
  }

  return sendError(res, 403, "Admin access required");
};
