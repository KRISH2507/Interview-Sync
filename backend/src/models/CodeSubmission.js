import mongoose from "mongoose";

const codeSubmissionSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    language: {
      type: String,
      enum: ["javascript", "python", "java", "cpp"],
      required: true,
    },
    passedTests: {
      type: Number,
      required: true,
      default: 0,
    },
    totalTests: {
      type: Number,
      required: true,
      default: 0,
    },
    runtime: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

codeSubmissionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("CodeSubmission", codeSubmissionSchema);
