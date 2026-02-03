import { useEffect, useState, useCallback } from "react";
import { startInterview, submitInterview } from "../services/api";
import DashboardLayout from "./dashboard-layout";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { GlassCard } from "./ui/glass-card";
import { GradientText } from "./ui/gradient-text";
import { CircularProgress } from "./ui/circular-progress";
import { FloatingOrb } from "./ui/floating-orb";
import { QuizLoader } from "./loading/quiz-loader";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "../utils/animation-variants";

export default function InterviewPractice() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [interviewId, setInterviewId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadInterview() {
      try {
        console.log("Starting interview...");
        const res = await startInterview();
        console.log("Interview response:", res.data);
        console.log("Questions received:", res.data.questions);

        if (!res.data.questions || res.data.questions.length === 0) {
          throw new Error("No questions returned from server");
        }

        setQuestions(res.data.questions);
        setInterviewId(res.data.interviewId);
        setAnswers(new Array(res.data.questions.length).fill(null));
      } catch (err) {
        console.error("Failed to start interview", err);
        const errorMsg = err.response?.data?.message || err.message || "Failed to start interview";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    loadInterview();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading || !questions.length) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const index = parseInt(e.key) - 1;
        if (index < questions[current].options.length) {
          const copy = [...answers];
          copy[current] = index;
          setAnswers(copy);
        }
      }

      if (e.key === 'Enter' && answers[current] !== null) {
        if (current < questions.length - 1) {
          setCurrent(curr => curr + 1);
        } else {
        }
      }

      if (e.key === 'ArrowRight' && answers[current] !== null && current < questions.length - 1) {
        setCurrent(curr => curr + 1);
      }
      if (e.key === 'ArrowLeft' && current > 0) {
        setCurrent(curr => curr - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, questions, current, answers]);

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <QuizLoader />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="candidate">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-center text-destructive mb-4">{error}</p>
            <div className="text-center">
              <Button onClick={() => navigate("/upload")}>Upload Resume</Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <DashboardLayout role="candidate">
        <div className="text-center">No practice questions available right now.</div>
      </DashboardLayout>
    );
  }

  const question = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  const handleSubmit = async () => {
    try {
      const res = await submitInterview(interviewId, answers);

      const totalQ = questions.length || 0;
      const serverScore = typeof res.data.score === 'number' ? res.data.score : 0;
      const correctCalculated = Math.round((serverScore / 100) * totalQ);
      const correctCount = typeof res.data.correctAnswers === 'number' ? res.data.correctAnswers : correctCalculated;

      navigate("/completion", {
        state: {
          score: serverScore,
          totalQuestions: totalQ,
          correctAnswers: correctCount
        }
      });
    } catch (err) {
      console.error("Submission failed", err);
      navigate("/candidate/dashboard");
    }
  };

  return (
    <DashboardLayout role="candidate">
      <FloatingOrb color="purple" size="lg" className="top-10 right-10" />
      <FloatingOrb color="royal" size="md" className="bottom-20 left-20" delay={2} />

      <div className="mx-auto max-w-4xl space-y-8 relative z-10">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <GradientText gradient="royal">Interview Practice</GradientText>
            </h1>
            <p className="text-muted-foreground">
              Question {current + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{Math.round(progress)}%</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <CircularProgress
              value={progress}
              size={50}
              strokeWidth={4}
              showValue={false}
              variant="royal"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            variants={fadeUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <GlassCard className="p-8 min-h-[400px] flex flex-col">
              <div className="space-y-6 flex-1">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-slate-800 text-xs font-semibold text-blue-700 dark:text-royal-300 border border-blue-300 dark:border-royal-500/30">
                  {question.topic || 'General'}
                </span>

                <h2 className="text-2xl font-medium leading-relaxed text-foreground">
                  {question.question}
                </h2>

                <div className="grid gap-3 pt-4">
                  {question.options.map((opt, idx) => {
                    const isSelected = answers[current] === idx;
                    return (
                      <motion.button
                        key={idx}
                        className={`group relative w-full rounded-xl p-4 text-left transition-all border-2 ${isSelected
                          ? "border-blue-500 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 shadow-lg shadow-blue-500/30 scale-[1.02]"
                          : "border-gray-300 dark:border-slate-700 hover:border-blue-400/50 hover:bg-blue-50 dark:hover:bg-slate-800/70 hover:shadow-md"
                          }`}
                        onClick={() => {
                          const copy = [...answers];
                          copy[current] = idx;
                          setAnswers(copy);
                        }}
                        whileHover={{ scale: isSelected ? 1.02 : 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        animate={isSelected ? {
                          borderColor: ["#3b82f6", "#6366f1", "#3b82f6"],
                        } : {}}
                        transition={{
                          borderColor: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold border-2 transition-all ${isSelected
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-600 text-white shadow-md"
                            : "bg-gray-100 dark:bg-slate-800 border-gray-400 dark:border-slate-600 text-gray-700 dark:text-slate-400 group-hover:border-blue-400/50 group-hover:text-blue-600 dark:group-hover:text-blue-300"
                            }`}>
                            {isSelected ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              idx + 1
                            )}
                          </span>
                          <span className={`text-lg transition-all ${isSelected ? "text-blue-700 dark:text-white font-semibold" : "text-gray-800 dark:text-slate-200 font-medium"}`}>
                            {opt}
                          </span>
                        </div>

                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono px-2 py-1 rounded bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx + 1}
                        </span>

                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-royal-500/10 to-purple-500/10 -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 mt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setCurrent(current - 1)}
                  disabled={current === 0}
                  className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground mr-2 hidden sm:inline-block">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border font-mono">Enter</kbd> for next
                  </span>

                  {current < questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrent(current + 1)}
                      disabled={answers[current] === null}
                      className="min-w-[140px] bg-gradient-to-r from-royal-600 to-purple-600 hover:from-royal-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-royal-500/30 hover:shadow-xl hover:shadow-royal-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      Next Question
                      <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={answers[current] === null}
                      className="min-w-[140px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      Finish Practice
                      <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
