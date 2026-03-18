import mongoose from "mongoose";

const practiceQuestionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: Number,
    userAnswer: Number,
    topic: String,
    difficulty: String,
    category: String, // "dsa" | "mern" | "pern"
});

const practiceSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        questions: [practiceQuestionSchema],
        answers: [Number],
        score: {
            type: Number,
            default: 0,
        },
        correctAnswers: {
            type: Number,
            default: 0,
        },
        totalQuestions: {
            type: Number,
            default: 0,
        },
        accuracyPercentage: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["in-progress", "completed"],
            default: "in-progress",
        },
    },
    { timestamps: true }
);

practiceSessionSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.model("PracticeSession", practiceSessionSchema);
