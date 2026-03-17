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

    const ringColors = {
        primary: '#4F46E5',
        accent: '#7C3AED',
        success: '#22C55E',
        emerald: '#22C55E',
        gold: '#F59E0B',
        danger: '#EF4444',
        royal: '#4F46E5',
    };

    const ringColor = ringColors[variant] || '#4F46E5';

    const glowVariants = {
        primary: 'opacity-95',
        accent: 'opacity-95',
        success: 'opacity-95',
        emerald: 'opacity-95',
        gold: 'opacity-95',
        danger: 'opacity-95',
        royal: 'opacity-95',
    };

    return (
        <div className={cn('relative inline-flex items-center justify-center', className)}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-slate-200 dark:text-slate-600/30"
                />

                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    className={cn(glowVariants[variant])}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                        strokeDasharray: circumference,
                        color: ringColor,
                    }}
                />
            </svg>


            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                {showValue && (
                    <motion.span
                        className="text-[28px] font-bold leading-none text-slate-900 [text-shadow:0_1px_0_rgba(15,23,42,0.55),0_0_2px_rgba(15,23,42,0.35)] [-webkit-text-stroke:0.6px_rgba(15,23,42,0.45)] dark:text-white dark:[text-shadow:0_1px_0_rgba(0,0,0,0.85),0_0_2px_rgba(0,0,0,0.75)] dark:[-webkit-text-stroke:0.6px_rgba(0,0,0,0.85)]"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {value}%
                    </motion.span>
                )}
                {label && (
                    <span className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
                )}
            </div>
        </div>
    );
}
