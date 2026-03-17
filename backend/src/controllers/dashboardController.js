import Interview from "../models/Interview.js";
import Resume from "../models/Resume.js";
import User from "../models/User.js";
import PracticeSession from "../models/PracticeSession.js";
import CodeSubmission from "../models/CodeSubmission.js";
import CodingAttempt from "../models/CodingAttempt.js";
import InterviewResult from "../models/InterviewResult.js";
import { dashboardCacheKey, getCachedJson, setCachedJson } from "../utils/cache.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const cacheKey = dashboardCacheKey(String(userId));
    const cachedDashboard = await getCachedJson(cacheKey);
    if (cachedDashboard) {
      return res.json(cachedDashboard);
    }

    const user = await User.findById(userId);
    const interviews = await Interview.find({ user: userId }).sort({ createdAt: -1 });
    const resume = await Resume.findOne({ user: userId });
    const practiceSessions = await PracticeSession.find({ userId, status: "completed" }).sort({ createdAt: -1 });
    const codingAttempts = await CodingAttempt.find({ userId }).sort({ createdAt: -1 });
    const interviewResultsDocs = await InterviewResult.find({ candidateId: userId }).sort({ createdAt: -1 });
    const codeSubmissions = codingAttempts.length === 0
      ? await CodeSubmission.find({ userId }).sort({ createdAt: -1 })
      : [];

    const completedInterviews = interviews.filter((i) => i.status === "completed");

    // Build unified history from both Interviews and PracticeSessions
    const interviewHistoryItems = completedInterviews.map((i) => {
      const correctAnswers = (i.questions || []).filter(
        (q) => q.userAnswer === q.correctAnswer
      ).length;
      const totalQuestions = (i.questions || []).length;
      const quizAccuracy =
        totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      return {
        id: i._id,
        score: i.overallScore || 0,
        totalQuestions,
        correctAnswers,
        accuracy: quizAccuracy,
        status: i.status,
        createdAt: i.createdAt,
        type: "interview",
        questions: (i.questions || []).map((q) => ({
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          userAnswer: q.userAnswer,
          score: q.score || 0,
          feedback: q.feedback || "",
          topic: q.topic || "General",
          difficulty: q.difficulty || "medium",
        })),
      };
    });

    const practiceHistoryItems = practiceSessions.map((s) => {
      return {
        id: s._id,
        score: s.score || 0,
        totalQuestions: s.totalQuestions || 0,
        correctAnswers: s.correctAnswers || 0,
        accuracy: s.accuracyPercentage || 0,
        status: "completed",
        createdAt: s.createdAt,
        type: "practice",
        questions: (s.questions || []).map((q) => ({
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          userAnswer: q.userAnswer !== undefined ? q.userAnswer : null,
          score: q.userAnswer === q.correctAnswer ? 10 : 0,
          feedback: q.userAnswer === q.correctAnswer ? "Correct answer" : "Incorrect answer",
          topic: q.topic || "DSA",
          difficulty: q.difficulty || "medium",
        })),
      };
    });

    const codingHistoryFromAttempts = codingAttempts.map((s) => {
      const total = s.totalCount || 0;
      const passed = s.passedCount || 0;
      const score = total > 0 ? Math.round((passed / total) * 100) : 0;
      return {
        id: s._id,
        questionId: s.questionId,
        title: s.title,
        difficulty: s.difficulty,
        language: s.language,
        passedTests: passed,
        totalTests: total,
        score,
        createdAt: s.createdAt,
      };
    });

    const codingHistoryFromLegacy = codeSubmissions.map((s) => {
      const total = s.totalTests || 0;
      const passed = s.passedTests || 0;
      const score = total > 0 ? Math.round((passed / total) * 100) : 0;
      return {
        id: s._id,
        questionId: s.questionId,
        title: s.title,
        difficulty: s.difficulty,
        language: s.language,
        passedTests: passed,
        totalTests: total,
        score,
        createdAt: s.createdAt,
      };
    });

    const codingHistory = codingHistoryFromAttempts.length > 0
      ? codingHistoryFromAttempts
      : codingHistoryFromLegacy;

    const interviewResults = interviewResultsDocs.map((result) => ({
      id: result._id,
      roomId: result.roomId,
      interviewerId: result.interviewerId,
      ratings: result.ratings,
      overallScore: result.overallScore,
      feedback: result.feedback || "",
      createdAt: result.createdAt,
    }));

    // Merge and sort by date descending
    const interviewHistory = [...interviewHistoryItems, ...practiceHistoryItems].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Aggregate stats across both types
    const totalSessions = interviewHistory.length;

    const allScores = interviewHistory.map((h) => h.score);
    const avgScore =
      allScores.length > 0
        ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
        : 0;

    const totalQuestionsAnswered = interviewHistory.reduce(
      (sum, h) => sum + (h.totalQuestions || 0),
      0
    );
    const totalCorrectAnswers = interviewHistory.reduce(
      (sum, h) => sum + (h.correctAnswers || 0),
      0
    );
    const accuracyPercentage =
      totalQuestionsAnswered > 0
        ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100)
        : 0;

    // Profile completion
    let profileCompletion = 0;
    if (user?.name) profileCompletion += 10;
    if (user?.email) profileCompletion += 10;
    if (user?.bio && user.bio.trim() !== "") profileCompletion += 15;
    if (user?.skills && user.skills.length > 0) profileCompletion += 15;

    let resumeContribution = 0;
    if (resume) {
      if (resume.rawText && resume.rawText.length > 300) resumeContribution += 25;
      if (resume.summary && resume.summary.trim().length > 20) resumeContribution += 15;
      const skillsCount = Array.isArray(resume.skills) ? resume.skills.length : 0;
      resumeContribution += Math.min(skillsCount * 2, 10);
    }

    profileCompletion += resumeContribution;
    if (totalSessions > 0) {
      profileCompletion += Math.min(totalSessions * 5, 20);
    }
    profileCompletion = Math.min(profileCompletion, 100);

    let resumeScore = 0;
    if (resume) {
      if (resume.summary && resume.summary.trim().length > 20) resumeScore += 30;
      const skillsCount = Array.isArray(resume.skills) ? resume.skills.length : 0;
      resumeScore += Math.min(skillsCount * 10, 50);
      if (resume.rawText && resume.rawText.length > 300) resumeScore += 20;
      resumeScore = Math.min(100, Math.round(resumeScore));
    }

    const interviewReadiness =
      avgScore >= 80
        ? "Strong"
        : avgScore >= 60
          ? "Intermediate"
          : "Beginner";

    const dashboardPayload = {
      user: {
        name: user?.name || "User",
        email: user?.email || "",
      },
      resumeScore,
      interviewReadiness,
      totalSessions,
      profileCompletion,
      averageScore: Math.round(avgScore),
      totalQuestionsAnswered,
      totalCorrectAnswers,
      accuracyPercentage,
      interviewHistory,
      codingHistory,
      interviewResults,
      resume: resume
        ? {
          id: resume._id,
          rawText: resume.rawText,
          summary: resume.summary,
          skills: resume.skills,
        }
        : null,
    };

    await setCachedJson(cacheKey, dashboardPayload);

    res.json(dashboardPayload);
  } catch (err) {
    console.error("getDashboard error", err);
    res.status(500).json({ message: "Failed to get dashboard" });
  }
};
