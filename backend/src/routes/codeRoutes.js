import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getRandomCodeQuestion, runCode, submitCode } from "../controllers/codeController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/question", protect, asyncHandler(getRandomCodeQuestion));
router.post("/run", protect, asyncHandler(runCode));
router.post("/submit", protect, asyncHandler(submitCode));

export default router;
