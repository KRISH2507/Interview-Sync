import { motion } from 'framer-motion';

export function FloatingOrb({ color = 'primary', size = 'lg', delay = 0, className = '' }) {
    const colors = {
        primary: 'from-cyan-500 to-cyan-600',
        accent: 'from-violet-500 to-violet-600',
        success: 'from-teal-500 to-teal-600',
        emerald: 'from-emerald-500 to-emerald-600',
        rose: 'from-rose-500 to-rose-600',
    };

    const sizes = {
        sm: 'w-32 h-32',
        md: 'w-48 h-48',
        lg: 'w-64 h-64',
        xl: 'w-96 h-96',
    };

    return (
        <motion.div
            className={`absolute rounded-full bg-gradient-to-br ${colors[color]} ${sizes[size]} opacity-15 blur-3xl ${className}`}
            animate={{
                x: [0, 40, 0, -40, 0],
                y: [0, -40, 0, 40, 0],
                scale: [1, 1.15, 1, 0.85, 1],
            }}
            transition={{
                duration: 25,
                ease: "easeInOut",
            }}
        />
    );
}
