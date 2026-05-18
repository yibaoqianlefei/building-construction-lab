import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Trophy } from "lucide-react";
import { getAllNodes, loadNodeData } from "../services/nodeService";
import GameAssembleScene from "../components/game/GameAssembleScene";

function GamesPage() {
  const nodes = getAllNodes();
  const [nodeId, setNodeId] = useState(nodes[0]?.id);
  const [nodeData, setNodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!nodeId) return;
    setLoading(true);
    setDone(false);
    loadNodeData(nodeId).then((data) => {
      setNodeData(data);
      setLoading(false);
    });
  }, [nodeId]);

  const handleComplete = useCallback(() => setDone(true), []);
  const handleReset = useCallback(() => { setResetKey((k) => k + 1); setDone(false); }, []);

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gold-300 border-t-gold-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-white relative overflow-hidden">
      {/* top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          {nodes.map((n) => (
            <button
              key={n.id}
              onClick={() => setNodeId(n.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
                ${nodeId === n.id
                  ? "bg-gold-500 text-white shadow-md"
                  : "bg-white/70 backdrop-blur-sm text-gray-600 border border-gray-200/50 hover:border-gold-300"
                }`}
            >
              {n.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:inline">
            {nodeData?.title}
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-gray-200/50 text-sm text-gray-600 hover:text-gold-600 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} /> 重新挑战
          </button>
        </div>
      </div>

      {/* 3D scene */}
      <div className="absolute inset-0">
        {nodeData && (
          <GameAssembleScene
            key={resetKey}
            nodeData={nodeData}
            onComplete={handleComplete}
            resetKey={resetKey}
          />
        )}
      </div>

      {/* bottom hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-white/80 backdrop-blur-md rounded-full px-5 py-2.5 text-sm text-gray-600 shadow-lg border border-white/30">
          {done
            ? "拼装完成！点击重新挑战再来一次"
            : "拖动构件到正确位置拼装构造模型"}
        </div>
      </div>

      {/* completion modal */}
      <AnimatePresence>
        {done && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" onClick={handleReset} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="relative bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-200/50 p-10 text-center max-w-sm w-full mx-4"
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gold-50 flex items-center justify-center">
                <Trophy size={32} className="text-gold-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">拼装完成！</h2>
              <p className="text-gray-500 text-sm mb-6">
                你已经掌握了 {nodeData?.title} 的构造层次
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
  );
}

export default GamesPage;
