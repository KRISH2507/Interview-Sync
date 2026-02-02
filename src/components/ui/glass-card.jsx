import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function GlassCard({ children, className, hover = true, ...props }) {
    return (
        <motion.div
            className={cn(
                "glass rounded-xl p-5 transition-all duration-300 border border-primary/20",
                hover && "hover:shadow-medium hover:-translate-y-0.5 hover:border-primary/40",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}
