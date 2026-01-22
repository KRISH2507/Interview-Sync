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
import { GlassCard } from "./ui/glass-card";
import { GradientText } from "./ui/gradient-text";
import { GradientBadge } from "./ui/gradient-badge";
import { CircularProgress } from "./ui/circular-progress";
import { AnimatedCounter } from "./ui/animated-counter";
import { FloatingOrb } from "./ui/floating-orb";

import DashboardLayout from "./dashboard-layout";
import { DashboardSkeleton } from "./loading/dashboard-skeleton";
import { staggerContainer, staggerItem } from "../utils/animation-variants";

/* TEMP Progress component */
function Progress({ value }) {
  return (
    <div className="h-2 w-full rounded bg-slate-800 dark:bg-slate-800 bg-slate-200">
      <div
        className="h-2 rounded bg-blue-600 transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/* Score Badge Component */
function ScoreBadge({ score }) {
  const getVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return <GradientBadge variant={getVariant(score)}>{score}%</GradientBadge>;
}

export default function CandidateDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Use the protected endpoint (no userId needed, JWT handles it)
        const res = await api.get("/dashboard");
        setDashboard(res.data);
      } catch (err) {
        console.error("Failed to load dashboard", err);
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

  const profileCompletion = dashboard?.profileCompletion || 0;
  const resumeScore = dashboard?.resumeScore || 0;
  const totalSessions = dashboard?.totalSessions || 0;
  const interviewReadiness = dashboard?.interviewReadiness || "Beginner";
  const averageScore = dashboard?.averageScore || 0;
  const accuracyPercentage = dashboard?.accuracyPercentage || 0;
  const totalQuestionsAnswered = dashboard?.totalQuestionsAnswered || 0;
  const totalCorrectAnswers = dashboard?.totalCorrectAnswers || 0;
  const interviewHistory = dashboard?.interviewHistory || [];
  const userName = dashboard?.user?.name || "User";

  const latestQuiz = interviewHistory.length > 0 ? interviewHistory[0] : null;

  return (
    <DashboardLayout role="candidate">
      {/* Floating Orbs Background */}
      <FloatingOrb color="royal" size="lg" className="top-0 right-0" />
      <FloatingOrb color="emerald" size="md" className="bottom-20 left-10" delay={2} />
      <FloatingOrb color="purple" size="sm" className="top-40 right-20" delay={4} />

      <div className="relative space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground">
            Welcome back, <GradientText gradient="royal">{userName}</GradientText>! 👋
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
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

        {/* Stats Grid */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >

          <motion.div variants={staggerItem}>
            <GlassCard className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <CircularProgress
                  value={profileCompletion}
                  size={120}
                  variant="royal"
                />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Profile Completion
                  </h3>
                  <p className="text-xs text-muted-foreground/70">
                    Keep practicing to improve
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <GlassCard className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <CircularProgress
                  value={averageScore}
                  size={120}
                  variant="emerald"
                />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Average Score
                  </h3>
                  <p className="text-xs">
                    <GradientBadge variant="royal" size="sm">{interviewReadiness}</GradientBadge>
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <GlassCard className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <CircularProgress
                  value={accuracyPercentage}
                  size={120}
                  variant="gold"
                />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Accuracy Rate
                  </h3>
                  <p className="text-xs text-muted-foreground/70">
                    {totalCorrectAnswers}/{totalQuestionsAnswered} correct
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <GlassCard className="p-6">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="text-6xl font-bold">
                    <AnimatedCounter value={totalSessions} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-royal-500/20 blur-2xl -z-10" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Practice Sessions
                  </h3>
                  <Link to="/practice">
                    <Button className="w-full" size="sm">
                      Start Practice
                    </Button>
                  </Link>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Latest Quiz Results */}
        {latestQuiz && (
          <GlassCard className="overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    <GradientText gradient="royal">Latest Quiz Results</GradientText>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
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
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800/50 p-3 text-center border border-slate-200 dark:border-slate-700/50">
                  <p className="text-xs text-muted-foreground mb-1">Score</p>
                  <p className="font-bold text-lg text-foreground">{latestQuiz.score}%</p>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-3 text-center border border-emerald-500/20">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Correct</p>
                  <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{latestQuiz.correctAnswers}</p>
                </div>
                <div className="rounded-lg bg-red-500/10 p-3 text-center border border-red-500/20">
                  <p className="text-xs text-red-600 dark:text-red-400 mb-1">Incorrect</p>
                  <p className="font-bold text-lg text-red-600 dark:text-red-400">{latestQuiz.totalQuestions - latestQuiz.correctAnswers}</p>
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              {/* Questions Preview (First 3 only) */}
              <div className="divide-y divide-white/5">
                {(latestQuiz.questions || []).slice(0, 3).map((q, idx) => {
                  const isCorrect = q.userAnswer === q.correctAnswer;
                  return (
                    <div key={idx} className="p-6 hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-4">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{q.question}</p>
                          <div className="mt-2 space-y-1">
                            {(q.options || []).map((option, optIdx) => {
                              const isUserAnswer = q.userAnswer === optIdx;
                              const isCorrectAnswer = q.correctAnswer === optIdx;

                              let className = "rounded px-3 py-2 text-sm ";
                              if (isUserAnswer && isCorrect) {
                                className += "bg-green-500/20 text-green-400 border border-green-500/50";
                              } else if (isUserAnswer && !isCorrect) {
                                className += "bg-red-500/20 text-red-400 border border-red-500/50";
                              } else if (isCorrectAnswer && !isCorrect) {
                                className += "bg-green-500/10 text-green-400 border border-green-500/30";
                              } else {
                                className += "bg-slate-700/50 text-muted-foreground";
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
                            <div className="mt-2 rounded bg-blue-500/10 p-3 text-sm text-blue-400">
                              <span className="font-semibold">💡 Feedback: </span>
                              {q.feedback}
                            </div>
                          )}
                          <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                            <span className="rounded bg-slate-700 px-2 py-1">{q.topic}</span>
                            <span className="rounded bg-slate-700 px-2 py-1">{q.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </CardContent>
          </GlassCard>
        )}

        {/* Quiz History */}
        {interviewHistory.length > 0 && (
          <div className="space-y-4">
            {interviewHistory.map((quiz, idx) => (
              <Card key={quiz.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 font-semibold">
                        #{interviewHistory.length - idx}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {new Date(quiz.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </CardTitle>
                        <CardDescription>
                          {quiz.correctAnswers}/{quiz.totalQuestions} correct • {quiz.score}%
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScoreBadge score={quiz.score} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedQuiz(selectedQuiz === quiz.id ? null : quiz.id)}
                      >
                        {selectedQuiz === quiz.id ? 'Hide' : 'View'} Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Details */}
                {selectedQuiz === quiz.id && (
                  <CardContent className="border-t pt-6">
                    <div className="space-y-6">
                      {/* Summary Stats */}
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{quiz.score}%</p>
                        </div>
                        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                          <p className="text-sm text-muted-foreground">Correct Answers</p>
                          <p className="text-2xl font-bold text-green-400 mt-1">{quiz.correctAnswers}</p>
                        </div>
                        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                          <p className="text-sm text-muted-foreground">Incorrect Answers</p>
                          <p className="text-2xl font-bold text-red-400 mt-1">
                            {quiz.totalQuestions - quiz.correctAnswers}
                          </p>
                        </div>
                      </div>

                      {/* Questions */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Questions Review</h3>
                        {(quiz.questions || []).map((q, qIdx) => {
                          const isCorrect = q.userAnswer === q.correctAnswer;
                          return (
                            <div key={qIdx} className="space-y-3 rounded-lg border border-slate-700 bg-slate-800/30 p-4">
                              <div className="flex items-start gap-3">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                                  {qIdx + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground text-base">{q.question}</p>
                                  <div className="mt-3 space-y-2">
                                    {(q.options || []).map((option, optIdx) => {
                                      const isUserAnswer = q.userAnswer === optIdx;
                                      const isCorrectAnswer = q.correctAnswer === optIdx;

                                      let className = "rounded px-3 py-2 text-sm flex items-center gap-2 ";
                                      if (isUserAnswer && isCorrect) {
                                        className += "bg-green-500/20 text-green-400 border border-green-500/50";
                                      } else if (isUserAnswer && !isCorrect) {
                                        className += "bg-red-500/20 text-red-400 border border-red-500/50";
                                      } else if (isCorrectAnswer && !isCorrect) {
                                        className += "bg-green-500/10 text-green-400 border border-green-500/30";
                                      } else {
                                        className += "bg-slate-700/30 text-muted-foreground";
                                      }

                                      return (
                                        <div key={optIdx} className={className}>
                                          <span className="flex-shrink-0">
                                            {isUserAnswer && isCorrect && "✓"}
                                            {isUserAnswer && !isCorrect && "✗"}
                                            {isCorrectAnswer && !isUserAnswer && "✓"}
                                            {!isUserAnswer && !isCorrectAnswer && ""}
                                          </span>
                                          <span className="flex-1">{option}</span>
                                          <span className="text-xs ml-auto">
                                            {isUserAnswer && "(Your answer)"}
                                            {isCorrectAnswer && !isUserAnswer && "(Correct)"}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {!isCorrect && q.feedback && (
                                    <div className="mt-3 rounded bg-blue-500/10 p-3 text-sm text-blue-400 border border-blue-500/30">
                                      <span className="font-semibold block mb-1">💡 Feedback</span>
                                      <p>{q.feedback}</p>
                                    </div>
                                  )}

                                  <div className="mt-3 flex gap-2 text-xs">
                                    <span className="rounded bg-slate-700 px-2 py-1 text-muted-foreground">{q.topic}</span>
                                    <span className={`rounded px-2 py-1 ${q.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                      q.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                      }`}>
                                      {q.difficulty}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {interviewHistory.length === 0 && resumeScore > 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">No quiz history yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start your first practice session to see your results here
                </p>
                <Link to="/practice">
                  <Button className="mt-4">Start Your First Quiz</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout >
  );
}
