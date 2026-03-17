import mongoose from "mongoose";

const interviewResultSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    ratings: {
      technical: { type: Number, min: 1, max: 10, required: true },
      problemSolving: { type: Number, min: 1, max: 10, required: true },
      behavior: { type: Number, min: 1, max: 10, required: true },
      communication: { type: Number, min: 1, max: 10, required: true },
      confidence: { type: Number, min: 1, max: 10, required: true },
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    feedback: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export default mongoose.model("InterviewResult", interviewResultSchema);
