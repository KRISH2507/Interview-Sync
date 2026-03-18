import DSAQuestion from "../models/DSAQuestion.js";
import PracticeSession from "../models/PracticeSession.js";
import { sampleQuestions } from "../utils/questionLoader.js";
import { invalidateDashboardCache } from "../utils/cache.js";
import { sendError, sendSuccess } from "../utils/response.js";

/**
 * Fetch 5 DSA questions: MongoDB if ≥5 docs exist, otherwise fall back to local JSON.
 */
async function getDSAQuestions() {
    const dbCount = await DSAQuestion.countDocuments();
    if (dbCount >= 5) {
        const docs = await DSAQuestion.aggregate([{ $sample: { size: 5 } }]);
        return docs.map((q) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            topic: q.topic,
            difficulty: q.difficulty,
            category: "dsa",
        }));
    }
    // Fallback: load from local JSON bank
    return sampleQuestions("dsa", 5).map((q) => ({ ...q, category: "dsa" }));
}

export const startPractice = async (req, res) => {
    try {
        const userId = req.user.id;

        // --- Build mixed question pool: 5 DSA + 3 MERN + 2 PERN = 10 total ---
        const [dsaQuestions, mernQuestions, pernQuestions] = await Promise.all([
            getDSAQuestions(),
            Promise.resolve(sampleQuestions("mern", 3).map((q) => ({ ...q, category: "mern" }))),
            Promise.resolve(sampleQuestions("pern", 2).map((q) => ({ ...q, category: "pern" }))),
        ]);

        // Shuffle the combined pool so question types are interleaved
        const allQuestions = [...dsaQuestions, ...mernQuestions, ...pernQuestions].sort(
            () => Math.random() - 0.5
        );

        const session = await PracticeSession.create({
            userId,
            questions: allQuestions.map((q) => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                topic: q.topic,
                difficulty: q.difficulty,
                category: q.category,
            })),
            totalQuestions: allQuestions.length,
            status: "in-progress",
        });

        // Strip correctAnswer before sending to client
        const publicQuestions = allQuestions.map((q) => ({
            question: q.question,
            options: q.options,
            topic: q.topic,
            difficulty: q.difficulty,
            category: q.category,
        }));

        return sendSuccess(res, 201, "Practice session started", {
            sessionId: session._id,
            questions: publicQuestions,
        });
    } catch (err) {
        console.error("startPractice error:", err);
        return sendError(res, 500, "Failed to start practice session", { error: err.message });
    }
};

export const submitPractice = async (req, res) => {
    try {
        const { sessionId, answers } = req.body;

        if (!sessionId || !Array.isArray(answers)) {
            return sendError(res, 400, "sessionId and answers are required");
        }

        const session = await PracticeSession.findById(sessionId);
        if (!session) {
            return sendError(res, 404, "Practice session not found");
        }

        if (session.status === "completed") {
            return sendError(res, 400, "Session already submitted");
        }

        let correctCount = 0;

        session.questions.forEach((q, index) => {
            const userAnswer = answers[index] !== undefined ? answers[index] : null;
            q.userAnswer = userAnswer;
            if (userAnswer === q.correctAnswer) {
                correctCount++;
            }
        });

        const totalQuestions = session.questions.length;
        const scorePercent = Math.round((correctCount / totalQuestions) * 100);
        const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

        session.answers = answers;
        session.correctAnswers = correctCount;
        session.totalQuestions = totalQuestions;
        session.score = scorePercent;
        session.accuracyPercentage = accuracy;
        session.status = "completed";

        await session.save();

        await invalidateDashboardCache(session.userId);

        return sendSuccess(res, 200, "Practice session completed", {
            score: scorePercent,
            correctAnswers: correctCount,
            totalQuestions,
            accuracyPercentage: accuracy,
        });
    } catch (err) {
        console.error("submitPractice error:", err);
        return sendError(res, 500, "Failed to submit practice session", { error: err.message });
    }
};
