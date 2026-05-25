import { memo } from "react";
import { useDroppable } from "@dnd-kit/core";

/* ── single droppable marker (memoised) ── */
const SlotMarker = memo(function SlotMarker({ index, isFilled }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${index}` });

  const ringClass = isFilled
    ? "border-green-500 bg-green-500"
    : isOver
      ? "border-gold-400 bg-gold-100 shadow-[0_0_12px_rgba(212,164,58,0.4)]"
      : "border-gray-300";

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 transition-all duration-200 ${ringClass}`}
    >
      {isFilled && (
        <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );
}, (prev, next) => prev.index === next.index && prev.isFilled === next.isFilled);

SlotMarker.displayName = "SlotMarker";

/* ── Assembly line (memoised) ── */
const AssemblyLine = memo(function AssemblyLine({ explodeAxis, layers, filledSlots }) {
  const isX = explodeAxis === "x";
  const layerCount = layers.length;

  return (
    <div className={`flex items-center gap-4 ${isX ? "flex-row" : "flex-col"}`}>
      {/* golden line with markers */}
      <div className={`relative flex ${isX ? "flex-row w-full items-center" : "flex-col items-center h-64"}`}>
        {/* the ray */}
        <div
          className={`absolute rounded-full bg-gold-400/60 ${
            isX ? "w-full h-1 top-1/2 -translate-y-1/2" : "w-1 h-full left-1/2 -translate-x-1/2"
          }`}
        />
        {/* slot markers */}
        <div className={`relative z-10 flex ${isX ? "flex-row justify-around w-full" : "flex-col justify-around h-full"}`}>
          {Array.from({ length: layerCount }).map((_, i) => (
            <SlotMarker key={i} index={i} isFilled={filledSlots.has(i)} />
          ))}
        </div>
      </div>

      {/* labels */}
      <div className={`flex ${isX ? "flex-row justify-around w-full" : "flex-col justify-around h-full"}`}>
        {layers.map((layer, i) => (
          <span key={i} className={`text-xs text-gray-500 whitespace-nowrap text-center ${isX ? "w-20" : ""}`}>
            {layer.name}
          </span>
        ))}
      </div>
    </div>
  );
});

AssemblyLine.displayName = "AssemblyLine";
export default AssemblyLine;
