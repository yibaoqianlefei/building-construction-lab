import { Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { LayerData } from "../../types";

const LABEL_SCALE = 0.55;

interface SpatialLabelProps {
  layer: LayerData;
  position: number[];
  explodeAxis?: string | null;
  onClose?: () => void;
}

function SpatialLabel({ layer, position, explodeAxis, onClose }: SpatialLabelProps) {
  if (!layer || !position) return null;

  const isX = !explodeAxis || explodeAxis.replace("-", "") === "x";
  const offset: [number, number, number] = isX ? [0, 0.4, 0] : [0, 0, 0.4];

  const worldPos: [number, number, number] = [
    position[0] + offset[0],
    position[1] + offset[1],
    position[2] + offset[2],
  ];

  return (
    <Html
      position={worldPos}
      center
      scale={LABEL_SCALE}
      style={{ pointerEvents: "none" }}
    >
      <AnimatePresence>
        <motion.div
          initial={{ y: 8, scale: 0.92, opacity: 0, filter: "blur(2px)" }}
          animate={{ y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -6, scale: 0.92, opacity: 0, filter: "blur(2px)" }}
          transition={{ type: "spring", stiffness: 250, damping: 20, mass: 0.6 }}
          style={{ pointerEvents: "auto" }}
          className="w-48 bg-white/85 backdrop-blur-xl rounded-2xl p-2.5
            border border-rose-200/60
            shadow-[0_8px_20px_-8px_rgba(255,61,88,0.12)]
            select-none"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
            className="absolute top-2 right-2 w-4 h-4 rounded-full
              flex items-center justify-center
              text-gray-300 hover:text-rose-400 transition-colors"
          >
            <X size={10} strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2 mb-1.5 pr-4">
            <div
              className="w-1.5 h-5 rounded-full shrink-0"
              style={{ backgroundColor: layer.color || "#cccccc" }}
            />
            <h4 className="text-sm font-semibold text-gray-800 leading-tight truncate">
              {layer.name}
            </h4>
          </div>

          {layer.thickness > 0 && (
            <span className="inline-block text-[11px] text-rose-500 font-mono bg-rose-50 px-1.5 py-0.5 rounded-full mb-1">
              {Math.round(layer.thickness * 1000)}mm
            </span>
          )}

          {layer.material && (
            <p className="text-[11px] text-gray-500 mt-0.5">{layer.material}</p>
          )}

          {layer.description && (
            <p className="text-[10px] text-gray-400 leading-relaxed mt-1 line-clamp-2">
              {layer.description}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </Html>
  );
}

export default SpatialLabel;
