import { memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import LayerCard from "./LayerCard";

const Slot = memo(function Slot({ index, occupant, layer, verified }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${index}` });

  const base =
    "w-5 h-5 rounded-full border transition-all duration-300";
  const ring =
    verified === true
      ? "border-primary/60 bg-primary"
      : verified === false
        ? "border-error/60 bg-error"
        : isOver
          ? "border-primary/60 bg-primary/15"
          : "border-primary/20 bg-transparent";

  return (
    <div ref={setNodeRef} className="flex-shrink-0 flex flex-col items-center">
      {occupant != null && layer ? (
        <LayerCard layer={layer} layerIndex={occupant} variant="slot" verified={verified} />
      ) : (
        <div className={`${base} ${ring}`}>
          {verified === true && (
            <svg viewBox="0 0 24 24" className="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
          {verified === false && (
            <svg viewBox="0 0 24 24" className="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}, (prev, next) =>
  prev.index === next.index &&
  prev.occupant === next.occupant &&
  prev.verified === next.verified &&
  prev.layer?.name === next.layer?.name
);

Slot.displayName = "Slot";

const AssemblyLine = memo(function AssemblyLine({
  explodeAxis, layers, slotOccupants, verifiedSlots,
}) {
  const isX = explodeAxis === "x";
  const n = layers.length;

  return (
    <div className={`flex ${isX ? "flex-row items-center" : "flex-col items-center"} gap-6`}>
      <div className={`relative flex ${isX ? "flex-row w-full items-center" : "flex-col items-center"} ${isX ? "" : "h-72"}`}>
        {/* gradient ray */}
        {isX ? (
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        ) : (
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
        )}
        {/* slot markers */}
        <div className={`relative z-10 flex ${isX ? "flex-row justify-around w-full" : "flex-col justify-around h-full"}`}>
          {Array.from({ length: n }).map((_, i) => (
            <Slot
              key={i}
              index={i}
              occupant={slotOccupants.get(i)}
              layer={slotOccupants.get(i) != null ? layers[slotOccupants.get(i)] : null}
              verified={verifiedSlots.get(i) ?? null}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

AssemblyLine.displayName = "AssemblyLine";
export default AssemblyLine;
