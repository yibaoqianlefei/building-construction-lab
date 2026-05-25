import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";

function LayerCard({ layer, layerIndex, isPlaced }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `layer-${layerIndex}`,
      data: { layerIndex },
      disabled: isPlaced,
    });

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1.03)`,
        zIndex: 50,
        willChange: "transform",
        backfaceVisibility: "hidden",
      }
    : { willChange: "transform", backfaceVisibility: "hidden" };

  if (isPlaced) return null;

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-3 border shadow-sm select-none transition-colors duration-150 ${
        isDragging
          ? "border-gold-400 shadow-lg opacity-90 cursor-grabbing"
          : "border-gray-200/50 cursor-grab hover:border-gold-300 hover:shadow-md"
      }`}
    >
      {/* color swatch */}
      <div
        className="w-2.5 h-8 rounded-full flex-shrink-0"
        style={{ backgroundColor: layer.color || "#D4A43A" }}
      />
      {/* info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 truncate">
          {layer.name}
        </p>
        {!isDragging && (
          <p className="text-xs text-gold-600 tabular-nums">
            {(layer.thickness * 1000).toFixed(0)} mm
          </p>
        )}
      </div>
      {/* drag handle — hidden while dragging */}
      {!isDragging && (
        <div className="text-gray-300 flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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

/* Memo: only re-render when meaningful props change */
export default memo(LayerCard, (prev, next) =>
  prev.layerIndex === next.layerIndex &&
  prev.isPlaced === next.isPlaced &&
  prev.layer?.name === next.layer?.name &&
  prev.layer?.color === next.layer?.color &&
  prev.layer?.thickness === next.layer?.thickness
);
