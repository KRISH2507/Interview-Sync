import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getRandomCodeQuestion, runCode, submitCode } from "../controllers/codeController.js";

const router = express.Router();

router.get("/question", protect, getRandomCodeQuestion);
router.post("/run", protect, runCode);
router.post("/submit", protect, submitCode);

export default router;
