import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import courseModules from "../data/courseModules";

const sectionsMap = {
  introduction: () => import("../data/sections/introSections"),
  structures: () => import("../data/sections/structureSections"),
  foundation: () => import("../data/sections/foundationSections"),
  wall: () => import("../data/sections/wallSections"),
  floor: () => import("../data/sections/floorSections"),
  stairs: () => import("../data/sections/stairsSections"),
  "door-window": () => import("../data/sections/windowSections"),
  roof: () => import("../data/sections/roofSections"),
};

function SectionSubPage() {
  const { moduleId } = useParams();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const moduleInfo = courseModules.find((m) => m.id === moduleId);

  useEffect(() => {
    const loader = sectionsMap[moduleId];
    if (!loader) { setLoading(false); return; }
    loader().then((mod) => setSections(mod.default || [])).catch(() => setSections([])).finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-5 h-5 border-2 border-gold-300 border-t-gold-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-6 md:px-10 py-10 max-w-5xl mx-auto w-full">
        <div className="mb-2">
          <span className="text-sm text-gray-400">
            <Link to="/curriculum" className="text-gold-600 hover:text-gold-700 transition-colors">课程目录</Link>
            <span className="mx-1.5 text-gray-300">›</span>
            <span className="text-gray-500">{moduleInfo?.title || moduleId}</span>
          </span>
        </div>

        <motion.div className="mb-10 mt-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{moduleInfo?.title || moduleId}</h1>
          <p className="mt-2 text-gray-500 text-base">{moduleInfo?.description || ""}</p>
        </motion.div>

        {sections.length === 0 ? (
          <div className="text-center py-20 text-gray-400"><p>暂无内容</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((sec, i) => {
              const nodeCount = (sec.nodeIds || []).length;
              const linkTarget = sec.to
                || (sec.hasTextbook ? `/textbook/${sec.id}` : null)
                || (nodeCount > 0 ? `/node/${sec.nodeIds[0]}` : null);

              if (sec.available && linkTarget) {
                return (
                  <motion.div key={sec.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}>
                    <Link to={linkTarget}
                      className="block bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-8
                        shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                        hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_20px_rgba(212,164,58,0.1)]
                        hover:-translate-y-2 hover:scale-[1.02]
                        hover:bg-white hover:border-gold-200
                        transition-all duration-300 ease-out cursor-pointer group text-left"
                    >
                      <span className="text-4xl transition-transform duration-300 ease-out group-hover:scale-110 inline-block">{sec.icon || "📄"}</span>
                      <h3 className="text-xl font-bold text-gray-900 mt-5 group-hover:text-gold-600 transition-colors tracking-tight">{sec.title}</h3>
                      <p className="text-sm text-gray-500 mt-2 leading-relaxed">{sec.description}</p>
                      {nodeCount > 0 && <span className="inline-block mt-4 text-xs font-medium text-gold-600 bg-gold-50 px-3 py-1 rounded-full">{nodeCount} 个节点</span>}
                    </Link>
                  </motion.div>
                );
              }

              return (
                <motion.div key={sec.id}
                  className="bg-gray-50/80 border border-gray-100 rounded-3xl p-8 opacity-50 cursor-default text-left"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 0.5, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
                >
                  <span className="text-4xl grayscale">{sec.icon || "📄"}</span>
                  <h3 className="text-xl font-bold text-gray-400 mt-5 tracking-tight">{sec.title}</h3>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed">{sec.description}</p>
                  <span className="inline-block mt-4 text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">即将上线</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default SectionSubPage;
