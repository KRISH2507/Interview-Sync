import mongoose from "mongoose";

const interviewRoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
    status: {
      type: String,
      enum: ["scheduled", "active", "completed"],
      default: "scheduled",
      index: true,
    },
  },
  { timestamps: true }
);

interviewRoomSchema.index({ candidateId: 1, createdAt: -1 });
interviewRoomSchema.index({ interviewerId: 1, createdAt: -1 });

export default mongoose.model("InterviewRoom", interviewRoomSchema);
