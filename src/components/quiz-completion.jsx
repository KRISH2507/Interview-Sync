import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Confetti } from './animations/confetti';
import { Button } from './ui/button';
import { GlassCard } from './ui/glass-card';
import { GradientText } from './ui/gradient-text';
import { fadeUp, scaleIn } from '../utils/animation-variants';

export function QuizCompletion(props) {
    const navigate = useNavigate();
    const location = useLocation();

    // Merge props from parent and navigation state
    const {
        score,
        totalQuestions,
        correctAnswers
    } = { ...props, ...location.state };

    const percentage = typeof score === 'number'
        ? score
        : (totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0);

    // Determine result type based on score
    const getResultType = () => {
        if (percentage >= 80) return 'high';
        if (percentage >= 60) return 'medium';
        return 'low';
    };

    const resultType = getResultType();

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]/95 backdrop-blur-sm p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Confetti for high scores */}
                {resultType === 'high' && <Confetti />}

                <motion.div
                    className="w-full max-w-2xl relative"
                    variants={scaleIn}
                    initial="initial"
                    animate="animate"
                >
                    <GlassCard className="border-2 border-white/10 shadow-2xl overflow-hidden relative">
                        {/* Background gradients */}
                        <div className={`absolute -top-20 -left-20 w-40 h-40 bg-${resultType === 'high' ? 'yellow' : resultType === 'medium' ? 'blue' : 'purple'}-500/20 blur-[60px] rounded-full`} />
                        <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-${resultType === 'high' ? 'orange' : resultType === 'medium' ? 'cyan' : 'pink'}-500/20 blur-[60px] rounded-full`} />

                        <div className="p-8 sm:p-12 text-center space-y-8 relative z-10">
                            {/* Icon/Badge - Using pure CSS/Framer for badge */}
                            <motion.div
                                className="flex justify-center"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            >
                                {resultType === 'high' && (
                                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-600 shadow-glow flex items-center justify-center text-5xl">
                                        🏆
                                    </div>
                                )}
                                {resultType === 'medium' && (
                                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 shadow-glow flex items-center justify-center text-5xl">
                                        ⭐
                                    </div>
                                )}
                                {resultType === 'low' && (
                                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600 shadow-glow flex items-center justify-center text-5xl">
                                        📈
                                    </div>
                                )}
                            </motion.div>

                            {/* Title */}
                            <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
                                <h2 className="text-3xl sm:text-4xl font-bold">
                                    {resultType === 'high' && <GradientText gradient="gold">Outstanding!</GradientText>}
                                    {resultType === 'medium' && <GradientText gradient="royal">Good Job!</GradientText>}
                                    {resultType === 'low' && <GradientText gradient="royal">Keep Learning!</GradientText>}
                                </h2>
                                <p className="mt-4 text-lg text-slate-300">
                                    {resultType === 'high' && 'You\'re crushing it! Your hard work is paying off.'}
                                    {resultType === 'medium' && 'You\'re making great progress. Keep practicing!'}
                                    {resultType === 'low' && 'Every expert was once a beginner. Keep going!'}
                                </p>
                            </motion.div>

                            {/* Score Display */}
                            <motion.div
                                className="space-y-2 py-4"
                                variants={fadeUp}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.4 }}
                            >
                                <div className="text-7xl sm:text-8xl font-black text-white tracking-tighter drop-shadow-lg">
                                    {percentage}%
                                </div>
                                <div className="text-xl font-medium text-slate-400">
                                    {correctAnswers} out of {totalQuestions} correct
                                </div>
                            </motion.div>

                            {/* Stats Grid */}
                            <motion.div
                                className="grid grid-cols-3 gap-4"
                                variants={fadeUp}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.5 }}
                            >
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                    <div className="text-2xl font-bold text-emerald-400">{correctAnswers}</div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-emerald-500/70">Correct</div>
                                </div>
                                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                                    <div className="text-2xl font-bold text-red-400">{totalQuestions - correctAnswers}</div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-red-500/70">Incorrect</div>
                                </div>
                                <div className="rounded-xl border border-royal-500/20 bg-royal-500/10 p-4">
                                    <div className="text-2xl font-bold text-royal-400">{percentage}%</div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-royal-500/70">Score</div>
                                </div>
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
                                variants={fadeUp}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.6 }}
                            >
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/candidate/dashboard')}
                                    className="min-w-[160px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-foreground"
                                >
                                    Dashboard
                                </Button>
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/practice')}
                                    className="min-w-[160px] bg-gradient-to-r from-royal-600 to-purple-600 hover:from-royal-500 hover:to-purple-500 border-0 shadow-lg shadow-royal-500/20"
                                >
                                    Try Another
                                </Button>
                            </motion.div>
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
