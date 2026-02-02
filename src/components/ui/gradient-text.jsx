import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function GradientText({ children, className, gradient = 'primary', ...props }) {
    const gradients = {
        primary: 'linear-gradient(135deg, var(--gradient-primary-start) 0%, var(--gradient-primary-end) 100%)',
        success: 'linear-gradient(135deg, var(--gradient-success-start) 0%, var(--gradient-success-end) 100%)',
        accent: 'linear-gradient(135deg, var(--gradient-accent-start) 0%, var(--gradient-accent-end) 100%)',
        cyan: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
        teal: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    };

    return (
        <span
            className={cn(
                "bg-clip-text text-transparent",
                className
            )}
            style={{
                backgroundImage: gradients[gradient],
                backgroundSize: '200% auto',
            }}
            {...props}
        >
            {children}
        </span>
    );
}
