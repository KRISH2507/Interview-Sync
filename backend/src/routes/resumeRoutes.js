import express from "express";
import multer from "multer";
import { uploadResume } from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= MULTER CONFIG ================= */
// Use memory storage since we extract text & send to AI
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ================= ROUTES ================= */
router.post(
  "/upload",
  protect,                 // ✅ JWT protection
  upload.single("resume"), // ✅ file field name = "resume"
  uploadResume
);

export default router;
