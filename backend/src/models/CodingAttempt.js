import mongoose from "mongoose";

const codingAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questionId: {
      type: String,
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ["javascript", "python", "java", "cpp"],
      required: true,
    },
    passedCount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalCount: {
      type: Number,
      required: true,
      default: 0,
    },
    title: {
      type: String,
      default: "Coding Practice",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  { timestamps: true }
);

export default mongoose.model("CodingAttempt", codingAttemptSchema);
