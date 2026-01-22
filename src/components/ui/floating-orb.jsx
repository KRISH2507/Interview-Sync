import { motion } from 'framer-motion';

export function FloatingOrb({ color = 'royal', size = 'lg', delay = 0, className = '' }) {
    const colors = {
        royal: 'bg-royal-500',
        indigo: 'bg-indigo-600',
        emerald: 'bg-emerald-500',
        gold: 'bg-gold-500',
    };

    const sizes = {
        sm: 'w-32 h-32',
        md: 'w-48 h-48',
        lg: 'w-64 h-64',
        xl: 'w-96 h-96',
    };

    return (
        <motion.div
            className={`absolute rounded-full ${colors[color]} ${sizes[size]} opacity-20 blur-3xl ${className}`}
            animate={{
                x: [0, 30, 0, -30, 0],
                y: [0, -30, 0, 30, 0],
                scale: [1, 1.1, 1, 0.9, 1],
            }}
            transition={{
                duration: 20,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
            }}
        />
    );
}
