import Interview from "../models/Interview.js";
import Resume from "../models/Resume.js";
import User from "../models/User.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const user = await User.findById(userId);
    const interviews = await Interview.find({ user: userId }).sort({
      createdAt: -1,
    });
    const resume = await Resume.findOne({ user: userId });

    const totalSessions = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'completed');

    console.log('📊 Dashboard Debug:');
    console.log('Total interviews:', totalSessions);
    console.log('Completed interviews:', completedInterviews.length);
    console.log('Interview statuses:', interviews.map(i => ({ id: i._id, status: i.status, score: i.overallScore })));

    const avgScore =
      completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) /
      (completedInterviews.length || 1);

    // Profile Completion (practical)
    // Consider both user profile fields and resume content
    let profileCompletion = 0;
    if (user?.name) profileCompletion += 10;
    if (user?.email) profileCompletion += 10;
    if (user?.bio && user.bio.trim() !== "") profileCompletion += 15;
    if (user?.skills && user.skills.length > 0) profileCompletion += 15;

    // Resume contribution (up to 50)
    let resumeContribution = 0;
    if (resume) {
      if (resume.rawText && resume.rawText.length > 300) resumeContribution += 25;
      if (resume.summary && resume.summary.trim().length > 20) resumeContribution += 15;
      const skillsCount = Array.isArray(resume.skills) ? resume.skills.length : 0;
      resumeContribution += Math.min(skillsCount * 2, 10);
    }

    profileCompletion += resumeContribution;

    // Quiz completion bonus (up to 20%)
    if (completedInterviews.length > 0) {
      profileCompletion += Math.min(completedInterviews.length * 5, 20);
    }

    profileCompletion = Math.min(profileCompletion, 100);

    // Resume Score (derive 0-100 from resume content)
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

    // Detailed interview history with questions and answers
    const interviewHistory = completedInterviews.map((i) => {
      const correctAnswers = (i.questions || []).filter(q => q.userAnswer === q.correctAnswer).length;
      const totalQuestions = (i.questions || []).length;
      const quizAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      return {
        id: i._id,
        score: i.overallScore || 0,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        accuracy: quizAccuracy,
        status: i.status,
        createdAt: i.createdAt,
        questions: (i.questions || []).map(q => ({
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          userAnswer: q.userAnswer,
          score: q.score || 0,
          feedback: q.feedback || '',
          topic: q.topic || 'General',
          difficulty: q.difficulty || 'medium'
        }))
      };
    });

    // Performance statistics
    const totalQuestionsAnswered = completedInterviews.reduce((sum, i) =>
      sum + (i.questions || []).length, 0
    );
    const totalCorrectAnswers = completedInterviews.reduce((sum, i) =>
      sum + (i.questions || []).filter(q => q.userAnswer === q.correctAnswer).length, 0
    );
    const accuracyPercentage = totalQuestionsAnswered > 0
      ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100)
      : 0;

    console.log('📤 Sending dashboard response:');
    console.log('  Average Score:', Math.round(avgScore));
    console.log('  Accuracy:', accuracyPercentage);
    console.log('  Interview History Count:', interviewHistory.length);

    res.json({
      user: {
        name: user?.name || 'User',
        email: user?.email || '',
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
      resume: resume
        ? {
          id: resume._id,
          rawText: resume.rawText,
          summary: resume.summary,
          skills: resume.skills,
        }
        : null,
    });
  } catch (err) {
    console.error('getDashboard error', err);
    res.status(500).json({ message: 'Failed to get dashboard' });
  }
};
