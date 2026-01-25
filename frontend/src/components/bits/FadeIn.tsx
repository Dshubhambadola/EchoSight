import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: delay }}
        className={className}
    >
        {children}
    </motion.div>
);
