import mongoose from "mongoose";

const dsaQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length === 4, "Must have exactly 4 options"],
    },
    correctAnswer: {
      type: Number, // 0-indexed
      required: true,
    },
    topic: {
      type: String,
      enum: ["arrays", "trees", "graphs", "dp", "strings", "sorting", "searching", "linked-lists", "stacks", "queues"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("DSAQuestion", dsaQuestionSchema);
