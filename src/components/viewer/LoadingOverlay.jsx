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
          <motion.div
            className="mt-6 flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="w-8 h-8 rounded-full border-2 border-rose-300 border-t-transparent animate-spin" />
            <p className="text-xs text-rose-400/60 font-light tracking-wider">
              模型加载中...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoadingOverlay;
