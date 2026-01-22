import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function GradientBadge({
    children,
    variant = 'royal',
    size = 'md',
    className
}) {
    const variants = {
        royal: 'bg-gradient-to-r from-royal-500 to-purple-500 shadow-glow',
        emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-glow',
        gold: 'bg-gradient-to-r from-gold-500 to-amber-500 shadow-gold-glow',
        success: 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-emerald-glow',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-gold-glow',
        danger: 'bg-gradient-to-r from-red-500 to-pink-500 shadow-glow',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    return (
        <motion.span
            className={cn(
                'inline-flex items-center rounded-full font-semibold text-white',
                variants[variant],
                sizes[size],
                className
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </motion.span>
    );
}
