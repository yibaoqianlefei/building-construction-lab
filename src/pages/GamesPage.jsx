import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAllNodes, loadNodeData } from "../services/nodeService";
import GameModelPreview from "../components/game/GameModelPreview";
import SortChallenge from "../components/game/SortChallenge";

function GamesPage() {
  const nodes = getAllNodes();
  const [selectedId, setSelectedId] = useState(nodes[0]?.id);
  const [nodeData, setNodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setFeedback(null);
    loadNodeData(selectedId).then((data) => {
      setNodeData(data);
      setLoading(false);
    });
  }, [selectedId]);

  const { layers, explodeAxis } = nodeData || {};

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight mb-1">构造游戏</h1>
          <p className="text-gray-500 mb-8">通过游戏练习巩固构造知识</p>
        </motion.div>

        {/* node selector */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => setSelectedId(node.id)}
              className={`flex-shrink-0 px-5 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer
                ${selectedId === node.id
                  ? "border-gold-500 bg-gold-50/50 text-gold-700 shadow-sm"
                  : "bg-white/70 backdrop-blur-sm border border-gray-200/50 text-gray-600 hover:border-gray-300"
                }`}
            >
              <p>{node.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{node.category}</p>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-5 h-5 border-2 border-gold-300 border-t-gold-600 rounded-full animate-spin" />
          </div>
        ) : layers ? (
          <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
            <div className="flex-1 min-h-[380px]">
              <GameModelPreview layers={layers} feedback={feedback} explodeAxis={explodeAxis} />
            </div>
            <div className="w-full lg:w-96 flex-shrink-0 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-5">
              <SortChallenge layers={layers} onFeedback={setFeedback} />
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-20">暂无数据</p>
        )}
      </div>
    </div>
  );
}

export default GamesPage;
