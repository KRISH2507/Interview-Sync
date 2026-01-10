import User from "../models/User.js";

export const getProfile = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  res.json(user);
};

export const updateProfile = async (req, res) => {
  const { userId } = req.params;
  const updated = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
  });
  res.json(updated);
};
