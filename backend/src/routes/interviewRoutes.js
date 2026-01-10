import express from "express";
import {
  startInterview,
  submitInterview,
} from "../controllers/interviewController.js";

const router = express.Router();

router.post("/start", startInterview);
router.post("/submit", submitInterview);

export default router;
