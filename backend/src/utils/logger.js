import pino from "pino";

const level = String(process.env.LOG_LEVEL || "info").toLowerCase();

const logger = pino({
  level,
  base: {
    service: "interviewsync-backend",
    env: process.env.NODE_ENV || "development",
  },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.otp",
      "res.headers['set-cookie']",
    ],
    remove: true,
  },
});

export default logger;