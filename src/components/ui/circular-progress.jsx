import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function CircularProgress({
    value = 0,
    size = 120,
    strokeWidth = 8,
    variant = 'primary',
    showValue = true,
    label = '',
    className
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    const variants = {
        primary: 'stroke-blue-500 dark:stroke-cyan-400',
        accent: 'stroke-violet-500 dark:stroke-violet-400',
        success: 'stroke-green-500 dark:stroke-teal-400',
        emerald: 'stroke-emerald-500 dark:stroke-emerald-400',
        gold: 'stroke-amber-500 dark:stroke-amber-400',
        royal: 'stroke-indigo-600 dark:stroke-indigo-400',
    };

    const glowVariants = {
        primary: 'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] dark:drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]',
        accent: 'drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]',
        success: 'drop-shadow-[0_0_10px_rgba(34,197,94,0.6)] dark:drop-shadow-[0_0_10px_rgba(13,148,136,0.6)]',
        emerald: 'drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]',
        gold: 'drop-shadow-[0_0_10px_rgba(217,119,6,0.6)] dark:drop-shadow-[0_0_10px_rgba(217,119,6,0.6)]',
        royal: 'drop-shadow-[0_0_10px_rgba(79,70,229,0.6)]',
    };

    return (
        <div className={cn('relative inline-flex items-center justify-center', className)}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-gray-300 dark:text-slate-600/20"
                />

                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    className={cn(variants[variant], glowVariants[variant])}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                        strokeDasharray: circumference,
                    }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showValue && (
                    <motion.span
                        className="text-2xl font-bold text-slate-950 dark:text-white"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {value}%
                    </motion.span>
                )}
                {label && (
                    <span className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">{label}</span>
                )}
            </div>
        </div>
    );
}
