import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { nodesIndex, getNodeData } from "../data/nodesIndex";
import AssemblyLine from "../components/game/AssemblyLine";
import LayerCard from "../components/game/LayerCard";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ReturnZone({ children }) {
  const { setNodeRef, isOver } = useDroppable({ id: "return-zone" });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-0 rounded-2xl transition-colors duration-300 p-6 ${
        isOver ? "bg-rose-50/40" : "bg-transparent"
      }`}
      style={{ touchAction: "none" }}
    >
      {children}
    </div>
  );
}

function GamesPage() {
  const nodes = nodesIndex;
  const [nodeId, setNodeId] = useState(nodes[0]?.id);
  const [nodeData, setNodeData] = useState(null);
  const [loading, setLoading] = useState(true);

  const slotOccupantsRef = useRef(new Map());
  const verifiedSlotsRef = useRef(new Map());
  const [renderTick, setRenderTick] = useState(0);
  const [cardOrder, setCardOrder] = useState([]);
  const [activeLayerIdx, setActiveLayerIdx] = useState(-1);
  const [done, setDone] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const bump = useCallback(() => setRenderTick((t) => t + 1), []);

  const resetGame = useCallback(() => {
    setDone(false);
    slotOccupantsRef.current = new Map();
    verifiedSlotsRef.current = new Map();
    setActiveLayerIdx(-1);
    bump();
  }, [bump]);

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

  useEffect(() => {
    if (nodeData?.layers) setCardOrder(shuffle(nodeData.layers.map((_, i) => i)));
  }, [nodeData]);

  const layerCountRef = useRef(0);
  useEffect(() => { layerCountRef.current = nodeData?.layers?.length || 0; }, [nodeData]);

  /* ── dnd ── */
  const handleDragStart = useCallback((event) => {
    const idx = event.active.data.current?.layerIndex;
    if (idx != null) setActiveLayerIdx(idx);
  }, []);

  const handleDragEnd = useCallback((event) => {
    setActiveLayerIdx(-1);
    const { active, over } = event;
    if (!over) return;
    const layerIndex = active.data.current?.layerIndex;
    if (layerIndex == null) return;
    const overId = over?.id;
    const map = slotOccupantsRef.current;

    if (overId === "return-zone") {
      for (const [s, l] of map) { if (l === layerIndex) { map.delete(s); break; } }
      verifiedSlotsRef.current = new Map();
      bump();
      return;
    }

    if (typeof overId === "string" && overId.startsWith("slot-")) {
      const ts = parseInt(overId.replace("slot-", ""), 10);
      for (const [s, l] of map) { if (l === layerIndex) { map.delete(s); break; } }
      const old = map.get(ts);
      if (old != null) map.delete(ts);
      if (old !== layerIndex) map.set(ts, layerIndex);
      verifiedSlotsRef.current = new Map();
      bump();
    }
  }, [bump]);

  const handleDragCancel = useCallback(() => setActiveLayerIdx(-1), []);

  /* ── validation ── */
  const handleValidate = useCallback(() => {
    const map = slotOccupantsRef.current;
    if (map.size < layerCountRef.current) return;
    const results = new Map();
    let allOk = true;
    for (const [s, l] of map) { const ok = s === l; results.set(s, ok); if (!ok) allOk = false; }
    verifiedSlotsRef.current = results;
    bump();
    if (allOk) setTimeout(() => setDone(true), 600);
  }, [bump]);

  const handleReset = useCallback(() => {
    resetGame();
    if (nodeData?.layers) setCardOrder(shuffle(nodeData.layers.map((_, i) => i)));
  }, [resetGame, nodeData?.layers]);

  const handleNodeChange = useCallback((id) => { setResetKey((k) => k + 1); setNodeId(id); }, []);

  const draggedLayer = useMemo(() => {
    if (activeLayerIdx < 0 || !nodeData?.layers) return null;
    return nodeData.layers[activeLayerIdx] ?? null;
  }, [activeLayerIdx, nodeData?.layers]);

  const slotOccupants = slotOccupantsRef.current;
  const verifiedSlots = verifiedSlotsRef.current;
  const placedIndices = useMemo(() => new Set(slotOccupants.values()), [renderTick]); // eslint-disable-line react-hooks/exhaustive-deps
  const wrongCount = useMemo(() => [...verifiedSlots.values()].filter((v) => v === false).length, [renderTick]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  const layerCount = nodeData?.layers?.length || 0;
  const allFilled = slotOccupants.size >= layerCount;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <div className="h-screen bg-[#FAFAFA] flex flex-col relative overflow-hidden">
        {/* ── top bar ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-8 py-4 z-20">
          <div className="flex items-center gap-2">
            {nodes.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNodeChange(n.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                  nodeId === n.id
                    ? "bg-rose-500 text-white shadow-[0_2px_8px_rgba(255,61,88,0.25)]"
                    : "bg-white/70 backdrop-blur-sm text-gray-500 border border-gray-200/60 hover:border-rose-300 hover:text-gray-700"
                }`}
              >
                {n.title}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 tabular-nums tracking-wide mr-2">
              {slotOccupants.size} / {layerCount}
            </span>
          </div>
        </div>

        {/* ── main ── */}
        <div className="flex-1 flex flex-col gap-8 px-10 pb-10 min-h-0 overflow-auto">
          {/* ray area */}
          <div className="flex-shrink-0 bg-white rounded-3xl border border-gray-100/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-8">
            {nodeData && (
              <AssemblyLine
                explodeAxis={nodeData.explodeAxis || "x"}
                layers={nodeData.layers}
                slotOccupants={slotOccupants}
                verifiedSlots={verifiedSlots}
              />
            )}
          </div>

          {/* cards area */}
          <ReturnZone>
            <div className="flex flex-wrap gap-4 justify-center">
              {nodeData &&
                cardOrder.map((layerIndex) => {
                  if (placedIndices.has(layerIndex)) return null;
                  return (
                    <div key={layerIndex} className="w-52">
                      <LayerCard layer={nodeData.layers[layerIndex]} layerIndex={layerIndex} variant="bottom" />
                    </div>
                  );
                })}
            </div>
            {allFilled && (
              <p className="text-center text-gray-300 text-sm mt-8 select-none">&mdash;</p>
            )}
          </ReturnZone>

          {/* ── action buttons ── */}
          <div className="flex-shrink-0 flex items-center justify-center gap-4 pb-2">
            <button
              onClick={handleValidate}
              disabled={done}
              className={`rounded-full px-10 py-3 text-base font-medium transition-all duration-300 cursor-pointer ${
                done
                  ? "bg-green-500 text-white shadow-[0_2px_8px_rgba(34,197,94,0.2)]"
                  : !allFilled
                    ? "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                    : "bg-rose-500 text-white shadow-[0_2px_8px_rgba(255,61,88,0.2)] hover:bg-rose-600 hover:shadow-[0_4px_16px_rgba(255,61,88,0.3)]"
              }`}
            >
              {done ? (
                <span className="flex items-center gap-2"><CheckCircle2 size={18} /> 全部正确</span>
              ) : (
                "验证"
              )}
            </button>
            <button
              onClick={handleReset}
              className="rounded-full px-8 py-3 text-sm font-medium border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50 transition-all duration-300 cursor-pointer"
            >
              <span className="flex items-center gap-2"><RefreshCw size={15} /> 全部重来</span>
            </button>
          </div>

          {verifiedSlots.size > 0 && wrongCount > 0 && (
            <p className="text-xs text-gray-400 text-center -mt-6">{wrongCount} 个位置不正确</p>
          )}
        </div>

        {/* ── DragOverlay ── */}
        <DragOverlay dropAnimation={null}>
          {draggedLayer && activeLayerIdx >= 0 && (
            <div className="w-52 flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-rose-400/50 shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
              <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: draggedLayer.color || "#ff3d58" }} />
              <p className="text-sm font-normal text-gray-700 tracking-wide truncate">{draggedLayer.name}</p>
            </div>
          )}
        </DragOverlay>

        {/* ── completion modal ── */}
        <AnimatePresence>
          {done && (
            <motion.div className="absolute inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px]" onClick={handleReset} />
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", stiffness: 160, damping: 20 }}
                className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full mx-4"
              >
                <div className="mb-6 flex justify-center">
                  <CheckCircle2 size={56} className="text-rose-500" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-light text-gray-800 tracking-wide mb-2">拼装完成</h2>
                <p className="text-sm text-gray-400 font-light mb-8">{nodeData?.title}</p>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-full px-8 py-2.5 border border-gray-200 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                >
                  <RefreshCw size={15} /> 再来一局
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
