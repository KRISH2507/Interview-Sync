import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Confetti } from './animations/confetti';
import { Button } from './ui/button';
import { CircularProgress } from './ui/circular-progress';
import DashboardLayout from './dashboard-layout';
import { useTheme } from '../contexts/theme-context';

function ResultStat({ label, value, icon, isDark }) {
    const cardBg = isDark ? '#111827' : '#FFFFFF';
    const borderColor = isDark ? '#334155' : '#E2E8F0';
    const textPrimary = isDark ? '#F1F5F9' : '#0F172A';
    const textSecondary = isDark ? '#CBD5E1' : '#475569';

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-xl border p-4 sm:p-5"
            style={{ backgroundColor: cardBg, borderColor }}
        >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                {icon}
            </div>
            <p className="text-3xl font-bold leading-none" style={{ color: textPrimary }}>{value}</p>
            <p className="mt-2 text-sm font-medium" style={{ color: textSecondary }}>{label}</p>
        </motion.div>
    );
}

export function QuizCompletion(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const {
        score = 0,
        totalQuestions = 0,
        correctAnswers = 0,
        accuracyPercentage,
        mode,
    } = { ...props, ...location.state };

    const incorrectAnswers = totalQuestions - correctAnswers;
    const accuracy = accuracyPercentage !== undefined ? accuracyPercentage : score;

    const textPrimary = isDark ? '#F1F5F9' : '#0F172A';
    const textSecondary = isDark ? '#CBD5E1' : '#475569';
    const cardBg = isDark ? '#111827' : '#FFFFFF';
    const borderColor = isDark ? '#334155' : '#E2E8F0';

    const message = score >= 80
        ? 'Excellent work!'
        : score >= 60
            ? 'Good job! Keep improving.'
            : "Keep practicing. You'll improve.";

    const scoreVariant = score >= 80 ? 'success' : score >= 50 ? 'gold' : 'danger';

    return (
        <DashboardLayout role="candidate">
            {score >= 80 && <Confetti />}

            <div className="mx-auto w-full max-w-4xl">
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-2xl border p-6 sm:p-8"
                    style={{ backgroundColor: cardBg, borderColor }}
                >
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: textPrimary }}>
                            Quiz Results
                        </h1>
                        <p className="mt-2 text-base sm:text-lg font-medium" style={{ color: textSecondary }}>
                            {message}
                        </p>
                        {mode && (
                            <span className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-300">
                                {mode === 'dsa' ? 'DSA Practice' : 'AI Interview'}
                            </span>
                        )}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <CircularProgress
                            value={score}
                            size={170}
                            strokeWidth={10}
                            variant={scoreVariant}
                            label="Score"
                        />
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <ResultStat
                            isDark={isDark}
                            label="Correct Answers"
                            value={correctAnswers}
                            icon={<span className="text-lg">✅</span>}
                        />
                        <ResultStat
                            isDark={isDark}
                            label="Incorrect Answers"
                            value={incorrectAnswers}
                            icon={<span className="text-lg">❌</span>}
                        />
                        <ResultStat
                            isDark={isDark}
                            label="Accuracy"
                            value={`${accuracy}%`}
                            icon={<span className="text-lg">🎯</span>}
                        />
                        <ResultStat
                            isDark={isDark}
                            label="Total Questions"
                            value={totalQuestions}
                            icon={<span className="text-lg">📚</span>}
                        />
                    </div>

                    <div className="mt-8 rounded-xl border p-4 sm:p-5" style={{ borderColor, backgroundColor: isDark ? '#0B1220' : '#F8FAFC' }}>
                        <p className="text-sm sm:text-base font-medium" style={{ color: textPrimary }}>
                            You answered {correctAnswers} out of {totalQuestions} questions correctly.
                        </p>
                        <p className="mt-2 text-sm" style={{ color: textSecondary }}>
                            Topics to review: Coming soon.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button
                            size="lg"
                            variant="default"
                            onClick={() => navigate('/practice')}
                            className="min-w-[170px]"
                        >
                            Practice Again
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => navigate('/history')}
                            className="min-w-[170px]"
                            style={{ borderColor, color: textPrimary }}
                        >
                            View History
                        </Button>
                        <Button
                            size="lg"
                            variant="secondary"
                            onClick={() => navigate('/candidate/dashboard')}
                            className="min-w-[170px]"
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </motion.section>
            </div>
        </DashboardLayout>
    );
}
