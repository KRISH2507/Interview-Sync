import express from "express";
import { startPractice, submitPractice } from "../controllers/practiceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startPractice);
router.post("/submit", protect, submitPractice);

export default router;
