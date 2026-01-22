import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function GradientText({ children, className, gradient = 'royal', ...props }) {
    const gradients = {
        royal: 'bg-gradient-royal',
        emerald: 'bg-gradient-emerald',
        gold: 'bg-gradient-gold',
    };

    return (
        <span
            className={cn(
                gradients[gradient],
                "bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift",
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
