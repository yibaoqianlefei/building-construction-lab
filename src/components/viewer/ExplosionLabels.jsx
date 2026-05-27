import { useState, useEffect, useMemo } from "react";
import { Html, Line } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

const EXPLODE_STEP = 0.003;

/* ── piece centre positions ── */
function usePiecePositions(layers, explodeValue, explodeAxis) {
  const dir = explodeAxis.startsWith("-") ? -1 : 1;
  const clean = explodeAxis.replace("-", "");
  const isX = clean === "x";
  const useModel = layers[0]?.layerObjectName != null;
  return useMemo(() => {
    if (useModel) {
      return layers.map((_, i) => {
        const off = i * dir * explodeValue * EXPLODE_STEP;
        return isX ? [off, 0, 0] : [0, off, 0];
      });
    }
    let offset = 0;
    const total = layers.reduce((s, l) => s + l.thickness, 0);
    return layers.map((layer, i) => {
      const base = offset + layer.thickness / 2 - total / 2;
      const off = i * dir * explodeValue * EXPLODE_STEP;
      offset += layer.thickness;
      return isX ? [base + off, 0, 0] : [0, base + off, 0];
    });
  }, [layers, explodeValue, dir, isX, useModel]);
}

/* ── bounding box ── */
function usePieceBounds(layers, explodeValue, explodeAxis) {
  const positions = usePiecePositions(layers, explodeValue, explodeAxis);
  return useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    layers.forEach((layer, i) => {
      const hw = layer.thickness / 2;
      const hh = layer.modelPath ? 0.25 : 0.75;
      const hd = 0.4;
      const [cx, cy, cz] = positions[i];
      minX = Math.min(minX, cx - hw); maxX = Math.max(maxX, cx + hw);
      minY = Math.min(minY, cy - hh); maxY = Math.max(maxY, cy + hh);
      minZ = Math.min(minZ, cz - hd); maxZ = Math.max(maxZ, cz + hd);
    });
    return { minX, maxX, minY, maxY, minZ, maxZ };
  }, [layers, positions]);
}

/* ── main ── */
function ExplosionLabels({ layers, explodeValue, explodeAxis = "x", selectedLayerIndex }) {
  const isX = explodeAxis.replace("-", "") === "x";
  const [expandedIndex, setExpandedIndex] = useState(-1);
  const positions = usePiecePositions(layers, explodeValue, explodeAxis);
  const bounds = usePieceBounds(layers, explodeValue, explodeAxis);
  const n = layers.length;

  useEffect(() => {
    if (selectedLayerIndex != null && selectedLayerIndex >= 0) setExpandedIndex(selectedLayerIndex);
  }, [selectedLayerIndex]);

  /* anchor points: staggered above (wall) or right of (roof) */
  const anchors = useMemo(() => {
    const pts = [];
    const cz = (bounds.minZ + bounds.maxZ) / 2;
    if (isX) {
      const spanX = bounds.maxX - bounds.minX || 1;
      const step = n > 1 ? spanX / (n - 1) : 0;
      for (let i = 0; i < n; i++) {
        const y = bounds.maxY + (i % 2 === 0 ?-2 :0.3);
        pts.push([bounds.minX + i * step, y, cz]);
      }
    } else {
      const spanY = bounds.maxY - bounds.minY || 1;
      const step = n > 1 ? spanY / (n - 1) : 0;
      for (let i = 0; i < n; i++) {
        const x = bounds.maxX + (i % 2 === 0 ? 1.5 : 1.5);
        pts.push([x, bounds.minY + i * step, cz]);
      }
    }
    return pts;
  }, [isX, bounds, n]);

  return (
    <group>
      {/* guide lines from piece centres to anchor points */}
      {layers.map((_, i) => {
        const start = positions[i];
        const end = anchors[i];
        if (!start || !end) return null;
        return (
          <Line
            key={`line-${i}`}
            points={[
              [start[0], start[1], start[2]],
              [end[0], end[1], end[2]],
            ]}
            color="#ff9cab"
            lineWidth={1}
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        );
      })}

      {/* cards at anchor points */}
      {layers.map((layer, i) => (
        <Html
          key={layer.name}
          center
          position={[anchors[i][0], anchors[i][1], anchors[i][2]]}
          distanceFactor={8}
          occlude={false}
          style={{ pointerEvents: "auto" }}
        >
          <AccordionCard
            layer={layer}
            expanded={expandedIndex === i}
            onToggle={() => setExpandedIndex((prev) => (prev === i ? -1 : i))}
          />
        </Html>
      ))}
    </group>
  );
}

/* ── single accordion card ── */
function AccordionCard({ layer, expanded, onToggle }) {
  return (
    <div className="flex-shrink-0">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        onPointerDown={(e) => e.stopPropagation()}
        className={`flex items-center gap-1.5 backdrop-blur-md rounded-full border select-none whitespace-nowrap cursor-pointer transition-colors duration-200 ${
          expanded
            ? "bg-rose-50/95 border-rose-300/80 shadow-md"
            : "bg-white/85 border-white/40 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:bg-white/95 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
        }`}
        style={{ height: 28, padding: "0 10px", fontSize: 10, fontWeight: 500 }}
      >
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: layer.color || "#ff3d58" }} />
        <span className="text-gray-700">{layer.name}</span>
        <span className="text-rose-500/60 font-normal tabular-nums" style={{ fontSize: 10 }}>
          {(layer.thickness * 1000).toFixed(0)}mm
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div
              className="bg-white/85 backdrop-blur-xl rounded-xl border border-white/40 shadow-[0_6px_18px_rgba(0,0,0,0.05)] p-2 mt-1"
              style={{ width: 160 }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <p className="text-[10px] text-gray-500 mb-0.5">
                <span className="text-gray-400">材料：</span>{layer.material}
              </p>
              <p className="text-[10px] text-gray-500 mb-0.5 tabular-nums">
                <span className="text-gray-400">厚度：</span>{(layer.thickness * 1000).toFixed(0)} mm
              </p>
              {layer.description && (
                <p className="text-[10px] text-gray-400 leading-relaxed mt-1.5 pt-1.5 border-t border-gray-200/40">
                  {layer.description}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ExplosionLabels;
