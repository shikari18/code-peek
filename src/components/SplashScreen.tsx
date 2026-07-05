import { motion } from "framer-motion";

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-foreground"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <div className="h-16 w-16 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 grid place-items-center">
          <svg viewBox="0 0 32 32" className="h-8 w-8 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 24 C4 18 10 14 16 14 C22 14 28 18 28 24" />
            <circle cx="16" cy="9" r="4" />
            <path d="M10 24 Q16 20 22 24" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-primary-foreground font-bold text-xl tracking-tight">Fish Doctor</p>
          <p className="text-primary-foreground/50 text-xs mt-1 tracking-widest uppercase">Smart Aquaculture</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
