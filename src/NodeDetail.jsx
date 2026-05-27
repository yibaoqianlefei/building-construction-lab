import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiInfo } from "react-icons/fi";
import ModelViewer from "./components/viewer/ModelViewer";
import BottomControlBar from "./components/viewer/BottomControlBar";
import ConstructionKnowledgePanel from "./components/viewer/ConstructionKnowledgePanel";
import ScreenshotTool from "./components/viewer/ScreenshotTool";
import { saveNote } from "./services/noteService";
import { getNodeData } from "./data/nodesIndex";
import { useModelInteraction } from "./hooks/useModelInteraction";

const ACCENT = "#e6354f";

function NodeDetail() {
  const { nodeId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    explodeValue,
    setExplodeValue,
    autoRotate,
    setAutoRotate,
    hoveredLayer,
    setHoveredLayer,
    selectedLayer,
    screenshotMode,
    setScreenshotMode,
    handleLayerClick,
    handlePanelSelect,
    handleBlankClick,
  } = useModelInteraction();

  const [showLabels, setShowLabels] = useState(true);

  const viewerRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!nodeId) return;
    setLoading(true);
    setData(null);
    getNodeData(nodeId).then(setData).finally(() => setLoading(false));
  }, [nodeId]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !screenshotMode;
    }
  }, [screenshotMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
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
    <div className="min-h-screen bg-white text-gray-600 flex flex-col h-screen">
      <div className="px-6 md:px-10 py-2.5 bg-white border-b border-gray-100/50 flex-shrink-0">
        <span className="text-sm text-gray-400">
          <Link to="/library" className="text-rose-600 hover:text-rose-700 transition-colors">节点库</Link>
          <span className="mx-1.5 text-gray-300">›</span>
          <span className="text-gray-500">{data.title}</span>
        </span>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 flex flex-col min-h-0 relative">
          <motion.div
            ref={viewerRef}
            className="flex-1 relative rounded-2xl overflow-hidden border border-gray-200/60 bg-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] m-4 md:m-6 md:mr-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <ModelViewer
              layers={data.layers}
              explodeValue={explodeValue}
              explodeAxis={data.explodeAxis || "x"}
              floatDirection={data.floatDirection || "y"}
              floatDistance={data.floatDistance}
              modelRotation={data.modelRotation || [0, 0, 0]}
              nodeTitle={data.title}
              layerOrderReverse={data.layerOrderReverse || false}
              cameraPosition={data.cameraPosition || [1.2, 1.6, 2.8]}
              autoRotate={autoRotate}
              hoveredLayer={hoveredLayer}
              selectedLayer={selectedLayer}
              onHoverLayer={setHoveredLayer}
              onLayerClick={handleLayerClick}
              onBlankClick={handleBlankClick}
              showLabels={showLabels}
              onControlsReady={(ctrl) => { controlsRef.current = ctrl; }}
            />

            <BottomControlBar
              explodeValue={explodeValue}
              onExplodeChange={setExplodeValue}
              onExplodeReset={() => setExplodeValue(0)}
              onExplodeMax={() => setExplodeValue(100)}
              autoRotate={autoRotate}
              onAutoRotateToggle={() => setAutoRotate((v) => !v)}
              screenshotActive={screenshotMode}
              onScreenshotToggle={() => setScreenshotMode((v) => !v)}
              showLabels={showLabels}
              onLabelsToggle={() => setShowLabels((v) => !v)}
            />

            {screenshotMode && (
              <ScreenshotTool
                containerRef={viewerRef}
                onScreenshot={(dataUrl) => {
                  saveNote({
                    nodeId: data.id,
                    nodeTitle: data.title,
                    image: dataUrl,
                  });
                }}
                onClose={() => setScreenshotMode(false)}
              />
            )}
          </motion.div>
        </div>

        <aside className="w-full lg:w-80 xl:w-88 flex-shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200/50 bg-white/60 backdrop-blur-md overflow-y-auto">
          <motion.div
            className="p-4 md:p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-4">
              <h2 className="text-gray-900 font-bold text-base flex items-center gap-2 mb-2 tracking-tight">
                <FiInfo style={{ color: ACCENT }} />
                {data.title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                {data.description}
              </p>
              <p className="text-gray-400 text-xs mt-2">
                方向：{data.directionLabel}
              </p>
            </div>
          </motion.div>

          <ConstructionKnowledgePanel
            layers={data.layers}
            activeLayer={selectedLayer}
            onLayerSelect={handlePanelSelect}
          />
        </aside>
      </main>
    </div>
  );
}

export default NodeDetail;
