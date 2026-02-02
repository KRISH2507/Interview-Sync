import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Link } from 'react-router-dom';

import { Button } from './ui/button';
import { GlassCard } from './ui/glass-card';
import { GradientText } from './ui/gradient-text';
import { GradientBadge } from './ui/gradient-badge';
import { CircularProgress } from './ui/circular-progress';
import { Timeline, TimelineItem } from './ui/timeline';
import { FloatingOrb } from './ui/floating-orb';
import DashboardLayout from './dashboard-layout';
import { DashboardSkeleton } from "./loading/dashboard-skeleton";
import { staggerContainer, staggerItem } from '../utils/animation-variants';

/* Score Badge Component */
function ScoreBadge({ score }) {
  const getVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return <GradientBadge variant={getVariant(score)}>{score}%</GradientBadge>;
}

/* Quiz Icon Component */
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

export default function QuizHistory() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.get('/dashboard');
        setDashboard(res.data);
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

  return (
    <DashboardLayout role="candidate">
      {/* Floating Orbs Background */}
      <FloatingOrb color="royal" size="lg" className="top-0 right-0" />
      <FloatingOrb color="emerald" size="md" className="bottom-20 left-10" delay={2} />
      <FloatingOrb color="purple" size="sm" className="top-40 right-20" delay={4} />

      <div className="relative space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold">
            <GradientText variant="royal">Quiz History</GradientText>
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Track your progress and review past quiz sessions
          </p>
        </motion.div>

        {/* Stats Overview */}
        {interviewHistory.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-6 sm:grid-cols-3"
          >
            <motion.div variants={staggerItem}>
              <GlassCard className="text-center">
                <div className="flex flex-col items-center justify-center p-6">
                  <CircularProgress
                    value={dashboard.averageScore || 0}
                    size={100}
                    variant="royal"
                    label="Avg Score"
                    showValue={true}
                  />
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <GlassCard className="text-center">
                <div className="flex flex-col items-center justify-center p-6">
                  <CircularProgress
                    value={dashboard.accuracyPercentage || 0}
                    size={100}
                    variant="gold"
                    label="Accuracy"
                    showValue={true}
                  />
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <GlassCard className="text-center p-6">
                <p className="text-sm font-semibold text-foreground mb-2">Total Quizzes</p>
                <p className="text-5xl font-bold text-foreground">
                  {interviewHistory.length}
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}

        {/* Timeline */}
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
                  <GlassCard className={`overflow-hidden ${quiz.score >= 80 ? 'border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/5 to-transparent' : ''}`}>
                    {/* Header */}
                    <div
                      onClick={() => setExpandedQuiz(isExpanded ? null : quiz.id)}
                      className="cursor-pointer p-6 transition-all hover:bg-white/5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-semibold text-royal-400">
                              #{interviewHistory.length - idx}
                            </span>
                            <ScoreBadge score={quiz.score} />
                            {quiz.score >= 80 && (
                              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Excellent
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-1">
                            {new Date(quiz.createdAt).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {quiz.correctAnswers}/{quiz.totalQuestions} correct • {quiz.score}% score
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <CircularProgress
                            value={quiz.score}
                            size={80}
                            strokeWidth={6}
                            variant={variant === 'success' ? 'emerald' : variant === 'warning' ? 'gold' : 'royal'}
                            showValue={false}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedQuiz(isExpanded ? null : quiz.id);
                            }}
                          >
                            {isExpanded ? 'Hide' : 'View'} Details
                          </Button>
                        </div>
                      </div>
                    </div>                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-white/10"
                        >
                          <div className="p-6 space-y-6">
                            {/* Summary Stats */}
                            <div className="grid gap-4 sm:grid-cols-4">
                              <GlassCard className="p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Score</p>
                                <p className="text-3xl font-bold">
                                  <GradientText variant="royal">{quiz.score}%</GradientText>
                                </p>
                              </GlassCard>
                              <GlassCard className="p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Accuracy</p>
                                <p className="text-3xl font-bold">
                                  <GradientText variant="gold">{quiz.accuracy || 0}%</GradientText>
                                </p>
                              </GlassCard>
                              <GlassCard className="p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Correct</p>
                                <p className="text-3xl font-bold">
                                  <GradientText variant="emerald">{quiz.correctAnswers}</GradientText>
                                </p>
                              </GlassCard>
                              <GlassCard className="p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Incorrect</p>
                                <p className="text-3xl font-bold">
                                  <GradientText variant="gold">{quiz.totalQuestions - quiz.correctAnswers}</GradientText>
                                </p>
                              </GlassCard>
                            </div>

                            {/* Questions Review */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold">
                                <GradientText variant="royal">Questions Review</GradientText>
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
                                      <GlassCard className="p-4 space-y-3">
                                        <div className="flex items-start gap-3">
                                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-royal-500 to-purple-600 text-sm font-bold text-white shadow-glow">
                                            {qIdx + 1}
                                          </span>
                                          <div className="flex-1">
                                            <p className="font-medium text-foreground text-base mb-3">
                                              {q.question}
                                            </p>
                                            <div className="space-y-2">
                                              {(q.options || []).map((option, optIdx) => {
                                                const isUserAnswer = q.userAnswer === optIdx;
                                                const isCorrectAnswer = q.correctAnswer === optIdx;

                                                let className = 'rounded-lg px-4 py-3 text-sm flex items-center gap-3 transition-all ';
                                                let icon = null;

                                                if (isUserAnswer && isCorrect) {
                                                  className += 'bg-emerald-500/20 border-2 border-emerald-500/50 shadow-emerald-glow';
                                                  icon = (
                                                    <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                  );
                                                } else if (isUserAnswer && !isCorrect) {
                                                  className += 'bg-red-500/20 border-2 border-red-500/50 shadow-glow';
                                                  icon = (
                                                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                  );
                                                } else if (isCorrectAnswer && !isCorrect) {
                                                  className += 'bg-emerald-500/10 border-2 border-emerald-500/30';
                                                  icon = (
                                                    <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                  );
                                                } else {
                                                  className += 'bg-slate-800/30 border-2 border-transparent';
                                                }

                                                return (
                                                  <div key={optIdx} className={className}>
                                                    {icon}
                                                    <span className="flex-1 text-foreground">{option}</span>
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
                                                className="mt-4 rounded-lg bg-blue-500/10 p-4 border border-blue-500/30"
                                              >
                                                <div className="flex items-start gap-2">
                                                  <span className="text-xl">💡</span>
                                                  <div>
                                                    <p className="font-semibold text-blue-400 mb-1">Feedback</p>
                                                    <p className="text-sm text-blue-300">{q.feedback}</p>
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
                                      </GlassCard>
                                    </motion.div>
                                  );
                                })}
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </TimelineItem>
              );
            })}
          </Timeline>
        ) : (
          <GlassCard className="border-dashed border-2">
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="mb-6">
                  <svg className="h-24 w-24 mx-auto text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  <GradientText variant="royal">No quiz history yet</GradientText>
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start your first practice session to see your results here
                </p>
                <Link to="/practice">
                  <Button size="lg">Start Your First Quiz</Button>
                </Link>
              </motion.div>
            </div>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
}
