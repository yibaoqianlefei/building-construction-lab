import { Html } from "@react-three/drei";
import { motion } from "framer-motion";

function LayerLabel({ layer, position }) {
  return (
    <Html position={position} center style={{ pointerEvents: "none" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 8, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.95, y: 4, filter: "blur(4px)" }}
        transition={{
          opacity: { type: "spring", stiffness: 400, damping: 28, mass: 0.8 },
          scale: { type: "spring", stiffness: 400, damping: 28, mass: 0.8 },
          y: { type: "spring", stiffness: 400, damping: 28, mass: 0.8 },
          filter: { duration: 0.25, ease: "easeOut" },
        }}
        style={{ transformOrigin: "bottom center" }}
      >
        <div
          className="relative bg-white/85 backdrop-blur-xl text-gray-700 text-xs
            rounded-2xl px-4 py-3
            shadow-[0_8px_30px_rgba(0,0,0,0.08)]
            border border-gray-200/50 min-w-[180px]"
        >
          <h3
            className="font-bold text-sm mb-2 pb-1.5 border-b border-gray-200/50 tracking-tight"
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

          <div
            className="absolute left-1/2 -translate-x-1/2
              w-3 h-3 rotate-45
              bg-white/85 backdrop-blur-xl
              border-r border-b border-gray-200/50"
            style={{ bottom: -6 }}
          />
        </div>
      </motion.div>
    </Html>
  );
}

export default LayerLabel;
