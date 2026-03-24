import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { GradientBadge } from "./ui/gradient-badge";
import { CircularProgress } from "./ui/circular-progress";
import { AnimatedCounter } from "./ui/animated-counter";
import { useTheme } from "../contexts/theme-context";

import DashboardLayout from "./dashboard-layout";
import { DashboardSkeleton } from "./loading/dashboard-skeleton";
import { staggerContainer, staggerItem } from "../utils/animation-variants";
import { getMyInterviewResults } from "../services/api";

function normalizeInterviewResult(result) {
  if (!result) return null;

  const ratings = result.ratings || {};
  const derivedOverallScore = Number.isFinite(Number(result.overallScore))
    ? Number(result.overallScore)
    : Math.round(
      ((Number(ratings.technical || ratings.coding || 0) +
        Number(ratings.problemSolving || 0) +
        Number(ratings.behavior || 0) +
        Number(ratings.communication || 0) +
        Number(ratings.confidence || 0)) /
        50) *
        100
    );

  return {
    ...result,
    id: result.id || result._id,
    overallScore: Number.isFinite(derivedOverallScore) ? derivedOverallScore : 0,
  };
}

function ScoreBadge({ score }) {
  const backgroundColor = score >= 80 ? "#DCFCE7" : score >= 60 ? "#FEF3C7" : "#FEE2E2";
  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <span
      className="rounded-full px-3 py-1 text-sm font-semibold"
      style={{ backgroundColor, color }}
    >
      {score}%
    </span>
  );
}

