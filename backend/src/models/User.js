import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["candidate"],
      default: "candidate",
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    
    phone: String,
    location: String,
    bio: String,
    skills: [String],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
