import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";

function LayerCard({ layer, layerIndex, variant = "bottom", verified = null }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `layer-${layerIndex}`, data: { layerIndex } });

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        willChange: "transform",
        backfaceVisibility: "hidden",
        isolation: "isolate",
      }
    : { willChange: "transform", backfaceVisibility: "hidden" };

  /* verified border — thin line, no bg change */
  const verifiedRing =
    verified === true
      ? "border-primary"
      : verified === false
        ? "border-error/60"
        : "border-transparent";

  /* ── slot variant (compact card in ray) ── */
  if (variant === "slot") {
    return (
      <div
        ref={setNodeRef}
        style={dragStyle}
        {...listeners}
        {...attributes}
        className={`flex items-center gap-2 bg-canvas rounded-xl px-3 py-1.5 border shadow-[0_1px_3px_rgba(0,0,0,0.04)] select-none transition-all duration-300 ease-out cursor-grab hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${
          isDragging
            ? "scale-105 shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-grabbing"
            : ""
        } ${verifiedRing}`}
      >
        <div
          className="w-1.5 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: layer.color || "#cc785c" }}
        />
        <span className="text-xs font-normal text-body tracking-wide truncate max-w-16">
          {layer.name}
        </span>
      </div>
    );
  }

  /* ── bottom variant (full card) ── */
  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 bg-canvas rounded-xl px-4 py-3 border shadow-[0_1px_3px_rgba(0,0,0,0.04)] select-none transition-all duration-300 ease-out cursor-grab hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${
        isDragging
          ? "scale-105 shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-grabbing"
          : ""
      } ${verifiedRing}`}
    >
      <div
        className="w-1.5 h-8 rounded-full flex-shrink-0"
        style={{ backgroundColor: layer.color || "#cc785c" }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-normal text-body tracking-wide truncate">
          {layer.name}
        </p>
        {!isDragging && (
          <p className="text-xs text-primary/70 font-light tabular-nums mt-0.5">
            {(layer.thickness * 1000).toFixed(0)} mm
          </p>
        )}
      </div>
      {!isDragging && (
        <div className="text-muted-soft flex-shrink-0 opacity-50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="5" r="2" />
            <circle cx="15" cy="5" r="2" />
            <circle cx="9" cy="12" r="2" />
            <circle cx="15" cy="12" r="2" />
            <circle cx="9" cy="19" r="2" />
            <circle cx="15" cy="19" r="2" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default memo(LayerCard, (prev, next) =>
  prev.layerIndex === next.layerIndex &&
  prev.variant === next.variant &&
  prev.verified === next.verified &&
  prev.layer?.name === next.layer?.name &&
  prev.layer?.color === next.layer?.color &&
  prev.layer?.thickness === next.layer?.thickness
);
