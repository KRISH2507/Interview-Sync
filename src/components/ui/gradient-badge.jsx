import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function GradientBadge({
    children,
    variant = 'primary',
    size = 'md',
    className
}) {
    const variants = {
        primary: 'bg-gradient-primary shadow-md text-white',
        accent: 'bg-gradient-accent shadow-accent-glow text-white',
        success: 'bg-gradient-success shadow-success-glow text-white',
        warning: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-md text-white',
        danger: 'bg-gradient-to-r from-red-500 to-rose-500 shadow-md text-white',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm',
    };

    const sizes = {
        sm: 'px-2.5 py-1 text-xs font-medium',
        md: 'px-3 py-1.5 text-sm font-medium',
        lg: 'px-4 py-2 text-base font-semibold',
    };

    return (
        <motion.span
            className={cn(
                'inline-flex items-center justify-center rounded-full',
                variants[variant],
                sizes[size],
                className
            )}
            whileHover={{ scale: 1.05 }}
        >
            {children}
        </motion.span>
    );
}
