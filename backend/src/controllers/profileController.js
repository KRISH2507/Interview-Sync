import User from "../models/User.js";
import { invalidateDashboardCache } from "../utils/cache.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;
    if (!userId) {
      return sendError(res, 400, "userId required");
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "Profile fetched", user);
  } catch (err) {
    console.error("Get profile error:", err);
    return sendError(res, 500, "Failed to get profile", { error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;
    if (!userId) {
      return sendError(res, 400, "userId required");
    }

    const updated = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      select: "-password",
    });
    if (!updated) {
      return sendError(res, 404, "User not found");
    }

    await invalidateDashboardCache(userId);

    return sendSuccess(res, 200, "Profile updated", updated);
  } catch (err) {
    console.error("Update profile error:", err);
    return sendError(res, 500, "Failed to update profile", { error: err.message });
  }
};
