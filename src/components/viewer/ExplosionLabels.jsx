import { useMemo, useRef, useEffect, useState, memo } from "react";
import { Html, Line } from "@react-three/drei";
import { motion } from "framer-motion";

const EXPLODE_STEP = 0.003;
const LABEL_SCALE = 0.55;
const OPACITY_LERP = 0.2;
const LABEL_DISTANCE = 0.7;
const STATE_SKIP = 3; // update React state every N frames

const CANDIDATE_DIRS_L = [
  [1, 0, 0], [-1, 0, 0],
  [0, 1, 0], [0, -1, 0],
  [0, 0, 1], [0, 0, -1],
];

/* ── piece centre positions ── */
function usePiecePositions(layers, explodeValue, explodeAxis) {
  const hasExplosion = explodeAxis != null;
  const isIndividual = hasExplosion && (explodeAxis === "individual" || layers.some(l => l.explodeDirection != null));
  const useModel = layers[0]?.layerObjectName != null;

  return useMemo(() => {
    if (isIndividual) {
      // per-layer explosion: each interactive layer moves along its own direction
      return layers.map((layer, i) => {
        if (!layer.explodeDirection || !layer.explodeDistance) return [0, 0, 0];
        const d = CANDIDATE_DIRS_L[i % 6];
        const t = explodeValue / 100;
        const dist = layer.explodeDistance;
        return [d[0] * dist * t, d[1] * dist * t, d[2] * dist * t];
      });
    }

    const dir = explodeAxis.startsWith("-") ? -1 : 1;
    const clean = explodeAxis.replace("-", "");
    const isX = clean === "x";

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
  }, [layers, explodeValue, explodeAxis, isIndividual, useModel]);
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

/* ── anchors ── */
function computeAnchors(layers, bounds, isX, extraOffset) {
  const n = layers.length;
  const pts = [];
  const cz = (bounds.minZ + bounds.maxZ) / 2;
  const span = isX ? bounds.maxX - bounds.minX || 1 : bounds.maxY - bounds.minY || 1;
  const step = n > 1 ? span / (n - 1) : 0;
  for (let i = 0; i < n; i++) {
    if (isX) {
      const y = i % 2 === 0 ? 0.5 + LABEL_DISTANCE + extraOffset :-0.5 - LABEL_DISTANCE - extraOffset;
      pts.push([bounds.minX + i * step, y, cz]);
    } else {
      const x = i % 2 === 0 ? 1 + extraOffset : -0.5 - LABEL_DISTANCE - extraOffset;
      pts.push([x, bounds.minY + i * step, cz]);
    }
  }
  return pts;
}

function getEdgePoint(center, layer, isX, isAboveOrRight) {
  const halfH = layer.modelPath ? 0.25 : 0.75;
  if (isX) return [center[0], center[1] + (isAboveOrRight ? halfH : -halfH), center[2]];
  return [center[0] + (isAboveOrRight ? halfH : -halfH), center[1], center[2]];
}

/* ── memoized label button ── */
const LabelButton = memo(function LabelButton({ layer, i, isActive, visible, onLabelClick }) {
  return (
    <motion.button
      layout
      type="button"
      onClick={(e) => { if (visible) { e.stopPropagation(); onLabelClick?.(i); } }}
      onPointerDown={(e) => e.stopPropagation()}
      className={`flex items-center gap-1.5 rounded-full border select-none whitespace-nowrap transition-colors duration-200 min-w-[6rem] ${
        isActive
          ? "bg-hairline/90 border-primary/30 text-primary"
          : "bg-canvas border-hairline hover:bg-canvas text-body"
      }`}
      style={{ height: 28, padding: "0 10px", fontSize: 10, fontWeight: 500, cursor: visible ? "pointer" : "default" }}
    >
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: layer.color || "#cc785c" }} />
      <span>{layer.name}</span>
      <span className="text-primary/60 font-normal tabular-nums" style={{ fontSize: 10 }}>
        {(layer.thickness * 1000).toFixed(0)}mm
      </span>
    </motion.button>
  );
});

/* ═══════════════════════════════════════
   ExplosionLabels
   ═══════════════════════════════════════ */
function ExplosionLabels({ layers, explodeValue, explodeAxis = "x", activeLayer, showLabels, onLabelClick }) {
  const isX = explodeAxis.replace("-", "") === "x";

  const [smoothedExplode, setSmoothedExplode] = useState(0);
  const positions = usePiecePositions(layers, smoothedExplode, explodeAxis);
  const bounds = usePieceBounds(layers, smoothedExplode, explodeAxis);

  /* lerp explodeValue → smoothedExplode, throttle state updates */
  const smoothRef = useRef(0);
  const frameRef = useRef(0);
  useEffect(() => {
    let running = true;
    const LERP = 1.0;
    let prevTime = performance.now();
    function step(now) {
      if (!running) return;
      const delta = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;
      const alpha = 1 - Math.exp(-LERP * delta);
      smoothRef.current += (explodeValue - smoothRef.current) * alpha;
      frameRef.current++;
      if (frameRef.current % STATE_SKIP === 0) {
        setSmoothedExplode(smoothRef.current);
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    return () => { running = false; };
  }, [explodeValue]);

  const visible = showLabels && smoothRef.current > 0.01;
  const targetFade = visible ? Math.min(Math.max(0, smoothRef.current - 5) / 15, 1) : 0;

  const fadeRef = useRef(0);
  useEffect(() => {
    let running = true;
    function step() {
      if (!running) return;
      fadeRef.current += (targetFade - fadeRef.current) * OPACITY_LERP;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    return () => { running = false; };
  }, [targetFade]);

  const fade = fadeRef.current;
  const extraOffset = explodeValue * 0.002;
  const anchors = useMemo(() => computeAnchors(layers, bounds, isX, extraOffset), [layers, bounds, isX, extraOffset]);

  if (!visible && fade < 0.01) return null;

  const lineBaseOpacity = 0.5 * fade;

  return (
    <group>
      {layers.map((layer, i) => {
        const center = positions[i];
        const anchor = anchors[i];
        if (!center || !anchor) return null;
        const isActive = activeLayer === i;
        const isAboveOrRight = i % 2 === 0;
        const edge = getEdgePoint(center, layer, isX, isAboveOrRight);
        const turning = isX ? [edge[0], anchor[1], edge[2]] : [anchor[0], edge[1], edge[2]];
        const linePoints = [[edge[0], edge[1], edge[2]], [turning[0], turning[1], turning[2]], [anchor[0], anchor[1], anchor[2]]];

        return (
          <group key={layer.name}>
            <Line points={linePoints} color="#cc785c" lineWidth={isActive ? 1.2 : 0.8} transparent opacity={isActive ? 0.6 * fade : lineBaseOpacity} depthWrite={false} />
            <Html center position={[anchor[0], anchor[1], anchor[2]]} scale={LABEL_SCALE} style={{ pointerEvents: visible ? "auto" : "none", opacity: fade }}>
              <LabelButton layer={layer} i={i} isActive={isActive} visible={visible} onLabelClick={onLabelClick} />
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default ExplosionLabels;
