import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function LayerCard({ layer, index, isActive, onToggle }) {
  const isExpanded = isActive;

  return (
    <motion.div
      layout
      className={`rounded-xl border transition-all duration-300 ${
        isExpanded
          ? "bg-white border-rose-200 shadow-md"
          : "bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-rose-50/50"
      }`}
    >
      <button
        onClick={() => onToggle(index)}
        className="flex items-center gap-3 px-4 py-2.5 w-full text-left cursor-pointer"
      >
        <div
          className="w-1.5 h-6 rounded-full flex-shrink-0"
          style={{ backgroundColor: layer.color }}
        />
        <span className={`text-sm font-semibold flex-1 ${isExpanded ? "text-rose-600" : "text-gray-800"}`}>
          {layer.name}
        </span>
        <span className="text-xs text-rose-500 font-mono tabular-nums">
          {(layer.thickness * 1000).toFixed(0)} mm
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-1.5">
              <p className="text-sm text-gray-500">
                <span className="text-gray-400">材料：</span>
                {layer.material}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {layer.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ConstructionKnowledgePanel({
  layers,
  activeLayer,
  onLayerSelect,
}) {
  const activeIndex = activeLayer ?? -1;

  function handleToggle(index) {
    if (onLayerSelect) {
      onLayerSelect(activeIndex === index ? -1 : index);
    }
  }

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-sm h-full overflow-y-auto border border-gray-200/30">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          构造层次
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          从室内到室外
        </p>
      </div>

      <div className="flex flex-col gap-2 p-4 pt-2">
        {layers
          .map((l, i) => ({ l, i }))
          .reverse()
          .map(({ l, i }) => (
            <LayerCard
              key={l.name}
              layer={l}
              index={i}
              isActive={activeIndex === i}
              onToggle={handleToggle}
            />
          ))}
      </div>
    </div>
  );
}

export default ConstructionKnowledgePanel;
