import express from "express";
import { startPractice, submitPractice } from "../controllers/practiceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/start", protect, asyncHandler(startPractice));
router.post("/submit", protect, asyncHandler(submitPractice));

export default router;
