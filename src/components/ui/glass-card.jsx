import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function GlassCard({ children, className, hover = true, ...props }) {
    return (
        <motion.div
            className={cn(
                "glass rounded-2xl p-6 transition-all duration-300",
                hover && "hover:shadow-glow hover:-translate-y-1",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}
