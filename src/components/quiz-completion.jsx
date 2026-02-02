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

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]/95 backdrop-blur-sm p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="w-full max-w-2xl relative"
                    variants={scaleIn}
                    initial="initial"
                    animate="animate"
                >
                    <GlassCard className="border-2 border-white/10 shadow-2xl overflow-hidden relative">
                        {/* Background gradients */}
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full" />
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-pink-500/20 blur-[60px] rounded-full" />

                        <div className="p-8 sm:p-12 text-center space-y-8 relative z-10">
                            {/* Icon/Badge */}
                            <motion.div
                                className="flex justify-center"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            >
                                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600 shadow-glow flex items-center justify-center text-5xl">
                                    ✓
                                </div>
                            </motion.div>

                            {/* Message */}
                            <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
                                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                                    Quiz Completed!
                                </h2>
                                <p className="text-lg text-slate-300">
                                    Your responses have been recorded. View your results in history.
                                </p>
                            </motion.div>

                            {/* Single Action Button */}
                            <motion.div
                                className="flex justify-center pt-6"
                                variants={fadeUp}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.6 }}
                            >
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/history')}
                                    className="min-w-[200px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-foreground font-semibold"
                                >
                                    View Result
                                </Button>
                            </motion.div>
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
