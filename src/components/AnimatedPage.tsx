import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function AnimatedPage({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 flex flex-col overflow-y-auto"
    >
      {children}
    </motion.div>
  );
}
