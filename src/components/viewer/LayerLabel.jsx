import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

const CARD_WIDTH = 210;
const CARD_HEIGHT = 160;
const MARGIN = 8;

const isTouchDevice =
  typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;

const springTransition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  mass: 0.8,
};

function LayerLabel({ layer, screenX, screenY, onClose }) {
  const cardRef = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    let left = screenX - CARD_WIDTH / 2;
    let top = screenY - CARD_HEIGHT / 2;

    if (isTouchDevice) {
      top -= 12;
    }

    if (left < MARGIN) {
      left = MARGIN;
    }
    if (left + CARD_WIDTH > window.innerWidth - MARGIN) {
      left = window.innerWidth - CARD_WIDTH - MARGIN;
    }
    if (top < MARGIN) {
      top = MARGIN;
    }
    if (top + CARD_HEIGHT > window.innerHeight - MARGIN) {
      top = window.innerHeight - CARD_HEIGHT - MARGIN;
    }

    setPos({ left, top });
  }, [screenX, screenY]);

  return (
    <motion.div
      ref={cardRef}
      className="fixed z-50 pointer-events-auto"
      style={{ left: pos.left, top: pos.top }}
      initial={{ opacity: 0, scale: 0.92, y: 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      exit={{
        opacity: 0,
        scale: 0.95,
        y: 4,
        filter: "blur(4px)",
        transition: { duration: 0.25, ease: "easeInOut" },
      }}
      transition={{
        opacity: { ...springTransition, delay: 0.1 },
        scale: { ...springTransition, delay: 0.1 },
        y: { ...springTransition, delay: 0.1 },
        filter: { duration: 0.4, ease: "easeOut", delay: 0.1 },
      }}
    >
      <div
        className="relative bg-white/85 backdrop-blur-xl text-gray-700 text-xs
          rounded-2xl px-4 py-3
          shadow-[0_8px_30px_rgba(0,0,0,0.08)]
          border border-gray-200/50 min-w-[180px] max-w-[220px]"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full
            flex items-center justify-center
            text-gray-400 hover:text-gray-600 hover:bg-gray-100
            transition-colors"
        >
          ×
        </button>

        <h3
          className="font-bold text-sm mb-2 pb-1.5 border-b border-gray-200/50 tracking-tight pr-4"
          style={{ color: layer.color }}
        >
          {layer.name}
        </h3>
        <p className="text-gray-500 mb-0.5">
          <span className="text-gray-400">材料：</span>
          {layer.material}
        </p>
        <p className="text-gray-500 mb-0.5 tabular-nums">
          <span className="text-gray-400">厚度：</span>
          {(layer.thickness * 1000).toFixed(0)} mm
        </p>
        <p className="text-gray-400 leading-relaxed mt-2 text-[11px]">
          {layer.description}
        </p>
      </div>
    </motion.div>
  );
}

export default LayerLabel;
