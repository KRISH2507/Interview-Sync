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
      required: function() {
        return this.provider === 'local';
      },
    },

    role: {
      type: String,
      enum: ["candidate", "recruiter"],
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
