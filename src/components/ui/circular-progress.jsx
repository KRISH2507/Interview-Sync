import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function CircularProgress({
    value = 0,
    size = 120,
    strokeWidth = 8,
    variant = 'royal',
    showValue = true,
    label = '',
    className
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    const variants = {
        royal: 'stroke-royal-400',
        emerald: 'stroke-emerald-400',
        gold: 'stroke-gold-400',
        purple: 'stroke-purple-400',
    };

    const glowVariants = {
        royal: 'drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]',
        emerald: 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]',
        gold: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]',
        purple: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]',
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
                    className="text-slate-800/30"
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
                        className="text-2xl font-bold bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        {Math.round(value)}%
                    </motion.span>
                )}
                {label && (
                    <span className="text-xs text-muted-foreground mt-1">{label}</span>
                )}
            </div>
        </div>
    );
}
