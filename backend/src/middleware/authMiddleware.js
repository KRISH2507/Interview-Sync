import jwt from "jsonwebtoken";

import { getRedisClient } from "../config/redis.js";

const buildSessionKey = (jti) => `auth:session:${jti}`;
const buildTokenBlacklistKey = (jti) => `auth:blacklist:${jti}`;

export const protect = async (req, res, next) => {
  let token;


  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const redis = await getRedisClient();
      if (redis && decoded.jti) {
        const isBlacklisted = await redis.get(buildTokenBlacklistKey(decoded.jti));
        if (isBlacklisted) {
          return res.status(401).json({ message: "Not authorized, token revoked" });
        }

        const sessionExists = await redis.get(buildSessionKey(decoded.jti));
        if (!sessionExists) {
          return res.status(401).json({ message: "Not authorized, session expired" });
        }
      }

      req.user = {
        id: decoded.id,
        role: decoded.role,
        jti: decoded.jti,
      };

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};
