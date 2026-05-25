import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { RefreshCw, Trophy } from "lucide-react";
import { nodesIndex, getNodeData } from "../data/nodesIndex";
import AssemblyLine from "../components/game/AssemblyLine";
import LayerCard from "../components/game/LayerCard";

/* Fisher-Yates shuffle */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function GamesPage() {
  const nodes = nodesIndex;
  const [nodeId, setNodeId] = useState(nodes[0]?.id);
  const [nodeData, setNodeData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 2D game state */
  const [filledSlots, setFilledSlots] = useState(new Set());
  const [cardOrder, setCardOrder] = useState([]);
  const [activeLayerIdx, setActiveLayerIdx] = useState(-1); // -1 = none
  const [done, setDone] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  /* reset everything for a fresh game */
  const resetGame = useCallback(() => {
    setDone(false);
    setFilledSlots(new Set());
    setActiveLayerIdx(-1);
  }, []);

  /* load node data */
  useEffect(() => {
    if (!nodeId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    resetGame();
    getNodeData(nodeId)
      .then(setNodeData)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, resetKey]);

  /* shuffle cards when node data loads */
  useEffect(() => {
    if (nodeData?.layers) {
      setCardOrder(shuffle(nodeData.layers.map((_, i) => i)));
    }
  }, [nodeData]);

  /* ── dnd handlers ── */
  const layerCountRef = useRef(0);
  useEffect(() => { layerCountRef.current = nodeData?.layers?.length || 0; }, [nodeData]);

  const handleDragStart = useCallback((event) => {
    const idx = event.active.data.current?.layerIndex;
    if (idx != null) setActiveLayerIdx(idx);
  }, []);

  const handleDragEnd = useCallback((event) => {
    setActiveLayerIdx(-1);
    const { active, over } = event;
    if (!over) return;
    const layerIndex = active.data.current?.layerIndex;
    const slotId = over?.id;
    if (layerIndex == null || !slotId || !slotId.startsWith("slot-")) return;
    const slotIndex = parseInt(slotId.replace("slot-", ""), 10);
    if (layerIndex === slotIndex) {
      setFilledSlots((prev) => {
        if (prev.has(slotIndex)) return prev;
        const next = new Set(prev);
        next.add(slotIndex);
        if (next.size >= layerCountRef.current) {
          setTimeout(() => setDone(true), 500);
        }
        return next;
      });
    }
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveLayerIdx(-1);
  }, []);

  /* ── full reset ── */
  const handleReset = useCallback(() => {
    resetGame();
    if (nodeData?.layers) {
      setCardOrder(shuffle(nodeData.layers.map((_, i) => i)));
    }
  }, [resetGame, nodeData?.layers]);

  /* switch node */
  const handleNodeChange = useCallback((id) => {
    setResetKey((k) => k + 1);
    setNodeId(id);
  }, []);

  /* which card is being dragged (for DragOverlay) */
  const draggedLayer = useMemo(() => {
    if (activeLayerIdx < 0 || !nodeData?.layers) return null;
    return nodeData.layers[activeLayerIdx] ?? null;
  }, [activeLayerIdx, nodeData?.layers]);

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gold-300 border-t-gold-600 rounded-full animate-spin" />
      </div>
    );
  }

  const layerCount = nodeData?.layers?.length || 0;
  const progress = filledSlots.size;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="h-screen bg-white flex flex-col relative overflow-hidden">
        {/* top bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-gray-100/50 z-30">
          <div className="flex items-center gap-3">
            {nodes.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNodeChange(n.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  nodeId === n.id
                    ? "bg-gold-500 text-white shadow-md"
                    : "bg-white/80 text-gray-600 border border-gray-200/50 hover:border-gold-300"
                }`}
              >
                {n.title}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 tabular-nums">
              {progress} / {layerCount}
            </span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 border border-gray-200/50 text-sm text-gray-600 hover:text-gold-600 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} /> 重新挑战
            </button>
          </div>
        </div>

        {/* main: ray (top) + cards (bottom) */}
        <div className="flex-1 flex flex-col gap-6 p-6 min-h-0 overflow-auto">
          {/* target area */}
          <div className="flex-shrink-0 bg-gold-50/30 rounded-2xl border border-dashed border-gold-200 p-6">
            <p className="text-xs text-gray-500 mb-4 text-center">
              将下方构件拖拽到对应的标记位置
            </p>
            {nodeData && (
              <AssemblyLine
                explodeAxis={nodeData.explodeAxis || "x"}
                layers={nodeData.layers}
                filledSlots={filledSlots}
              />
            )}
          </div>

          {/* card area */}
          <div className="flex-1 min-h-0">
            <p className="text-xs text-gray-400 mb-3 text-center">
              拖拽构件至上方标记点
            </p>
            <div className="flex flex-wrap gap-3 justify-center content-start" style={{ touchAction: "none" }}>
              {nodeData &&
                cardOrder.map((layerIndex) => (
                  <div key={layerIndex} className="w-52">
                    <LayerCard
                      layer={nodeData.layers[layerIndex]}
                      layerIndex={layerIndex}
                      isPlaced={filledSlots.has(layerIndex)}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* DragOverlay */}
        <DragOverlay dropAnimation={null}>
          {draggedLayer && (
            <div className="w-52 flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-xl p-3 border border-gold-400 shadow-xl">
              <div
                className="w-2.5 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: draggedLayer.color || "#D4A43A" }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {draggedLayer.name}
                </p>
                <p className="text-xs text-gold-600 tabular-nums">
                  {(draggedLayer.thickness * 1000).toFixed(0)} mm
                </p>
              </div>
            </div>
          )}
        </DragOverlay>

        {/* completion modal */}
        <AnimatePresence>
          {done && (
            <motion.div
              className="absolute inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/10 backdrop-blur-sm"
                onClick={handleReset}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className="relative bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-200/50 p-10 text-center max-w-sm w-full mx-4"
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-50 flex items-center justify-center">
                  <Trophy size={32} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  完美拼装！
                </h2>
                <p className="text-gray-500 text-sm mb-2">
                  你已经掌握了 {nodeData?.title} 的构造层次
                </p>
                <p className="text-gray-400 text-xs mb-6">
                  共 {layerCount} 层，全部正确
                </p>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-white text-sm font-medium hover:bg-gold-600 transition-colors cursor-pointer"
                >
                  <RefreshCw size={16} /> 再来一次
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndContext>
  );
}

export default GamesPage;
