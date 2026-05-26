import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

function LayerCard({ layer, index, isHovered, isExpanded, onToggle }) {
  return (
    <motion.div
      layout
      className={`rounded-xl border transition-all duration-300
        ${isExpanded
          ? "bg-white border-rose-400 shadow-md"
          : isHovered
            ? "bg-rose-50/50 border-rose-200"
            : "bg-white/60 backdrop-blur-sm border-gray-200/50"
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
        <span className="text-sm font-semibold text-gray-800 flex-1">
          {layer.name}
        </span>
        <span className="text-xs text-rose-600 font-mono tabular-nums">
          {(layer.thickness * 1000).toFixed(0)} mm
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
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
  hoveredLayerIndex,
  selectedLayerIndex,
  onSelectLayer,
  explodeValue,
}) {
  const [expandedIndex, setExpandedIndex] = useState(-1);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setExpandedIndex(selectedLayerIndex ?? -1);
  }, [selectedLayerIndex]);

  function handleToggle(index) {
    const next = expandedIndex === index ? -1 : index;
    setExpandedIndex(next);
    if (onSelectLayer && explodeValue > 0) {
      onSelectLayer(next >= 0 ? next : null);
    }
  }

  return (
    <div className="bg-white/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-gray-200/50 h-full overflow-y-auto">
      <button
        className="lg:hidden flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span>构造层次</span>
        {collapsed ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>

      <div className={collapsed ? "hidden lg:block" : ""}>
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            构造层次
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            从室内到室外
          </p>
        </div>

        <div className="space-y-1 p-4 pt-2">
          {layers.map((l, i) => ({ l, i })).reverse().map(({ l, i }) => (
            <LayerCard
              key={l.name}
              layer={l}
              index={i}
              isHovered={hoveredLayerIndex === i}
              isExpanded={expandedIndex === i}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConstructionKnowledgePanel;
