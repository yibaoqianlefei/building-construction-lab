import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiInfo } from "react-icons/fi";
import ModelViewer from "./components/viewer/ModelViewer";
import BottomControlBar from "./components/viewer/BottomControlBar";
import LayerLabel from "./components/viewer/LayerLabel";
import { getNodeData } from "./data/nodesIndex";

const ACCENT = "#B8891F";

function NodeDetail() {
  const { nodeId } = useParams();
  const data = getNodeData(nodeId);

  const [explodeValue, setExplodeValue] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    if (explodeValue === 0) {
      setSelectedLayer(null);
      setActiveCard(null);
    }
  }, [explodeValue]);

  function handleLayerClick(index, layer, e) {
    if (selectedLayer === index) {
      setSelectedLayer(null);
      setActiveCard(null);
    } else {
      setSelectedLayer(index);
      setActiveCard({
        layer,
        x: e.clientX,
        y: e.clientY,
      });
    }
  }

  function handleBlankClick() {
    setActiveCard(null);
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">未找到该构造节点</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-600 flex flex-col">
      <div className="px-6 md:px-10 py-2.5 bg-white border-b border-gray-100/50">
        <span className="text-sm text-gray-400">
          <Link to="/library" className="text-gold-600 hover:text-gold-700 transition-colors">节点库</Link>
          <span className="mx-1.5 text-gray-300">›</span>
          <span className="text-gray-500">{data.title}</span>
        </span>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row p-6 md:p-10 gap-6 md:gap-8 min-h-0">
        <motion.div
          className="relative flex-1 min-h-[380px] lg:min-h-0 rounded-2xl overflow-hidden border border-gray-200/60 bg-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <ModelViewer
            layers={data.layers}
            explodeValue={explodeValue}
            autoRotate={autoRotate}
            hoveredLayer={hoveredLayer}
            selectedLayer={selectedLayer}
            onHoverLayer={setHoveredLayer}
            onLayerClick={handleLayerClick}
            onBlankClick={handleBlankClick}
          />

          <BottomControlBar
            explodeValue={explodeValue}
            onExplodeChange={setExplodeValue}
            onExplodeReset={() => setExplodeValue(0)}
            onExplodeMax={() => setExplodeValue(100)}
            autoRotate={autoRotate}
            onAutoRotateToggle={() => setAutoRotate((v) => !v)}
          />
        </motion.div>

        <motion.aside
          className="w-full lg:w-80 xl:w-88 flex flex-col gap-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-gray-900 font-bold text-base flex items-center gap-2 mb-3 tracking-tight">
              <FiInfo style={{ color: ACCENT }} />
              {data.title}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              {data.description}
            </p>
            <p className="text-gray-400 text-xs mt-3">
              方向：{data.directionLabel}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h3 className="text-gray-900 font-bold text-sm mb-3 tracking-tight">
              构造层图例
            </h3>
            <div className="space-y-1">
              {data.layers.map((layer, i) => {
                const active = hoveredLayer === i || selectedLayer === i;
                return (
                  <div
                    key={layer.name}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                      active
                        ? "bg-gold-50/80 ring-1 ring-gold-200"
                        : "hover:bg-gray-50"
                    }`}
                    onMouseEnter={() => setHoveredLayer(i)}
                    onMouseLeave={() => setHoveredLayer(null)}
                    onClick={() =>
                      setSelectedLayer(selectedLayer === i ? null : i)
                    }
                  >
                    <div
                      className="w-4 h-4 rounded flex-shrink-0 border border-gray-300"
                      style={{ backgroundColor: layer.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs font-semibold tracking-tight"
                        style={{ color: active ? ACCENT : "#374151" }}
                      >
                        {layer.name}
                      </div>
                      <div className="text-gray-400 text-[10px] truncate tabular-nums">
                        {layer.material} · {(layer.thickness * 1000).toFixed(0)}mm
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.aside>
      </main>

      <AnimatePresence>
        {activeCard && (
          <LayerLabel
            layer={activeCard.layer}
            screenX={activeCard.x}
            screenY={activeCard.y}
            onClose={() => setActiveCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default NodeDetail;
