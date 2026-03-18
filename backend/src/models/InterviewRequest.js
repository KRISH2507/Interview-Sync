import mongoose from "mongoose";

const interviewRequestSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    roomId: {
      type: String,
      default: "",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "scheduled", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

interviewRequestSchema.index({ candidateId: 1, status: 1, createdAt: -1 });
interviewRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("InterviewRequest", interviewRequestSchema);