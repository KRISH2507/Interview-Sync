import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
  },
  topic: {
    type: String,
  },

  options: {
    type: [String],
    default: [],
  },
  correctAnswer: {
    type: Number, // index of correct option
  },

  userAnswer: {
    type: Number,
  },
  score: {
    type: Number,
  },
  feedback: {
    type: String,
  },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    questions: [questionSchema],

    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },

    totalQuestions: {
      type: Number,
    },

    overallScore: {
      type: Number, // 0–100
    },
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);
