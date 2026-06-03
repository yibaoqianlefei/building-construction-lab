import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
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
        isOver ? "bg-primary/15" : "bg-transparent"
      }`}
      style={{ touchAction: "none" }}
    >
      {children}
    </div>
  );
}

function GamesPage() {
  const [searchParams] = useSearchParams();
  const urlNodeId = searchParams.get("nodeId");
  const nodes = nodesIndex;
  const [nodeId, setNodeId] = useState(urlNodeId || nodes[0]?.id);
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
      <div className="h-screen bg-canvas flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const layerCount = nodeData?.layers?.length || 0;
  const allFilled = slotOccupants.size >= layerCount;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <div className="h-screen bg-canvas flex flex-col relative overflow-hidden">
        {/* ── top bar ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-8 py-4 z-20">
          <div className="flex items-center gap-2">
            {nodes.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNodeChange(n.id)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                  nodeId === n.id
                    ? "bg-primary text-on-primary"
                    : "bg-surface-card text-muted border border-hairline hover:border-primary/30 hover:text-body"
                }`}
              >
                {n.title}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-soft tabular-nums tracking-wide mr-2">
              {slotOccupants.size} / {layerCount}
            </span>
          </div>
        </div>

        {/* ── main ── */}
        <div className="flex-1 flex flex-col gap-8 px-10 pb-10 min-h-0 overflow-auto">
          {/* ray area */}
          <div className="flex-shrink-0 bg-canvas rounded-xl border border-hairline shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-8">
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
              <p className="text-center text-muted-soft text-sm mt-8 select-none">&mdash;</p>
            )}
          </ReturnZone>

          {/* ── action buttons ── */}
          <div className="flex-shrink-0 flex items-center justify-center gap-4 pb-2">
            <button
              onClick={handleValidate}
              disabled={done}
              className={`rounded-lg px-10 py-3 text-base font-medium transition-all duration-300 cursor-pointer ${
                done
                  ? "bg-success text-white"
                  : !allFilled
                    ? "bg-hairline text-muted-soft shadow-none cursor-not-allowed"
                    : "bg-primary text-on-primary hover:bg-primary-active"
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
              className="rounded-lg px-8 py-3 text-sm font-medium border border-hairline text-muted hover:border-hairline hover:text-body hover:bg-surface-soft transition-all duration-300 cursor-pointer"
            >
              <span className="flex items-center gap-2"><RefreshCw size={15} /> 全部重来</span>
            </button>
          </div>

          {verifiedSlots.size > 0 && wrongCount > 0 && (
            <p className="text-xs text-muted-soft text-center -mt-6">{wrongCount} 个位置不正确</p>
          )}
        </div>

        {/* ── DragOverlay ── */}
        <DragOverlay dropAnimation={null}>
          {draggedLayer && activeLayerIdx >= 0 && (
            <div className="w-52 flex items-center gap-3 bg-canvas rounded-xl px-4 py-3 border border-primary/50 shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
              <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: draggedLayer.color || "#cc785c" }} />
              <p className="text-sm font-normal text-body tracking-wide truncate">{draggedLayer.name}</p>
            </div>
          )}
        </DragOverlay>

        {/* ── completion modal ── */}
        <AnimatePresence>
          {done && (
            <motion.div className="absolute inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/5" onClick={handleReset} />
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", stiffness: 160, damping: 20 }}
                className="relative bg-canvas rounded-xl shadow-2xl p-10 text-center max-w-sm w-full mx-4"
              >
                <div className="mb-6 flex justify-center">
                  <CheckCircle2 size={56} className="text-primary" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-normal font-serif text-ink tracking-wide mb-2">拼装完成</h2>
                <p className="text-sm text-muted-soft font-light mb-8">{nodeData?.title}</p>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-lg px-8 py-2.5 border border-hairline text-sm font-medium text-muted hover:border-hairline hover:text-body hover:bg-surface-soft transition-all duration-300 cursor-pointer"
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
