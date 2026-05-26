import { motion, AnimatePresence } from "framer-motion";

const BAR_COLORS = [
  "bg-gray-200",
  "bg-gray-300",
  "bg-rose-200",
  "bg-rose-300",
  "bg-rose-400",
];

const BAR_WIDTHS = ["32%", "40%", "50%", "58%", "62%"];

const barVariants = {
  hidden: { opacity: 0, x: -28, y: 0 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    y: [0, -3, 0],
    transition: {
      opacity: { delay: i * 0.18, duration: 0.55, ease: "easeOut" },
      x: { delay: i * 0.18, duration: 0.6, ease: "easeOut" },
      y: {
        delay: i * 0.18 + 0.6,
        duration: 1.8,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  }),
  exit: {
    opacity: 0,
    transition: { duration: 0.35, ease: "easeIn" },
  },
};

const containerVariants = {
  exit: {
    opacity: 0,
    transition: { duration: 0.4, ease: "easeIn" },
  },
};

function LoadingOverlay({ isLoading }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#FAFAFA]/75 backdrop-blur-md"
          variants={containerVariants}
          exit="exit"
        >
          <div className="flex flex-col items-center gap-3">
            {BAR_COLORS.map((color, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={barVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`h-1 rounded-full ${color} ${i === BAR_COLORS.length - 1 ? "shadow-[0_0_10px_rgba(255,61,88,0.25)]" : ""}`}
                style={{ width: BAR_WIDTHS[i] }}
              />
            ))}
          </div>
          <motion.p
            className="mt-7 text-[11px] text-rose-500/50 font-light tracking-[0.2em] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            Loading
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoadingOverlay;
