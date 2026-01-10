import express from "express";
import multer from "multer";
import { uploadResume } from "../controllers/resumeController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("resume"), uploadResume);

export default router;
