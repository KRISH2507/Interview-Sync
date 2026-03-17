import express from "express";
import cors from "cors";

import resumeRoutes from "./routes/resumeRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import practiceRoutes from "./routes/practiceRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";

const app = express();
app.set("trust proxy", 1);

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
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);
app.use(express.json());

app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/code", codeRoutes);

export default app;
