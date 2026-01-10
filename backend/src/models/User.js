import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    phone: String,
    location: String,
    bio: String,
    skills: [String],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
