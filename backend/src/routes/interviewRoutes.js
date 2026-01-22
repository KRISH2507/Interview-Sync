import express from "express";
import {
  startInterview,
  submitInterview,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startInterview);
router.post("/submit", protect, submitInterview);

export default router;
