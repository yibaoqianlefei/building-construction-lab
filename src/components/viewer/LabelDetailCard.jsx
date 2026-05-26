import { Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

function LabelDetailCard({ layer, position, onClose }) {
  if (!layer) return null;

  return (
    <Html
      center
      position={[position[0], position[1] + 0.18, position[2]]}
      distanceFactor={6}
      occlude={false}
      style={{ pointerEvents: "auto" }}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 4 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/40 shadow-lg min-w-[200px] max-w-[260px]"
        >
          {/* close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer text-sm leading-none"
          >
            &times;
          </button>

          <h3
            className="font-semibold text-sm mb-2 pb-1.5 border-b border-gray-200/50 tracking-tight pr-5"
            style={{ color: layer.color || "#ff3d58" }}
          >
            {layer.name}
          </h3>
          <p className="text-gray-500 text-xs mb-1">
            <span className="text-gray-400">材料：</span>
            {layer.material}
          </p>
          <p className="text-gray-500 text-xs mb-1 tabular-nums">
            <span className="text-gray-400">厚度：</span>
            {(layer.thickness * 1000).toFixed(0)} mm
          </p>
          {layer.description && (
            <p className="text-gray-400 text-[11px] leading-relaxed mt-2">
              {layer.description}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </Html>
  );
}

export default LabelDetailCard;
