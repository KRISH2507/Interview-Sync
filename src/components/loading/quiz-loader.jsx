import { motion } from 'framer-motion';
import { fadeIn } from '../../utils/animation-variants';

const loadingMessages = [
    "Preparing your questions...",
    "Analyzing your skills...",
    "Getting things ready...",
    "Almost there...",
    "Crafting the perfect quiz...",
];

export function QuizLoader() {
    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

    return (
        <motion.div
            className="flex flex-col items-center justify-center py-16"
            {...fadeIn}
        >
            <div className="relative mb-6">
                <motion.div
                    className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center"
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <svg
                        className="h-8 w-8 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                    </svg>
                </motion.div>

                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute h-2 w-2 rounded-full bg-primary"
                        style={{
                            top: '50%',
                            left: '50%',
                        }}
                        animate={{
                            x: [0, 30, 0, -30, 0],
                            y: [0, -30, 0, 30, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            <motion.p
                className="text-lg font-medium text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {randomMessage}
            </motion.p>

            <motion.div
                className="mt-4 flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="h-2 w-2 rounded-full bg-primary"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                        }}
                    />
                ))}
            </motion.div>
        </motion.div>
    );
}
