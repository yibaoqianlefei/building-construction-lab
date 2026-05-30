import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, X, Play } from "lucide-react";

function LayerCard({ layer, index, isActive, onToggle, nodeId }) {
  const isExpanded = isActive;
  const navigate = useNavigate();

  const handleGameClick = (e) => {
    e.stopPropagation();
    if (nodeId) navigate(`/games?nodeId=${nodeId}`);
  };

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
              {nodeId && (
                <button
                  onClick={handleGameClick}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                    border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300
                    transition-all duration-200 cursor-pointer"
                >
                  <Play size={11} />
                  拼装练习
                </button>
              )}
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
  nodeId,
}) {
  const activeIndex = activeLayer ?? -1;
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleToggle(index) {
    if (onLayerSelect) {
      onLayerSelect(activeIndex === index ? -1 : index);
    }
  }

  const cardList = (
    <div className="flex flex-col gap-2">
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
            nodeId={nodeId}
          />
        ))}
    </div>
  );

  return (
    <>
      {/* ── desktop sidebar ── */}
      <div className="hidden md:block bg-white/85 backdrop-blur-md rounded-2xl shadow-sm h-full overflow-y-auto border border-gray-200/30">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            构造层次
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">从室内到室外</p>
        </div>
        <div className="p-4 pt-2">{cardList}</div>
      </div>

      {/* ── mobile floating button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-30 w-12 h-12 rounded-full
          bg-rose-500 text-white shadow-lg shadow-rose-500/30
          flex items-center justify-center
          hover:bg-rose-600 active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="构造层次"
      >
        <Layers size={20} />
      </button>

      {/* ── mobile bottom sheet ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="md:hidden fixed bottom-0 left-0 right-0 z-50
                bg-white/95 backdrop-blur-md rounded-t-2xl
                border-t border-gray-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
                max-h-[50vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  构造层次
                </h3>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center
                    bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600
                    transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-5 pb-6 pt-1">{cardList}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default ConstructionKnowledgePanel;
