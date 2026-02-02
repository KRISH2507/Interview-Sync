import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rawText: {
      type: String,
      required: true,
    },

    summary: {
      type: String,
    },

    skills: {
      type: [String],
      default: [],
    },

    score: {
      type: Number,
      default: 0,
    },

    analysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", ResumeSchema);