export default function CandidateDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [interviewResults, setInterviewResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.get("/dashboard");
        setDashboard(res?.data?.data || null);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await getMyInterviewResults();
        const results = res?.data?.data?.results;
        const normalized = Array.isArray(results)
          ? results.map(normalizeInterviewResult).filter(Boolean)
          : [];
        setInterviewResults(normalized);
      } catch (err) {
        console.error("Failed to load interview results", err);
      }
    }

    loadResults();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  const profileCompletion = dashboard?.profileCompletion || 0;
  const resumeScore = dashboard?.resumeScore || 0;
  const totalSessions = dashboard?.totalSessions || 0;
  const interviewReadiness = dashboard?.interviewReadiness || "Beginner";
  const averageScore = dashboard?.averageScore || 0;
  const accuracyPercentage = dashboard?.accuracyPercentage || 0;
  const totalQuestionsAnswered = dashboard?.totalQuestionsAnswered || 0;
  const totalCorrectAnswers = dashboard?.totalCorrectAnswers || 0;
  const interviewHistory = dashboard?.interviewHistory || [];
  const dashboardInterviewResults = Array.isArray(dashboard?.interviewResults)
    ? dashboard.interviewResults.map(normalizeInterviewResult).filter(Boolean)
    : [];
  const mergedInterviewResults = interviewResults.length > 0 ? interviewResults : dashboardInterviewResults;
  const userName = dashboard?.user?.name || "User";

  const latestQuiz = interviewHistory.length > 0 ? interviewHistory[0] : null;

  const metricCardClass = "rounded-[14px] border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]";
  const metricCardStyle = {
    borderColor: isDark ? "#334155" : "#E2E8F0",
    boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.35)" : "0 6px 20px rgba(0,0,0,0.05)",
    backgroundColor: isDark ? "#111827" : "#FFFFFF",
  };
  const textPrimary = isDark ? "#F1F5F9" : "#0F172A";
  const textSecondary = isDark ? "#CBD5E1" : "#475569";
  const textMuted = isDark ? "#94A3B8" : "#64748B";

  return (
    <DashboardLayout role="candidate">
      <div className="relative space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold" style={{ color: textPrimary }}>
            Welcome back, <span style={{ color: "#4F46E5" }}>{userName}</span>! 👋
          </h1>
          <p className="mt-2 text-lg" style={{ color: textSecondary }}>
            Track your progress and continue your interview preparation
          </p>
        </motion.div>

        {resumeScore === 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Upload your resume to unlock personalized interview preparation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/upload">
                <Button>Upload Resume</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >

          <motion.div variants={staggerItem}>
            <div className={metricCardClass} style={metricCardStyle}>
              <div className="flex flex-col items-center text-center space-y-4">
                <CircularProgress
                  value={profileCompletion}
                  size={120}
                  variant="primary"
                  showValue={true}
                />
                <div>
                  <h3 className="mb-1 text-[20px] font-semibold" style={{ color: textPrimary }}>
                    Profile Completion
                  </h3>
                  <p className="text-sm" style={{ color: textSecondary }}>
                    Keep practicing to improve
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem}>
            <div className={metricCardClass} style={metricCardStyle}>
              <div className="flex flex-col items-center text-center space-y-4">
                <CircularProgress
                  value={averageScore}
                  size={120}
                  variant="emerald"
                  showValue={true}
                />
                <div>
                  <h3 className="mb-1 text-[20px] font-semibold" style={{ color: textPrimary }}>
                    Average Score
                  </h3>
                  <p className="text-sm" style={{ color: textMuted }}>
                    <GradientBadge variant="primary" size="sm">{interviewReadiness}</GradientBadge>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem}>
            <div className={metricCardClass} style={metricCardStyle}>
              <div className="flex flex-col items-center text-center space-y-4">
                <CircularProgress
                  value={accuracyPercentage}
                  size={120}
                  variant="gold"
                  showValue={true}
                />
                <div>
                  <h3 className="mb-1 text-[20px] font-semibold" style={{ color: textPrimary }}>
                    Accuracy Rate
                  </h3>
                  <p className="text-sm" style={{ color: textSecondary }}>
                    {totalCorrectAnswers}/{totalQuestionsAnswered} correct
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem}>
            <div className={metricCardClass} style={metricCardStyle}>
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div>
                  <div className="text-[32px] font-bold" style={{ color: textPrimary }}>
                    <AnimatedCounter value={totalSessions} />
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-[14px] font-medium" style={{ color: textMuted }}>
                    Practice Sessions
                  </h3>
                  <Link to="/practice">
                    <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700" size="sm">
                      Start Practice
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {latestQuiz && (
          <div className="overflow-hidden rounded-[14px] border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]" style={{ borderColor: isDark ? "#334155" : "#E2E8F0", boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.35)" : "0 6px 20px rgba(0,0,0,0.05)", backgroundColor: isDark ? "#111827" : "#FFFFFF" }}>
            <div className="p-6 border-b" style={{ borderColor: isDark ? "#334155" : "#E2E8F0" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: textPrimary }}>
                    Latest Quiz Results
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: textSecondary }}>
                    Completed on {new Date(latestQuiz.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <ScoreBadge score={latestQuiz.score} />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="rounded-lg border bg-white p-3 text-center" style={{ borderColor: "#E2E8F0" }}>
                  <p className="mb-1 text-xs" style={{ color: "#64748B" }}>Score</p>
                  <p className="text-lg font-bold" style={{ color: "#22C55E" }}>{latestQuiz.score}%</p>
                </div>
                <div className="rounded-lg border p-3 text-center" style={{ backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }}>
                  <p className="mb-1 text-xs" style={{ color: "#22C55E" }}>Correct</p>
                  <p className="text-lg font-bold" style={{ color: "#22C55E" }}>{latestQuiz.correctAnswers}</p>
                </div>
                <div className="rounded-lg border p-3 text-center" style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA" }}>
                  <p className="mb-1 text-xs" style={{ color: "#EF4444" }}>Incorrect</p>
                  <p className="text-lg font-bold" style={{ color: "#EF4444" }}>{latestQuiz.totalQuestions - latestQuiz.correctAnswers}</p>
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="divide-y" style={{ borderColor: isDark ? "#334155" : "#E2E8F0" }}>
                {(latestQuiz.questions || []).slice(0, 5).map((q, idx) => {
                  const isCorrect = q.userAnswer === q.correctAnswer;
                  return (
                    <div key={idx} className="p-6 transition-colors duration-200" style={{ backgroundColor: isDark ? "#111827" : "#FFFFFF" }}>
                      <div className="flex items-start gap-4">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold" style={{ backgroundColor: isDark ? "rgba(79,70,229,0.25)" : "#EEF2FF", color: "#4F46E5" }}>
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium" style={{ color: textPrimary }}>{q.question}</p>
                          <div className="mt-2 space-y-1">
                            {(q.options || []).map((option, optIdx) => {
                              const isUserAnswer = q.userAnswer === optIdx;
                              const isCorrectAnswer = q.correctAnswer === optIdx;

                              let className = "rounded px-3 py-2 text-sm ";
                              if (isUserAnswer && isCorrect) {
                                className += "bg-green-50 text-green-700 border border-green-300";
                              } else if (isUserAnswer && !isCorrect) {
                                className += "bg-red-50 text-red-700 border border-red-300";
                              } else if (isCorrectAnswer && !isCorrect) {
                                className += "bg-green-50 text-green-700 border border-green-300";
                              } else {
                                className += isDark
                                  ? "bg-slate-800 text-slate-200 border border-slate-700"
                                  : "bg-slate-50 text-slate-700 border border-slate-200";
                              }

                              return (
                                <div key={optIdx} className={className}>
                                  {isUserAnswer && (isCorrect ? "✓ " : "✗ ")}
                                  {isCorrectAnswer && !isUserAnswer && "✓ "}
                                  {option}
                                  {isUserAnswer && " (Your answer)"}
                                  {isCorrectAnswer && !isUserAnswer && " (Correct answer)"}
                                </div>
                              );
                            })}
                          </div>
                          {!isCorrect && q.feedback && (
                            <div className="mt-2 rounded border p-3 text-sm text-blue-700" style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }}>
                              <span className="font-semibold">💡 Feedback: </span>
                              {q.feedback}
                            </div>
                          )}
                          <div className="mt-2 flex gap-2 text-xs" style={{ color: textMuted }}>
                            <span className="rounded px-2 py-1" style={{ backgroundColor: isDark ? "#1F2937" : "#F1F5F9" }}>{q.topic}</span>
                            <span className="rounded px-2 py-1" style={{ backgroundColor: isDark ? "#1F2937" : "#F1F5F9" }}>{q.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </CardContent>
          </div>
        )}

        {interviewHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="rounded-[14px] border-2 border-dashed p-6 transition-colors" style={{ borderColor: isDark ? "#475569" : "#CBD5E1", backgroundColor: isDark ? "#111827" : "#FFFFFF" }}>
              <div className="flex flex-col items-center gap-4">
                <div>
                  <h3 className="mb-2 text-lg font-semibold" style={{ color: textPrimary }}>
                    Want to see all your quiz attempts?
                  </h3>
                  <p className="text-sm" style={{ color: textSecondary }}>
                    View detailed history with all questions, answers, and feedback
                  </p>
                </div>
                <Link to="/history">
                  <Button variant="outline" size="lg" className="group">
                    View Full History
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {mergedInterviewResults.length > 0 && (
          <div className="rounded-[14px] border p-6" style={{ borderColor: isDark ? "#334155" : "#E2E8F0", backgroundColor: isDark ? "#111827" : "#FFFFFF" }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold" style={{ color: textPrimary }}>
                Interview <span style={{ color: "#4F46E5" }}>Results</span>
              </h2>
              <Link to="/history">
                <Button size="sm" variant="outline">View History</Button>
              </Link>
            </div>

            <div className="space-y-3">
              {mergedInterviewResults.slice(0, 3).map((result) => (
                <div key={result.id} className="rounded-lg border p-4" style={{ borderColor: isDark ? "#334155" : "#E2E8F0", backgroundColor: isDark ? "#0B1220" : "#F8FAFC" }}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold" style={{ color: textPrimary }}>
                      Overall Score: {result.overallScore}%
                    </p>
                    <span className="text-xs" style={{ color: textSecondary }}>
                      {new Date(result.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm" style={{ color: textSecondary }}>
                    Technical: {result.ratings?.technical ?? result.ratings?.coding} •
                    Problem Solving: {result.ratings?.problemSolving} •
                    Behavior: {result.ratings?.behavior ?? "-"} •
                    Communication: {result.ratings?.communication} •
                    Confidence: {result.ratings?.confidence}
                  </p>
                  <p className="mt-2 text-sm" style={{ color: textPrimary }}>
                    {result.feedback || "No feedback provided"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {interviewHistory.length === 0 && resumeScore > 0 && (
          <Card className="border-2 border-dashed" style={{ borderColor: isDark ? "#475569" : "#CBD5E1", backgroundColor: isDark ? "#111827" : "#FFFFFF" }}>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold" style={{ color: textPrimary }}>No quiz history yet</h3>
                <p className="mt-2 text-sm" style={{ color: textSecondary }}>
                  Start your first practice session to see your results here
                </p>
                <Link to="/practice">
                  <Button className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700">Start Your First Quiz</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout >
  );
}
