import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";

import resumeRoutes from "./routes/resumeRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import practiceRoutes from "./routes/practiceRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { csrfProtection } from "./middleware/csrfMiddleware.js";
import { httpLogger, requestMetrics } from "./middleware/requestMetricsMiddleware.js";
import {
	aiRouteLimiter,
	authRouteLimiter,
	publicRouteLimiter,
} from "./middleware/routeRateLimitProfiles.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
app.use(httpLogger);
app.use(requestMetrics);

const configuredOrigins = [
	...String(process.env.FRONTEND_URLS || "")
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean),
	String(process.env.FRONTEND_URL || "").trim(),
].filter(Boolean);

app.use(
	cors({
		origin(origin, callback) {
			if (!origin) {
				return callback(null, true);
			}

			if (configuredOrigins.length === 0) {
				return callback(null, true);
			}

			if (configuredOrigins.includes(origin)) {
				return callback(null, true);
			}

			return callback(new Error(`CORS blocked for origin: ${origin}`));
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-XSRF-Token"],
	})
);
app.use(express.json());
app.use(cookieParser());
app.use(csrfProtection);

app.get("/ping", publicRouteLimiter, (_req, res) => {
	res.json({ ok: true, service: "interviewsync-backend" });
});

app.use("/api/resume", resumeRoutes);
app.use("/api/interview", aiRouteLimiter, interviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRouteLimiter, authRoutes);
app.use("/api/practice", aiRouteLimiter, practiceRoutes);
app.use("/api/code", aiRouteLimiter, codeRoutes);
app.use("/api/admin", authRouteLimiter, adminRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
