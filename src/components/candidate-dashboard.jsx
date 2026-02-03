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
import { Progress } from "./ui/progress";

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
      <FloatingOrb color="primary" size="lg" className="top-0 right-0" />
      <FloatingOrb color="success" size="md" className="bottom-20 left-10" delay={2} />
      <FloatingOrb color="accent" size="sm" className="top-40 right-20" delay={4} />

      <div className="relative space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground">
            Welcome back, <GradientText gradient="primary">{userName}</GradientText>! 👋
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
                  variant="primary"
                  showValue={true}
                />
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Profile Completion
                  </h3>
                  <p className="text-xs text-muted-foreground">
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
                  showValue={true}
                />
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Average Score
                  </h3>
                  <p className="text-xs">
                    <GradientBadge variant="primary" size="sm">{interviewReadiness}</GradientBadge>
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
                  showValue={true}
                />
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Accuracy Rate
                  </h3>
                  <p className="text-xs text-muted-foreground">
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
                  <div className="text-6xl font-bold text-foreground">
                    <AnimatedCounter value={totalSessions} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-2xl -z-10" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
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

        {latestQuiz && (
          <GlassCard className="overflow-hidden">
            <div className="p-6 border-b border-border bg-gradient-to-r from-blue-50/50 to-transparent dark:from-white/5 dark:to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Latest Quiz Results
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
              <div className="divide-y divide-white/5">
                {(latestQuiz.questions || []).slice(0, 5).map((q, idx) => {
                  const isCorrect = q.userAnswer === q.correctAnswer;
                  return (
                    <div key={idx} className="p-6 hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-4">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-900 dark:text-white">
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
                                className += "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/50";
                              } else if (isUserAnswer && !isCorrect) {
                                className += "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/50";
                              } else if (isCorrectAnswer && !isCorrect) {
                                className += "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/30";
                              } else {
                                className += "bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300";
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

        {interviewHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <GlassCard className="p-6 border-dashed border-2 hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    <GradientText gradient="royal">Want to see all your quiz attempts?</GradientText>
                  </h3>
                  <p className="text-sm text-muted-foreground">
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
            </GlassCard>
          </motion.div>
        )}

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
