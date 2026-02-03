import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Failed to get profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const updated = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      select: "-password",
    });
    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json(updated);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
