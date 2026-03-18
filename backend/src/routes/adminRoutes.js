import express from "express";

import { getAdminMetrics } from "../controllers/adminController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/metrics", protect, requireAdmin, asyncHandler(getAdminMetrics));

export default router;
