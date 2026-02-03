import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ScrollReveal } from '../animations/scroll-reveal';

export function Timeline({ children, className }) {
    return (
        <div className={cn('relative space-y-8', className)}>
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-royal-500/50 via-purple-500/50 to-transparent" />
            {children}
        </div>
    );
}

export function TimelineItem({
    children,
    icon,
    variant = 'default',
    isLast = false,
    className
}) {
    const variants = {
        default: 'bg-slate-800 border-slate-700',
        success: 'bg-emerald-500/20 border-emerald-500/50',
        warning: 'bg-yellow-500/20 border-yellow-500/50',
        danger: 'bg-red-500/20 border-red-500/50',
    };

    const iconVariants = {
        default: 'bg-gradient-to-br from-royal-500 to-purple-600 shadow-glow',
        success: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-glow',
        warning: 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-gold-glow',
        danger: 'bg-gradient-to-br from-red-500 to-pink-600 shadow-glow',
    };

    return (
        <ScrollReveal variant="fade" className="relative pl-16">
            <motion.div
                className={cn(
                    'absolute left-0 flex h-12 w-12 items-center justify-center rounded-full text-white',
                    iconVariants[variant]
                )}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
            >
                {icon}
            </motion.div>

            <div className={cn('relative', className)}>
                {children}
            </div>

            {!isLast && (
                <motion.div
                    className="absolute left-[22px] -bottom-4 h-2 w-2 rounded-full bg-royal-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                />
            )}
        </ScrollReveal>
    );
}
