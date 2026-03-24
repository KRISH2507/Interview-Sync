import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { getMyInterviewResults } from '../services/api';

import { Button } from './ui/button';
import { GradientBadge } from './ui/gradient-badge';
import { CircularProgress } from './ui/circular-progress';
import { Timeline, TimelineItem } from './ui/timeline';
import DashboardLayout from './dashboard-layout';
import { DashboardSkeleton } from "./loading/dashboard-skeleton";
import { staggerContainer, staggerItem } from '../utils/animation-variants';
import { useTheme } from '../contexts/theme-context';

function ScoreBadge({ score }) {
  const getVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return <GradientBadge variant={getVariant(score)}>{score}%</GradientBadge>;
}

function QuizIcon({ score }) {
  if (score >= 80) {
    return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  } else if (score >= 60) {
    return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  } else {
    return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  }
}

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

export default function QuizHistory() {
  const [dashboard, setDashboard] = useState(null);
  const [interviewResults, setInterviewResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardBg = isDark ? '#111827' : '#FFFFFF';
  const borderColor = isDark ? '#334155' : '#E2E8F0';
  const textPrimary = isDark ? '#F1F5F9' : '#0F172A';
  const textSecondary = isDark ? '#CBD5E1' : '#475569';
  const textMuted = isDark ? '#94A3B8' : '#64748B';

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashboardRes, interviewResultsRes] = await Promise.all([
          api.get('/dashboard'),
          getMyInterviewResults(),
        ]);

        const dashboardData = dashboardRes.data?.data || null;
        setDashboard(dashboardData);

        const directResultsPayload = interviewResultsRes.data?.data?.results;
        const directResults = Array.isArray(directResultsPayload)
          ? directResultsPayload.map(normalizeInterviewResult).filter(Boolean)
          : [];

        const dashboardResults = Array.isArray(dashboardData?.interviewResults)
          ? dashboardData.interviewResults.map(normalizeInterviewResult).filter(Boolean)
          : [];

        setInterviewResults(directResults.length > 0 ? directResults : dashboardResults);
      } catch (err) {
        console.error('Failed to load quiz history', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  const interviewHistory = dashboard?.interviewHistory || [];
  const codingHistory = dashboard?.codingHistory || [];
  return (
    <DashboardLayout role="candidate">
      <div className="relative space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold" style={{ color: textPrimary }}>
            Quiz <span style={{ color: "#4F46E5" }}>History</span>
          </h1>
          <p className="mt-2 text-lg" style={{ color: textSecondary }}>
            Track your progress and review past quiz sessions
          </p>
        </motion.div>

        {interviewHistory.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-6 sm:grid-cols-3"
          >
            <motion.div variants={staggerItem}>
              <div className="rounded-xl border text-center shadow-[0_4px_16px_rgba(0,0,0,0.04)]" style={{ borderColor, backgroundColor: cardBg }}>
                <div className="flex flex-col items-center justify-center p-6">
                  <CircularProgress
                    value={dashboard.averageScore || 0}
                    size={100}
                    variant="royal"
                    label="Avg Score"
                    showValue={true}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={staggerItem}>
              <div className="rounded-xl border text-center shadow-[0_4px_16px_rgba(0,0,0,0.04)]" style={{ borderColor, backgroundColor: cardBg }}>
                <div className="flex flex-col items-center justify-center p-6">
                  <CircularProgress
                    value={dashboard.accuracyPercentage || 0}
                    size={100}
                    variant="gold"
                    label="Accuracy"
                    showValue={true}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={staggerItem}>
              <div className="rounded-xl border p-6 text-center shadow-[0_4px_16px_rgba(0,0,0,0.04)]" style={{ borderColor, backgroundColor: cardBg }}>
                <p className="mb-2 text-sm font-semibold" style={{ color: textMuted }}>Total Quizzes</p>
                <p className="text-5xl font-bold" style={{ color: textPrimary }}>
                  {interviewHistory.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {interviewHistory.length > 0 ? (
          <Timeline>
            {interviewHistory.map((quiz, idx) => {
              const variant = quiz.score >= 80 ? 'success' : quiz.score >= 60 ? 'warning' : 'danger';
              const isExpanded = expandedQuiz === quiz.id;

              return (
                <TimelineItem
                  key={quiz.id}
                  icon={<QuizIcon score={quiz.score} />}
                  variant={variant}
                  isLast={idx === interviewHistory.length - 1}
                >
                  <div className="overflow-hidden rounded-xl border shadow-[0_4px_16px_rgba(0,0,0,0.04)]" style={{ borderColor, backgroundColor: cardBg }}>
                    <div
                      onClick={() => setExpandedQuiz(isExpanded ? null : quiz.id)}
                      className="cursor-pointer p-6 transition-all duration-200"
                      style={{ backgroundColor: isDark ? '#111827' : '#FFFFFF' }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-semibold" style={{ color: "#4F46E5" }}>
                              #{interviewHistory.length - idx}
                            </span>
                            <ScoreBadge score={quiz.score} />
                            {quiz.score >= 80 && (
                              <span className="rounded-full border px-2 py-1 text-xs font-semibold" style={{ backgroundColor: "#ECFDF5", color: "#22C55E", borderColor: "#BBF7D0" }}>
                                Excellent
                              </span>
                            )}
                          </div>
                          <h3 className="mb-1 text-xl font-semibold" style={{ color: textPrimary }}>
                            {new Date(quiz.createdAt).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </h3>
                          <p className="text-sm" style={{ color: textSecondary }}>
                            {quiz.correctAnswers}/{quiz.totalQuestions} correct • {quiz.score}% score
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedQuiz(isExpanded ? null : quiz.id);
                            }}
                            className="border"
                            style={{ borderColor, backgroundColor: cardBg, color: textSecondary }}
                          >
                            {isExpanded ? 'Hide' : 'View'} Details
                          </Button>
                        </div>
                      </div>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t"
                          style={{ borderColor }}
                        >
                          <div className="p-6 space-y-6">
                            <div className="grid gap-4 sm:grid-cols-4">
                              <div className="rounded-lg border p-4 text-center" style={{ borderColor, backgroundColor: cardBg }}>
                                <p className="mb-2 text-sm" style={{ color: textMuted }}>Score</p>
                                <p className="text-3xl font-bold" style={{ color: "#22C55E" }}>
                                  {quiz.score}%
                                </p>
                              </div>
                              <div className="rounded-lg border p-4 text-center" style={{ borderColor, backgroundColor: cardBg }}>
                                <p className="mb-2 text-sm" style={{ color: textMuted }}>Accuracy</p>
                                <p className="text-3xl font-bold" style={{ color: "#F59E0B" }}>
                                  {quiz.accuracy || 0}%
                                </p>
                              </div>
                              <div className="rounded-lg border p-4 text-center" style={{ borderColor, backgroundColor: cardBg }}>
                                <p className="mb-2 text-sm" style={{ color: textMuted }}>Correct</p>
                                <p className="text-3xl font-bold" style={{ color: "#22C55E" }}>
                                  {quiz.correctAnswers}
                                </p>
                              </div>
                              <div className="rounded-lg border p-4 text-center" style={{ borderColor, backgroundColor: cardBg }}>
                                <p className="mb-2 text-sm" style={{ color: textMuted }}>Incorrect</p>
                                <p className="text-3xl font-bold" style={{ color: "#EF4444" }}>
                                  {quiz.totalQuestions - quiz.correctAnswers}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold" style={{ color: textPrimary }}>
                                Questions Review
                              </h4>
                              <motion.div
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                                className="space-y-4"
                              >
                                {(quiz.questions || []).map((q, qIdx) => {
                                  const isCorrect = q.userAnswer === q.correctAnswer;
                                  return (
                                    <motion.div key={qIdx} variants={staggerItem}>
                                      <div className="space-y-3 rounded-lg border p-4" style={{ borderColor, backgroundColor: cardBg }}>
                                        <div className="flex items-start gap-3">
                                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}>
                                            {qIdx + 1}
                                          </span>
                                          <div className="flex-1">
                                            <p className="mb-3 text-base font-medium" style={{ color: textPrimary }}>
                                              {q.question}
                                            </p>
                                            <div className="space-y-2">
                                              {(q.options || []).map((option, optIdx) => {
                                                const isUserAnswer = q.userAnswer === optIdx;
                                                const isCorrectAnswer = q.correctAnswer === optIdx;

                                                let className = 'flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all ';
                                                let icon = null;

                                                if (isUserAnswer && isCorrect) {
                                                  className += 'border';
                                                } else if (isUserAnswer && !isCorrect) {
                                                  className += 'border';
                                                } else if (isCorrectAnswer && !isCorrect) {
                                                  className += 'border';
                                                } else {
                                                  className += 'border';
                                                }

                                                const style = isUserAnswer && isCorrect
                                                  ? { backgroundColor: '#ECFDF5', borderColor: '#22C55E', color: '#166534' }
                                                  : isUserAnswer && !isCorrect
                                                    ? { backgroundColor: '#FEF2F2', borderColor: '#EF4444', color: '#991B1B' }
                                                    : isCorrectAnswer && !isCorrect
                                                      ? { backgroundColor: '#ECFDF5', borderColor: '#22C55E', color: '#166534' }
                                                      : { backgroundColor: cardBg, borderColor, color: textPrimary };

                                                return (
                                                  <div key={optIdx} className={className} style={style}>
                                                    {icon}
                                                    <span className="flex-1" style={{ color: '#0F172A' }}>{option}</span>
                                                    {isUserAnswer && (
                                                      <GradientBadge variant={isCorrect ? 'success' : 'danger'} size="sm">
                                                        Your answer
                                                      </GradientBadge>
                                                    )}
                                                    {isCorrectAnswer && !isUserAnswer && (
                                                      <GradientBadge variant="success" size="sm">
                                                        Correct
                                                      </GradientBadge>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>

                                            {!isCorrect && q.feedback && (
                                              <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-4 rounded-lg border p-4"
                                                style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}
                                              >
                                                <div className="flex items-start gap-2">
                                                  <span className="text-xl">💡</span>
                                                  <div>
                                                    <p className="mb-1 font-semibold" style={{ color: '#1D4ED8' }}>Feedback</p>
                                                    <p className="text-sm" style={{ color: '#1E3A8A' }}>{q.feedback}</p>
                                                  </div>
                                                </div>
                                              </motion.div>
                                            )}

                                            <div className="mt-3 flex gap-2">
                                              <GradientBadge variant="royal" size="sm">{q.topic}</GradientBadge>
                                              <GradientBadge
                                                variant={
                                                  q.difficulty === 'Easy' ? 'success' :
                                                    q.difficulty === 'Medium' ? 'warning' : 'danger'
                                                }
                                                size="sm"
                                              >
                                                {q.difficulty}
                                              </GradientBadge>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </TimelineItem>
              );
            })}
          </Timeline>
        ) : (
          <div className="rounded-xl border-2 border-dashed" style={{ borderColor: isDark ? '#475569' : '#CBD5E1', backgroundColor: cardBg }}>
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="mb-6">
                  <svg className="h-24 w-24 mx-auto" style={{ color: textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-2xl font-bold" style={{ color: textPrimary }}>
                  No quiz history yet
                </h3>
                <p className="mb-6" style={{ color: textSecondary }}>
                  Start your first practice session to see your results here
                </p>
                <Link to="/practice">
                  <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700">Start Your First Quiz</Button>
                </Link>
              </motion.div>
            </div>
          </div>
        )}

        {codingHistory.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: textPrimary }}>
                Coding <span style={{ color: "#4F46E5" }}>Attempts</span>
              </h2>
              <p className="mt-1 text-sm" style={{ color: textSecondary }}>
                Track your compiler practice submissions and pass rates.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {codingHistory.map((attempt) => (
                <div
                  key={attempt.id}
                  className="rounded-xl border p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                  style={{ borderColor, backgroundColor: cardBg }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold" style={{ color: textPrimary }}>{attempt.title}</p>
                      <p className="mt-1 text-sm" style={{ color: textSecondary }}>
                        {new Date(attempt.createdAt).toLocaleDateString()} • {attempt.language}
                      </p>
                    </div>
                    <GradientBadge
                      variant={attempt.difficulty === "easy" ? "success" : attempt.difficulty === "medium" ? "warning" : "danger"}
                      size="sm"
                    >
                      {attempt.difficulty}
                    </GradientBadge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3" style={{ borderColor, backgroundColor: isDark ? '#0B1220' : '#F8FAFC' }}>
                      <p className="text-xs" style={{ color: textMuted }}>Score</p>
                      <p className="text-xl font-bold" style={{ color: textPrimary }}>{attempt.score}%</p>
                    </div>
                    <div className="rounded-lg border p-3" style={{ borderColor, backgroundColor: isDark ? '#0B1220' : '#F8FAFC' }}>
                      <p className="text-xs" style={{ color: textMuted }}>Passed Tests</p>
                      <p className="text-xl font-bold" style={{ color: textPrimary }}>
                        {attempt.passedTests}/{attempt.totalTests}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {interviewResults.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: textPrimary }}>
                Interview <span style={{ color: "#4F46E5" }}>Evaluations</span>
              </h2>
              <p className="mt-1 text-sm" style={{ color: textSecondary }}>
                Ratings and recruiter feedback from completed live interviews.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {interviewResults.map((result) => (
                <div
                  key={result.id}
                  className="rounded-xl border p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                  style={{ borderColor, backgroundColor: cardBg }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold" style={{ color: textPrimary }}>
                        Overall Score: {result.overallScore}%
                      </p>
                      <p className="mt-1 text-sm" style={{ color: textSecondary }}>
                        {new Date(result.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <GradientBadge variant={result.overallScore >= 80 ? "success" : result.overallScore >= 60 ? "warning" : "danger"} size="sm">
                      {result.overallScore}%
                    </GradientBadge>
                  </div>

                  <p className="mt-3 text-sm" style={{ color: textSecondary }}>
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
      </div>
    </DashboardLayout>
  );
}
