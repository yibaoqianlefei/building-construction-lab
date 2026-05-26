import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function LeftKnowledgePanel({ layers, selectedLayerIndex, open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute left-4 top-4 bottom-4 z-20 w-64 sm:w-72
            bg-white/80 backdrop-blur-xl
            border border-white/40 rounded-2xl
            shadow-[0_8px_32px_rgba(0,0,0,0.08)]
            flex flex-col overflow-hidden"
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
        >
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/40 flex-shrink-0">
            <h3 className="text-base font-semibold text-gray-800">全部构件</h3>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center
                text-gray-400 hover:text-gray-600 hover:bg-gray-100
                transition-colors cursor-pointer"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* card list */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {layers.map((l, i) => ({ l, i })).reverse().map(({ l, i }) => (
              <div
                key={l.name}
                className={`bg-white/85 backdrop-blur-md rounded-2xl p-4 border shadow-sm
                  transition-all duration-300
                  ${selectedLayerIndex === i
                    ? "border-rose-400 shadow-md"
                    : "border-gray-200/50"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-1.5 h-10 rounded-full flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: l.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 text-sm">
                      {l.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {l.material}
                    </p>
                    <p className="text-sm text-rose-600 font-mono tabular-nums">
                      {(l.thickness * 1000).toFixed(0)} mm
                    </p>
                    {l.description && (
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                        {l.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LeftKnowledgePanel;
