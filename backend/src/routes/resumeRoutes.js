import express from "express";
import multer from "multer";
import { uploadResume } from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/upload",
  protect,
  upload.single("resume"),
  uploadResume
);

export default router;
