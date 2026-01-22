import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.get("/:userId", getProfile); // Keep for backward compatibility
router.put("/:userId", updateProfile); // Keep for backward compatibility

export default router;
