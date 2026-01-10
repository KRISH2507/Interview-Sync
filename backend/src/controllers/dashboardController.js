import Interview from "../models/Interview.js";
import Resume from "../models/Resume.js";

export const getDashboard = async (req, res) => {
  const { userId } = req.params;

  const interviews = await Interview.find({ user: userId });
  const resume = await Resume.findOne({ user: userId });

  const totalSessions = interviews.length;

  const avgScore =
    interviews.reduce((a, b) => a + (b.overallScore || 0), 0) /
    (totalSessions || 1);

  let profileCompletion = 0;
  if (resume) profileCompletion += 50;
  if (totalSessions > 0) profileCompletion += 50;

  res.json({
    resumeScore: resume?.score || 0,
    interviewReadiness:
      avgScore >= 80 ? "Strong" : avgScore >= 60 ? "Intermediate" : "Beginner",
    totalSessions,
    profileCompletion
  });
};
