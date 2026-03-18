import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/", protect, asyncHandler(getProfile));
router.put("/", protect, asyncHandler(updateProfile));
router.get("/:userId", asyncHandler(getProfile));
router.put("/:userId", asyncHandler(updateProfile));

export default router;
