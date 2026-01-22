import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../../utils/animation-variants';

export function PageTransition({ children }) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                {...pageTransition}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
