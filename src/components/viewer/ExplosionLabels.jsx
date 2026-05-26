import { useMemo } from "react";
import { Html } from "@react-three/drei";

const EXPLODE_STEP = 0.003;

/* compute piece centres along explode axis (same as WallAssembly) */
function usePiecePositions(layers, explodeValue, explodeAxis) {
  const explodeDir = explodeAxis.startsWith("-") ? -1 : 1;
  const cleanAxis = explodeAxis.replace("-", "");
  const isX = cleanAxis === "x";
  const useModel = layers[0]?.layerObjectName != null;

  return useMemo(() => {
    if (useModel) {
      return layers.map((_, i) => {
        const off = i * explodeDir * explodeValue * EXPLODE_STEP;
        return isX ? [off, 0, 0] : [0, off, 0];
      });
    }
    let offset = 0;
    const total = layers.reduce((sum, l) => sum + l.thickness, 0);
    return layers.map((layer, i) => {
      const base = offset + layer.thickness / 2 - total / 2;
      const off = i * explodeDir * explodeValue * EXPLODE_STEP;
      offset += layer.thickness;
      return isX ? [base + off, 0, 0] : [0, base + off, 0];
    });
  }, [layers, explodeValue, explodeDir, isX, useModel]);
}

function ExplosionLabels({ layers, explodeValue, explodeAxis = "x", onLabelClick, activeCardIndex }) {
  const isX = explodeAxis.replace("-", "") === "x";
  const positions = usePiecePositions(layers, explodeValue, explodeAxis);

  /* anchor points: wall → line above model,  roof → line right of model */
  const anchors = useMemo(() => {
    const Y_ABOVE = 1.15;   // above procedural boxes (height 1.5 → top 1.5)
    const X_RIGHT = 0.85;   // right of typical model width
    return positions.map((p) =>
      isX ? [p[0], Y_ABOVE, p[2]] : [X_RIGHT, p[1], p[2]]
    );
  }, [positions, isX]);

  return (
    <group>
      {layers.map((layer, i) => (
        <Html
          key={layer.name}
          center
          position={[anchors[i][0], anchors[i][1], anchors[i][2]]}
          distanceFactor={7}
          occlude={false}
          style={{ pointerEvents: "auto" }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLabelClick?.(i, anchors[i]);
            }}
            className={`flex items-center gap-1.5 backdrop-blur-md rounded-full px-2 py-0.5 border shadow-sm select-none whitespace-nowrap cursor-pointer transition-all duration-200 active:scale-95 ${
              activeCardIndex === i
                ? "bg-rose-50/90 border-rose-300 shadow-md"
                : "bg-white/85 border-white/40 hover:bg-white/95 hover:shadow-md"
            }`}
          >
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: layer.color || "#ff3d58" }}
            />
            <span className="text-[11px] font-medium text-gray-700 leading-tight">
              {layer.name}
            </span>
            <span className="text-[10px] text-rose-500 font-light tabular-nums">
              {(layer.thickness * 1000).toFixed(0)}mm
            </span>
          </button>
        </Html>
      ))}
    </group>
  );
}

export default ExplosionLabels;
